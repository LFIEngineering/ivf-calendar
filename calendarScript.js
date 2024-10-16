document.addEventListener('DOMContentLoaded', function () {
    const patientName = localStorage.getItem('patientName');
    const stimStartDateValue = localStorage.getItem('stimStartDate');
    const day11UltrasoundValue = localStorage.getItem('day11Ultrasound');

    let eventsMap = {};
    let isEditMode = false; // Track edit mode state

    if (patientName) {
        const patientNameDisplay = document.getElementById('patient-name-display');
        patientNameDisplay.textContent = `${patientName}`;

        const stimStartDate = stimStartDateValue ? new Date(stimStartDateValue + 'Z') : null;
        const day11UltrasoundDate = day11UltrasoundValue ? new Date(day11UltrasoundValue + 'Z') : null;

        const { dates, lastDate } = calculateDates(stimStartDate, day11UltrasoundDate);

        dates.forEach(date => {
            const eventDateString = date.date.toISOString().split('T')[0];
            if (!eventsMap[eventDateString]) {
                eventsMap[eventDateString] = [];
            }
            eventsMap[eventDateString].push(date.event);
        });

        generateCalendar(dates[0].date, lastDate, eventsMap);
    }

    // Handle the Edit Calendar button click
    const editSaveBtn = document.getElementById('edit-save-button');
    editSaveBtn.addEventListener('click', function () {
        isEditMode = !isEditMode; // Toggle edit mode
        editSaveBtn.textContent = isEditMode ? 'Save' : 'Edit';

        // Toggle draggable attribute for event items
        const eventItems = document.querySelectorAll('.event-item');
        eventItems.forEach(item => {
            item.setAttribute('draggable', isEditMode);
        });
    });

    function calculateDates(stimStartDate, day11UltrasoundDate) {
        const dates = [];
        if (day11UltrasoundDate && !stimStartDate) {
            stimStartDate = new Date(day11UltrasoundDate);
            stimStartDate.setUTCHours(0, 0, 0, 0);
            stimStartDate.setUTCDate(stimStartDate.getUTCDate() - 10);
        }

        if (stimStartDate) {
            stimStartDate.setUTCHours(0, 0, 0, 0);

            dates.push({
                date: stimStartDate,
                event: 'Stim Start'
            });

            const lastActiveBCPDate = new Date(stimStartDate);
            lastActiveBCPDate.setUTCDate(stimStartDate.getUTCDate() - 5);
            dates.push({
                date: lastActiveBCPDate,
                event: 'Last Active Birth Control Pill'
            });

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

            const baselineUltrasoundDate = new Date(lastActiveBCPDate);
            baselineUltrasoundDate.setUTCDate(lastActiveBCPDate.getUTCDate() + 3);
            dates.push({
                date: baselineUltrasoundDate,
                event: 'Baseline Ultrasound and Labs'
            });

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

            if (day11UltrasoundDate) {
                const day11Date = new Date(day11UltrasoundDate);
                day11Date.setUTCHours(0, 0, 0, 0);
                dates.push({
                    date: day11Date,
                    event: 'Day 11 Ultrasound'
                });
            }

            dates.sort((a, b) => a.date - b.date);
            const lastDate = dates[dates.length - 1].date;

            return { dates, lastDate };
        } else {
            console.warn('No valid start date provided for calculations.');
            return { dates, lastDate };
        }
    }

    // Function to create week element
    function createWeekElement(week, year, month, eventsMap) {
        const weekElement = document.createElement('div');
        weekElement.className = 'week d-flex';

        week.forEach(day => {
            const dayElement = createDateBox(day, year, month, eventsMap);
            weekElement.appendChild(dayElement);
        });

        return weekElement;
    }

    // Function to generate the calendar for a date range
    function generateCalendar(startDate, endDate, eventsMap) {
        const calendarElement = document.getElementById('calendar-weeks');
        calendarElement.innerHTML = ''; // Clear previous content

        let currentDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
        const lastDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

        while (currentDate <= lastDate) {
            const currentMonth = currentDate.getUTCMonth();
            const currentYear = currentDate.getUTCFullYear();

            const monthGrid = document.createElement('div');
            monthGrid.className = 'month-grid';

            const monthHeader = document.createElement('h3');
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            monthHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;
            monthGrid.appendChild(monthHeader);

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

            const firstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
            const lastDay = new Date(Date.UTC(currentYear, currentMonth + 1, 0));

            let week = [];
            for (let i = 0; i < firstDay.getUTCDay(); i++) {
                week.push(''); // Fill empty slots until the first day
            }

            for (let day = 1; day <= lastDay.getUTCDate(); day++) {
                week.push(day);
                if (week.length === 7) {
                    monthGrid.appendChild(createWeekElement(week, currentYear, currentMonth, eventsMap));
                    week = [];
                }
            }

            while (week.length < 7) {
                week.push(''); // Fill remaining empty slots for the last week
            }
            if (week.length) {
                monthGrid.appendChild(createWeekElement(week, currentYear, currentMonth, eventsMap));
            }

            calendarElement.appendChild(monthGrid);
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1); // Move to the next month
            currentDate.setUTCDate(1);
        }

        // Add event listeners for drag and drop to date boxes
        const dateBoxes = document.querySelectorAll('.date');
        dateBoxes.forEach(dateBox => {
            dateBox.addEventListener('dragover', handleDragOver);
            dateBox.addEventListener('drop', function (e) {
                handleDrop(e, dateBox);
            });
        });
    }

    function createDateBox(date, year, month, eventsMap) {
        const dateBox = document.createElement('div');
        dateBox.className = 'date flex-fill border p-3';
        dateBox.setAttribute('draggable', 'false'); // Not draggable by default

        if (date) {
            const dateNumberElement = document.createElement('span');
            dateNumberElement.className = 'date-number';
            dateNumberElement.textContent = date;

            dateBox.appendChild(dateNumberElement);

            const eventDiv = document.createElement('div');
            eventDiv.className = 'event mt-2';
            const eventDateKey = new Date(Date.UTC(year, month, date)).toISOString().split('T')[0];

            if (eventsMap[eventDateKey]) {
                eventsMap[eventDateKey].forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.textContent = event;
                    eventElement.className = 'event-item';
                    eventElement.draggable = false; // Not draggable by default

                    // Drag events
                    eventElement.addEventListener('dragstart', function (e) {
                        e.dataTransfer.setData('text/plain', event);
                        e.dataTransfer.effectAllowed = 'move';
                    });

                    eventDiv.appendChild(eventElement);
                });
            }

            dateBox.appendChild(eventDiv);
            dateBox.setAttribute('data-date', `${year}-${month + 1}-${date}`);

            // Add drag and drop events to the date box
            dateBox.addEventListener('dragover', handleDragOver);
            dateBox.addEventListener('drop', function (e) {
                handleDrop(e, eventDateKey);
            });
        }

        return dateBox;
    }

    function handleDragOver(e) {
        e.preventDefault(); // Prevent default to allow drop
    }

    function handleDrop(e, dateKey) {
        e.preventDefault(); // Prevent default behavior
    
        const event = e.dataTransfer.getData('text/plain');
        if (event) {
            const targetDate = e.currentTarget.getAttribute('data-date');
            const eventDate = new Date(targetDate);
    
            const eventDateKey = eventDate.toISOString().split('T')[0];
    
            // Initialize target date if not already present
            if (!eventsMap[eventDateKey]) {
                eventsMap[eventDateKey] = [];
            }
    
            // Check if the event already exists in the target date
            if (!eventsMap[eventDateKey].includes(event)) {
                // Add event to target date
                eventsMap[eventDateKey].push(event);
    
                // Update the UI
                const eventElement = document.createElement('div');
                eventElement.textContent = event;
                eventElement.className = 'event-item';
                e.currentTarget.querySelector('.event').appendChild(eventElement);
            }
    
            // Remove the event from the original date
            const originalDateKey = e.currentTarget.getAttribute('data-date');
            for (const key in eventsMap) {
                if (key !== eventDateKey && eventsMap[key].includes(event)) {
                    eventsMap[key] = eventsMap[key].filter(e => e !== event);
                    // Update the original event box UI
                    const originalEventBox = document.querySelector(`.date[data-date='${key}'] .event`);
                    if (originalEventBox) {
                        const eventItems = originalEventBox.querySelectorAll('.event-item');
                        eventItems.forEach(item => {
                            if (item.textContent === event) {
                                originalEventBox.removeChild(item);
                            }
                        });
                    }
                }
            }
    
            // Log the updated eventsMap to the console
            console.log('Updated Events Map:', eventsMap);
        }
    }
});
