document.addEventListener('DOMContentLoaded', function() {

    // calculates the current month and year of the current date 
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // displays the month and year in calendar.html
    const monthYearDisplay = document.getElementById('month-year-display');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    // retrieve variables from local storage 
    const patientName = localStorage.getItem('patientName');
    const stimStartDateValue = localStorage.getItem('stimStartDate');
    const day11UltrasoundValue = localStorage.getItem('day11Ultrasound');

    if (patientName) {  

        // display the patient name in calendar.html
        const patientNameDisplay = document.getElementById('patient-name-display');
        patientNameDisplay.textContent = `${patientName}`;

        // checks if the stim start date and/or day 11 ultrasound date was provided -> if so, a date object is created 
        const stimStartDate = stimStartDateValue ? new Date(stimStartDateValue) : null;
        const day11UltrasoundDate = day11UltrasoundValue ? new Date(day11UltrasoundValue) : null;

        // calculate the rest of the key events based on the stim start date or day 11 ultrasound date
        const dates = calculateDates(stimStartDate, day11UltrasoundDate);

        // map out the rest of the events 
        const eventsMap = {};
        dates.forEach(date => {
            const eventDateString = date.date.toISOString().split('T')[0]; // format date as YYYY-MM-DD
            if (!eventsMap[eventDateString]) {
                eventsMap[eventDateString] = []; // initialize if not present
            }
            eventsMap[eventDateString].push(date.event); // add event to the event map
        });

        // ensure that all events are correct 
        console.log(eventsMap);

        // get the first and last days of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // create an array to hold the weeks
        const weeks = [];

        // fill in the weeks
        let week = [];
        let dayCounter = 1;

        // Add empty days for the start of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            week.push('');
        }

        // fill in the days of the month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            week.push(i);
            if (week.length === 7) {
                weeks.push(week);
                week = []; // reset for the next week
            }
        }

        // add empty days for the end of the month
        while (week.length < 7) {
            week.push('');
        }
        if (week.length) {
            weeks.push(week);
        }

        // retrieve empty calendar div to populate
        const calendarElement = document.getElementById('calendar-weeks');

        // ppulate the calendar div
        weeks.forEach((week) => {
            const weekElement = document.createElement('div');
            weekElement.className = 'week d-flex';

            week.forEach((day) => {
                const dayElement = document.createElement('div');
                dayElement.className = 'date flex-fill border p-3';
                
                if (day) {
                    // create a span for the date number
                    const dateNumberElement = document.createElement('span');
                    dateNumberElement.className = 'date-number';
                    dateNumberElement.textContent = day;

                    // append date number to datebox div
                    dayElement.appendChild(dateNumberElement);

                    // create a div for the events
                    const dateEventsElement = document.createElement('div');
                    dateEventsElement.className = 'date-events';
                    
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // create date string YYYY-MM-DD
                    if (eventsMap[dateString]) {
                        dateEventsElement.innerHTML = eventsMap[dateString].join('<br>'); // display events for that day
                    }
                    // append event to datebox div
                    dayElement.appendChild(dateEventsElement);
                }

                // append day element to week div
                weekElement.appendChild(dayElement);
            });

            // append week element to calendar
            calendarElement.appendChild(weekElement);
        });
    }

    // function calculates the rest of the key events based on the stim start date or day 11 ultrasound dates 
    function calculateDates(stimStartDate, day11UltrasoundDate) {
        const dates = [];
    
        // calculate the stim start date based on input
        if (day11UltrasoundDate && !stimStartDate) {
            stimStartDate = new Date(day11UltrasoundDate);
            stimStartDate.setUTCHours(0, 0, 0, 0);
            stimStartDate.setUTCDate(stimStartDate.getUTCDate() - 10); // calculate stim start date based on day 11 ultrasound date
        }
    
        if (stimStartDate) {

            stimStartDate.setUTCHours(0, 0, 0, 0);

            // Stim Start
            dates.push({
                date: stimStartDate,
                event: 'Stim Start'
            });
    
            // Last Active Birth Control Pill - 5 days before stim start
            const lastActiveBCPDate = new Date(stimStartDate);
            lastActiveBCPDate.setUTCDate(stimStartDate.getUTCDate() - 5);
            dates.push({
                date: lastActiveBCPDate,
                event: 'Last Active Birth Control Pill'
            });
    
            // Anticipated Bleed - 0-2 days after the last active birth control pill
            const anticipatedBleedStartDate = new Date(lastActiveBCPDate);
            anticipatedBleedStartDate.setUTCDate(lastActiveBCPDate.getUTCDate());
            const anticipatedBleedEndDate = new Date(lastActiveBCPDate);
            anticipatedBleedEndDate.setUTCDate(lastActiveBCPDate.getUTCDate() + 2);
            dates.push({
                date: anticipatedBleedStartDate,
                event: 'Anticipated Bleed Start'
            });
            dates.push({
                date: anticipatedBleedEndDate,
                event: 'Anticipated Bleed End'
            });
    
            // Baseline Ultrasound and Labs - 3 days after the last active birth control pill
            const baselineUltrasoundDate = new Date(lastActiveBCPDate);
            baselineUltrasoundDate.setUTCDate(lastActiveBCPDate.getUTCDate() + 3);
            dates.push({
                date: baselineUltrasoundDate,
                event: 'Baseline Ultrasound and Labs'
            });
    
            // Possible Antagonist Start - 4-5 days after stim start
            const antagonistStartDate = new Date(stimStartDate);
            antagonistStartDate.setUTCDate(stimStartDate.getUTCDate() + 4);
            const antagonistEndDate = new Date(stimStartDate);
            antagonistEndDate.setUTCDate(stimStartDate.getUTCDate() + 5);
            dates.push({
                date: antagonistStartDate,
                event: 'Antagonist Start'
            });
            dates.push({
                date: antagonistEndDate,
                event: 'Antagonist End Date'
            });
    
            // Egg Retrieval - 12-14 days after stim start
            const eggRetrievalStartDate = new Date(stimStartDate);
            eggRetrievalStartDate.setUTCDate(stimStartDate.getUTCDate() + 12);
            const eggRetrievalEndDate = new Date(stimStartDate);
            eggRetrievalEndDate.setUTCDate(stimStartDate.getUTCDate() + 14);
            dates.push({
                date: eggRetrievalStartDate,
                event: 'Egg Retrieval Start Date'
            });
            dates.push({
                date: eggRetrievalEndDate,
                event: 'Egg Retrieval End Date'
            });
    
            // Day 11 Ultrasound
            if (day11UltrasoundDate) {
                dates.push({
                    date: new Date(day11UltrasoundDate),
                    event: 'Day 11 Ultrasound'
                });
            }
        } else {
            console.warn('No valid start date provided for calculations.');
        }
    
        // log the dates for accuracy 
        dates.forEach(({ date, event }) => {
            console.log(`${event}: ${date.toISOString()}`);
        });
    
        return dates;
    }

    const notesInput = document.getElementById('notes');
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notesInput.value = savedNotes; // set the textarea value to saved notes
    }

    // handles save button functionality
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const notesValue = notesInput.value;
            localStorage.setItem('notes', notesValue); // save the notes in localStorage
            alert('Notes saved!'); // alert the user
        });
    }

    // handles print button functionality
    const printButton = document.getElementById('print-button');
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }

});