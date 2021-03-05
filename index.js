/*
  Produced 2019-2021
  By https://amattu.com/links/github
  Copy Alec M.
  License GNU Affero General Public License v3.0
*/

/* Setup basic calendar */
buildCalendar();

/* Setup Click Events */
document.getElementById('date-today').onclick = function() {
  // Variables
  let currentDate = moment();

  // Build calendar
  buildCalendar(currentDate);
};
document.getElementById('date-forward').onclick = function() {
  // Variables
  let currentDateElement = document.getElementById('current-date');
  let currentDate = moment(currentDateElement.dataset.date, "YYYY-MM-DD", true);
  currentDate = (currentDate.isValid() ? currentDate : moment()).add(1, "month");

  // Build calendar
  buildCalendar(currentDate);
};
document.getElementById('date-backward').onclick = function() {
  // Variables
  let currentDateElement = document.getElementById('current-date');
  let currentDate = moment(currentDateElement.dataset.date, "YYYY-MM-DD", true);
  currentDate = (currentDate.isValid() ? currentDate : moment()).add(-1, "month");

  // Build calendar
  buildCalendar(currentDate);
};

/**
 * Get Days of Month
 *
 * @param {number} [year=2021]
 * @param {number} [month=0]
 * @return {[type]} Array of objects
 * @author Alec M. <https://amattu.com>
 * @date 2021-02-27T09:15:41-050
*/
function getDaysArray(year = 2021, month = 0) {
  // Variables
  const monthIndex = month;
  const date = new Date(year, monthIndex, 1);
  const result = [];

  // Loops
  while (date.getMonth() == monthIndex) {
    result.push({"month_day": date.getDate(), "week_day": date.getDay(), "date_object": new Date(date)});
    date.setDate(date.getDate() + 1);
  }

  // Return
  return result;
}

/**
 * Build visual calendar
 *
 * @param {Momentjs} [date=moment()]
 * @return {Void} No return
 * @author Alec M. <https://amattu.com>
 * @date 2021-02-27T09:16:16-050
*/
function buildCalendar(date = moment()) {
  // Variables
  let fragment = document.createDocumentFragment();
  let dateObject = getDaysArray(date.isoWeekYear(), date.month());

  // Loop
  (Object.values(dateObject) || []).forEach(function(date, index) {
    // Variables
    let div = document.createElement('div');
    let momentObject = moment(date.date_object);

    // Attributes
    div.classList.add('calendar-row-day');
    div.textContent = date.month_day;
    div.onclick = function(e) {
      console.log(date);
    };

    // Checks
    if (index == 0) {
      div.style.gridColumn = date.week_day + 1;
    }
    if (momentObject.isoWeekYear() == moment().isoWeekYear() &&
          momentObject.month() == moment().month() &&
              date.month_day == moment().date()) {
      div.classList.add('active');
    }

    // Append
    fragment.appendChild(div);
  });


  // Append
  document.getElementById('current-date').dataset.date = date.format("YYYY-MM-DD");
  document.getElementById('current-date').innerText = date.format("MMM Do YYYY");
  document.getElementById('current-month').innerText = date.format("MMMM, YYYY");
  document.getElementById('calendar-days').innerHTML = '';
  document.getElementById('calendar-days').appendChild(fragment);
}

/**
 * Get Appointments By Date
 *
 * @param {moment} moment object
 * @return {bool} result
 * @throws None
 * @author Alec M. <https://amattu.com>
 * @date 2021-02-05T07:49:12-050
*/
function getAppointments(date = moment()) {
  // Checks
  if (typeof(date) !== "string") { return false; }
  if (!moment(date, "YYYY-MM-DD", true).isValid()) { date = moment().format("YYYY-MM-DD"); }

  // Variables
  let request = new XMLHttpRequest();
  let form = new FormData();
  let response = "";

  // Attributes
  form.append("key", "");
  form.append("function", "fetchAppointments");
  form.append("detail", 1);
  form.append("date", date);
  request.open("GET", "http://localhost/api/v1/calendar.php?" + (new URLSearchParams(form)).toString(), true);
  request.onreadystatechange = function() {
    // Checks
    if (request.readyState !== 4) { return false; }
    if (request.status == 200) { response = JSON.parse(request.responseText); }
    if (!response || !response.data || Object.keys(response.data).length <= 0) { return false; }

    // Variables
    let providers = [];
    let times = [];
    let appointments = response.data;
    let fragment = document.createDocumentFragment();
    let fragment2 = document.createDocumentFragment();
    let fragment3 = document.createDocumentFragment();

    // Loops
    for (let i = 0; i < Object.keys(appointments).length; i++) {
      // Variables
      let appointment = appointments[Object.keys(appointments)[i]];
      let div = document.createElement('div');
      let time = moment(appointment.AppTime, "HH:mm:ss");
      let hourFormatted = time.format("HH");

      // Checks
      if (!providers.includes(appointment.AppProviderID)) { providers.push(appointment.AppProviderID); }
      if (!times.includes(hourFormatted)) { times.push(hourFormatted); }

      // Attributes
      div.classList.add('card-2');
      div.dataset.filterProvider = appointment.AppProviderID;
      div.innerHTML = `<div class="card-title">${(appointment.FirstName.trim() + " " + appointment.LastName.trim()).trim()}</div><div class="card-content">${appointment.ModYear} ${appointment.Make.trim()} ${appointment.Model.trim()} <br> ${appointment.ServiceLabel.trim()}</div>`;

      // Append
      fragment.appendChild(div);
    }
    for (let i = 0; i < providers.length; i++) {
      // Variables
      let option = document.createElement('option');
      let provider = providers[i];

      // Attributes
      option.value = provider;
      option.innerText = `Employee ID #${provider}`;

      // Append
      fragment2.appendChild(option);
    }
    for (let i = 0; i < times.length; i++) {
      // Variables
      let div = document.createElement('div');
      let time = times[i];
      let timeM = moment(time, "HH");

      // Attributes
      div.classList.add('timeline-item');
      div.innerHTML = `<div class="timeline-item-line"></div><div class="timeline-item-time">${timeM.format("ha")}</div>`;

      // Append
      fragment3.appendChild(div);
    }

    // Events
    document.getElementById('employee-filter').onchange = function() {
      // UI
      document.querySelectorAll('#upcoming-cards .card-2').forEach(function(e) {
        // Checks
        if (parseInt(document.getElementById('employee-filter').value) == 0) {
          e.style.display = 'block';
          return false;
        }
        if (!e.dataset.filterProvider || parseInt(e.dataset.filterProvider) !== parseInt(document.getElementById('employee-filter').value)) {
          e.style.display = 'none';
        } else {
          e.style.display = 'block';
        }
      });
    };

    // Append
    document.getElementById('employee-filter').innerHTML = '<option value="0">All employees</option>';
    document.getElementById('employee-filter').appendChild(fragment2);
    document.getElementById('upcoming-cards').innerHTML = '';
    document.getElementById('upcoming-cards').appendChild(fragment);
    document.getElementById('upcoming-timeline').innerHTML = '';
    document.getElementById('upcoming-timeline').appendChild(fragment3);
  };

  // Send
  request.send(form);
}
