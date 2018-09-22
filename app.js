import { MDCRipple } from '@material/ripple';
import { MDCTextField } from '@material/textfield';
import { MDCSnackbar } from '@material/snackbar';

var _snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

$(document).ready(function () {
  GuestCount.init(0);
  SelectedDate.init();

  // Instantiate the MDC components
  new MDCRipple(document.querySelector('.btnSave'));
  new MDCRipple(document.querySelector('.btnGuestdec'));
  new MDCRipple(document.querySelector('.btnGuestinc'));
  new MDCTextField(document.querySelector('.selectedDate'));

  // Load the data
  loadData();
});

// EVENT HANDLERS
// -----------------------------------------------
$("#btnPageup").click(function (event) {
  event.preventDefault();
  $('html,body').animate({ scrollTop: $("#top").offset().top }, 'slow');
});

$("#btnPagedown").click(function (event) {
  event.preventDefault();
  $('html,body').animate({ scrollTop: $("#bottom").offset().top }, 'slow');
});

$("#btnGuestinc").click(function (event) {
  GuestCount.add();
});

$("#btnGuestdec").click(function (event) {
  GuestCount.minus();
});

// $("#btnSave").click(function (event) {
//   // Get selected users on list
//   var selected = [];
//   $(".mdc-checkbox input:checked").each(function () {
//     var id = $(this).attr("id");//.slice(3);
//     var name = $(this).closest('li').find('label').text();
//     selected.push({ id: id, name: name });
//   });

//   // Setup the object to save
//   var total = GuestCount.get() + selected.length;
//   var attendance = {
//     week: SelectedDate.get(),
//     guests: GuestCount.get(),
//     total: total,
//     members: selected
//   };
//   saveData(attendance);
// });
// -----------------------------------------------

var GuestCount = (function () {
  var count = 0;
  function draw() {
    $("#guestCount").html(count);
  }
  return {
    init: function (value) {
      if (value) {
        count = value;
      }
      draw();
    },
    add: function () {
      count++;
      draw();
    },
    minus: function () {
      if (count > 0) {
        count--;
      }
      draw();
    },
    get: function () {
      return count;
    }
  }
})();

var SelectedDate = (function () {
  var now = new Date();
  var day = ("0" + now.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);
  var todaydate = now.getFullYear() + "-" + (month) + "-" + (day);
  function draw(date) {
    $("#selectedDate").val(date);
  }
  return {
    init: function () {
      draw(todaydate);
    },
    set: function (value) {
      draw(value);
    },
    get: function () {
      return $("#selectedDate").val();
    },
    today: function () {
      return todaydate;
    }
  }
})();

function loadData() {
  drawPlaceholder();
  $.ajax({
    url: 'https://script.google.com/macros/s/URL/exec?list=true',
    type: "get",
    dataType: "json",
    success: function (data, textStatus, jqXHR) {
      // sort then draw
      data.sort(function (a, b) {
        //return a.firstname > b.firstname ? 1 : a.firstname < b.firstname ? -1 : 0;
        return a.lastname > b.lastname ? 1 : a.lastname < b.lastname ? -1 : 0;
      });
      drawData(data);
      $("#progressbar").hide();
      $("#datefield").show();
      $("#savebutton").show();
      $("#guest").show();
      $("#people li.placeholderRow").remove();
    },
    error: function (msg) {
      alert(msg.responseText);
    }
  });
}

function drawData(data) {
  // Check if data state already stored
  var store = localStorage.getItem("chdir");
  var members = [];
  if (store) {
    var storedata = JSON.parse(store);

    // Only load stored data if from today
    if (SelectedDate.today() == storedata.week) {
      GuestCount.init(storedata.guests);
      if (storedata.members) {
        members = storedata.members.map(function (member) {
          return member.id;
        });
      }
    }
  }

  $.each(data, function (index, item) {
    var checked = members.indexOf(item.pid.toString()) > -1 ? "checked" : "";
    var person = $(`
      <li class="mdc-list-item checkbox-list-ripple-surface">
      <span class="mdc-list-item__graphic" role="presentation">
        <i class="material-icons">how_to_reg</i>
      </span>
      <span class="mdc-list-item__text">
        <label for="${item.pid}">${item.firstname} ${item.lastname}</label>
      </span>
      <span class="mdc-list-item__meta">
        <div class="mdc-checkbox">
          <input type="checkbox" class="mdc-checkbox__native-control" id="${item.pid}" ${checked}/>
          <div class="mdc-checkbox__background">
            <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
              <path class="mdc-checkbox__checkmark-path" fill="none" stroke="white" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
            </svg>
            <div class="mdc-checkbox__mixedmark"></div>
          </div>
        </div>
      </span>
      </li>
      `);
    $("#people").append(person);
  });
}

function drawPlaceholder() {
  $("#progressbar").show();
  $("#datefield").hide();
  $("#savebutton").hide();
  $("#guest").hide();
  var placeholder = `
  <li class="mdc-list-item checkbox-list-ripple-surface placeholderRow">
    <span class="mdc-list-item__text">
        <div class="placeholderCell placeholderTypeA"></div>
    </span>
    <span class="mdc-list-item__text">
        <div class="placeholderCell placeholderTypeB"></div>
    </span>
    <span class="mdc-list-item__meta">
        <div class="placeholderCell placeholderTypeC"></div>
    </span>
  </li>`;
  var list = placeholder.toString().repeat($(window).height() / 70);
  $("#people").append(list);
}

// function saveData(data) {
//   $("#progressbar").show();
//   $("#top :input").attr("disabled", true);

//   $.post({
//     url: 'https://script.google.com/macros/s/URL/exec',
//     type: "post",
//     dataType: "json",
//     data: data,
//     success: function (data, textStatus, jqXHR) {
//       $("#progressbar").hide();
//       $("#top :input").attr("disabled", false);

//       // Store to localstore if today
//       if (SelectedDate.today() == SelectedDate.get()) {
//         localStorage.setItem("chdir", JSON.stringify(data));
//       }

//       const result = { message: `Saved ${data.total} attendees for ${data.week}`, timeout: 5000 };
//       _snackbar.show(result);
//     },
//     error: function (msg) {
//       alert(msg.responseText);
//     }
//   });
// }

// Export functions to be accessible outside this bundle
module.exports = {
  GuestCount: GuestCount,
  SelectedDate: SelectedDate,
  SnackBar: _snackbar
};