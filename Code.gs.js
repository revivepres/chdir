function doGet(request) {
  Logger.log("Request Recieved: " + request);
  if (request.parameter && request.parameter.list) {
    var ss = SpreadsheetApp.openById("1y9twuw3jdZtZhY_bu83EGWwp-mwtzM4cN_wY3RagKNo");
    var sheet = ss.getSheetByName("Roster");
    var range = sheet.getDataRange();
    var values = range.getValues();
    var headers = values.shift().map(function (header) { return normalizeName(header); })

    // Ignore blank rows
    var filtered = values.filter(function (row) {
      if (row[3] && row[4]) { return true; }
      return false;
    });

    // Map rows to JSON
    var data = filtered.map(function (row) {
      var reducedRow = row.reduce(function (accum, value, index, arr) {
        accum[headers[index]] = value;
        if (index >= 4) {
          arr.splice(1); // break iteration
        }
        return accum;
      }, {});
      return reducedRow;
    });

    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  } else {
    return HtmlService.createTemplateFromFile("index").evaluate().setTitle("RPC - Attendance");
  }
}

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).getRawContent();
}

function save(data) {
  Logger.log("Saving: " + JSON.stringify(data));
  if (data && data.members.length > 0) {
    var week = data.week;
    var guests = data.guests;
    var total = data.total;
    var members = data.members;

    var ss = SpreadsheetApp.openById("1sWZD309C7cPL7zoESgmj5dUTdsRoF0dpMVh5eKkw12M");
    var sheet = ss.getSheetByName("Weekly");
    var range = sheet.getRange("A:A");
    var values = range.getValues();

    // clear out the sheet for given week
    if (values) {
      for (var i = values.length - 1; i >= 0; i--) {
        var value = new Date(values[0, i]);
        if (!isNaN(value) && week) {
          var day = ("0" + value.getDate()).slice(-2);
          var month = ("0" + (value.getMonth() + 1)).slice(-2);
          var date = value.getFullYear() + "-" + (month) + "-" + (day);
          if (date == week) {
            sheet.deleteRow(i + 1);
          }
        }
      }
    }

    // Add guest and member rows
    var attendees = [];
    for (var g = 0; g < guests; g++) {
      attendees.push([week, 0, "Guest"]);
    }
    if (members) {
      members.forEach(function (member) {
        attendees.push([week, member.id, member.name]);
      });
    }

    // Append to sheet
    sheet.getRange(sheet.getLastRow() + 1, 1, attendees.length, attendees[0].length).setValues(attendees);
    return "Saved " + total + " attendees for " + week;
  }
  return "ERROR! Nothing to save!";
}

function normalizeName(name) {
  return name.toLowerCase().replace(/ /g, '').replace(/[^a-z0-9_-]/g, '');
}