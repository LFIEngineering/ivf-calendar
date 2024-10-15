document.addEventListener('DOMContentLoaded', function () {

    // retrieve variables from local storage 
    const patientName = localStorage.getItem('patientName');
    const stimStartDateValue = localStorage.getItem('stimStartDate');
    const day11UltrasoundValue = localStorage.getItem('day11Ultrasound');

    if (patientName) {
        // Display the patient name in calendar.html
        const patientNameDisplay = document.getElementById('patient-name-display');
        patientNameDisplay.textContent = `${patientName}`;
    
        // Check if the stim start date and/or day 11 ultrasound date was provided
        const stimStartDate = stimStartDateValue ? new Date(stimStartDateValue + 'Z') : null;
        const day11UltrasoundDate = day11UltrasoundValue ? new Date(day11UltrasoundValue + 'Z') : null;
    
        // Calculate the rest of the key events based on the stim start date or day 11 ultrasound date
        const { dates, lastDate } = calculateDates(stimStartDate, day11UltrasoundDate);
    
        // Map out the rest of the events 
        const eventsMap = {};
        dates.forEach(date => {
            const eventDateString = date.date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            if (!eventsMap[eventDateString]) {
                eventsMap[eventDateString] = []; // Initialize if not present
            }
            eventsMap[eventDateString].push(date.event); // Add event to the event map
        });
    
        // Generate the calendar for the full range of dates
        generateCalendar(dates[0].date, lastDate, eventsMap);
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
                const day11Date = new Date(day11UltrasoundDate);
                day11Date.setUTCHours(0, 0, 0, 0); // Ensure it's in UTC
                dates.push({
                    date: day11Date,
                    event: 'Day 11 Ultrasound'
                });
            }

            // Last date calculation
            dates.sort((a, b) => a.date - b.date); // Sort dates
            const lastDate = dates[dates.length - 1].date; // Get the last date

            return { dates, lastDate };
        } else {
            console.warn('No valid start date provided for calculations.');
            return { dates, lastDate };
        }
    }

    // Function generates the calendar for a date range
    function generateCalendar(startDate, endDate, eventsMap) {
        const calendarElement = document.getElementById('calendar-weeks');
        calendarElement.innerHTML = ''; // Clear previous content

        console.log('Received Start Date:', startDate); // Log the start date input
        console.log('Received End Date:', endDate); // Log the end date input

        // Create UTC dates directly from startDate and endDate
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        // Create UTC dates using UTC components
        let currentDate = new Date(Date.UTC(startDateObj.getUTCFullYear(), startDateObj.getUTCMonth(), startDateObj.getUTCDate()));
        const lastDate = new Date(Date.UTC(endDateObj.getUTCFullYear(), endDateObj.getUTCMonth(), endDateObj.getUTCDate()));

        // Ensure time is set to UTC midnight
        currentDate.setUTCHours(0, 0, 0, 0);
        lastDate.setUTCHours(0, 0, 0, 0);

        console.log('Initial Current Date:', currentDate.toISOString()); // Log the initial current date
        console.log('Initial Last Date:', lastDate.toISOString()); // Log the initial last date

        while (currentDate <= lastDate) {
            // Log current date in UTC
            console.log('Current Date:', currentDate.toISOString());
            console.log('Last Date:', lastDate.toISOString());

            const currentMonth = currentDate.getUTCMonth(); // Get the current month in UTC
            const currentYear = currentDate.getUTCFullYear(); // Get the current year in UTC

            // Create a grid for the month
            const monthGrid = document.createElement('div');
            monthGrid.className = 'month-grid';

            const monthHeader = document.createElement('h3');
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            monthHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;
            monthGrid.appendChild(monthHeader);

            // Create a div for the days of the week header
            const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const weekdaysHeader = document.createElement('div');
            weekdaysHeader.className = 'weekdays d-flex';
            weekdays.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.className = 'flex-fill text-center font-weight-bold p-2';
                dayElement.textContent = day;
                weekdaysHeader.appendChild(dayElement);
            });
            monthGrid.appendChild(weekdaysHeader);

            // Get the first and last day of the current month in UTC
            const firstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
            const lastDay = new Date(Date.UTC(currentYear, currentMonth + 1, 0));

            // Fill in the week structure
            let week = [];
            // Add empty days for the start of the month
            for (let i = 0; i < firstDay.getUTCDay(); i++) {
                week.push(''); // Fill empty slots until the first day
            }

            // Fill in the days of the month
            for (let day = 1; day <= lastDay.getUTCDate(); day++) {
                week.push(day); // Add the day to the week
                if (week.length === 7) {
                    // Once we have 7 days, create a week element
                    monthGrid.appendChild(createWeekElement(week, currentYear, currentMonth, eventsMap));
                    week = []; // Reset for the next week
                }
            }

            // Add any remaining days in the week
            while (week.length < 7) {
                week.push(''); // Fill in the remaining empty slots for the last week
            }
            if (week.length) {
                monthGrid.appendChild(createWeekElement(week, currentYear, currentMonth, eventsMap));
            }

            calendarElement.appendChild(monthGrid);

            // Move to the next month
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1); // Increment month
            currentDate.setUTCDate(1); // Reset date to the first of the month in UTC

            console.log('Updated Current Date:', currentDate.toISOString()); // Log the updated current date
        }
    }

    // function creates a week element
    function createWeekElement(week, year, month, eventsMap) {
        const weekElement = document.createElement('div');
        weekElement.className = 'week d-flex';

        week.forEach(day => {
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

        return weekElement;
    }

    const notesInput = document.getElementById('notes');
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notesInput.value = savedNotes; // set the textarea value to saved notes
    }

    // handles save button functionality
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', function () {
            const notesValue = notesInput.value;
            localStorage.setItem('notes', notesValue); // save the notes in localStorage
            alert('Notes saved!'); // alert the user
        });
    }

    // handles print button functionality
    const printButton = document.getElementById('print-button');
    if (printButton) {
        printButton.addEventListener('click', function () {
            window.print();
        });
    }
});
