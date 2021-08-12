/*
  Produced 2019-2021
  By https://amattu.com/links/github
  Copy Alec M.
  License GNU Affero General Public License v3.0
*/

/* Setup basic calendar */
buildCalendar();

/* Events */
document.getElementById('date-today').onclick = () => {
  // Variables
  let currentDate = moment();

  // Build calendar
  buildCalendar(currentDate);
};
document.getElementById('date-forward').onclick = () => {
  // Variables
  const currentDateElement = document.getElementById('current-date');
  let currentDate = moment(currentDateElement.dataset.date, "YYYY-MM-DD", true);
  currentDate = (currentDate.isValid() ? currentDate : moment()).add(1, "day");

  // Build calendar
  buildCalendar(currentDate);
};
document.getElementById('date-backward').onclick = () => {
  // Variables
  const currentDateElement = document.getElementById('current-date');
  let currentDate = moment(currentDateElement.dataset.date, "YYYY-MM-DD", true);
  currentDate = (currentDate.isValid() ? currentDate : moment()).add(-1, "day");

  // Build calendar
  buildCalendar(currentDate);
};
document.getElementById('employee-filter').onchange = (e) => {
  // Variables
  const value = parseInt(e.target.value);

  // UI
  document.querySelectorAll('#upcoming-cards .card-2').forEach((e) => {
    // Checks
    if (value === 0) {
      e.style.display = 'block';
      return false;
    }
    if (!e.dataset.employee || parseInt(e.dataset.employee) !== value) {
      e.style.display = 'none';
    } else {
      e.style.display = 'block';
    }
  });
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
    // Add date to array
    result.push({
      "month_day": date.getDate(),
      "week_day": date.getDay(),
      "date_object": new Date(date)
    });

    // Push date forward
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
function buildCalendar(specifiedDate = moment()) {
  // Variables
  const fragment = document.createDocumentFragment();
  const dateObject = getDaysArray(specifiedDate.isoWeekYear(), specifiedDate.month());

  // Loop
  (Object.values(dateObject) || []).forEach(function(date, index) {
    // Variables
    const div = document.createElement('div');
    const momentObject = moment(date.date_object);

    // Attributes
    div.classList.add('calendar-row-day');
    div.textContent = date.month_day;
    div.onclick = (e) => {
      buildCalendar(momentObject);
    };

    // Checks
    if (index === 0) {
      div.style.gridColumn = date.week_day + 1;
    }
    if (momentObject.isoWeekYear() == specifiedDate.isoWeekYear() &&
          momentObject.month() == specifiedDate.month() &&
            date.month_day == specifiedDate.date()) {
      div.classList.add('active');
    }

    // Append
    fragment.appendChild(div);
  });


  // Append
  document.getElementById('current-date').dataset.date = specifiedDate.format("YYYY-MM-DD");
  document.getElementById('current-date').innerText = specifiedDate.format("MMM Do, YYYY");
  document.getElementById('current-month').innerText = specifiedDate.format("MMMM, YYYY");
  document.getElementById('calendar-days').innerHTML = '';
  document.getElementById('calendar-days').appendChild(fragment);

  // Fetch Appointments
  getAppointments();
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
function getAppointments() {
  // Variables
  let times = [];
  let appointments = data.data.Appointments.sort((a, b) => {
    return moment(a.Time, "HH:mm:ss").unix() - moment(b.Time, "HH:mm:ss").unix();
  });
  let fragment = document.createDocumentFragment();
  let fragment2 = document.createDocumentFragment();
  let fragment3 = document.createDocumentFragment();

  // Loops
  for (let i = 0; i < appointments.length; i++) {
    // Variables
    let appointment = appointments[i];
    let div = document.createElement('div');
    let time = moment(appointment.Time, "HH:mm:ss");
    let hourFormatted = time.format("HH");

    // Checks
    if (!times.includes(hourFormatted)) {
      times.push(hourFormatted);
    }

    // Attributes
    div.classList.add('card-2');
    div.dataset.employee = appointment.EmployeeID;
    div.innerHTML = `<div class="card-title">${appointment.Name}</div><div class="card-content">${appointment.Comment}</div>`;

    // Append
    fragment.appendChild(div);
  }
  data.data.Employees.forEach((provider) => {
    // Variables
    let option = document.createElement('option');

    // Attributes
    option.value = provider.ID;
    option.innerText = provider.Name;

    // Append
    fragment2.appendChild(option);
  });
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

  // Append
  document.getElementById('employee-filter').innerHTML = '<option value="0">All</option>';
  document.getElementById('employee-filter').appendChild(fragment2);
  document.getElementById('upcoming-cards').innerHTML = '';
  document.getElementById('upcoming-cards').appendChild(fragment);
  document.getElementById('upcoming-timeline').innerHTML = '';
  document.getElementById('upcoming-timeline').appendChild(fragment3);
}
