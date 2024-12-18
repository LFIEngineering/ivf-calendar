document.addEventListener('DOMContentLoaded', function () {
    const patientName = localStorage.getItem('patientName');
    const stimStartDateValue = localStorage.getItem('stimStartDate');
    const day11UltrasoundValue = localStorage.getItem('day11Ultrasound');

    let eventsMap = {};
    let isEditing = false; // Flag to track editing mode
    let startDate = null; // Track the start date for calendar generation
    let lastDate = null; // Track the last date for calendar generation
    let draggedEvent = null; // Store the dragged event details

    if (patientName) {
        const patientNameDisplay = document.getElementById('patient-name-display');
        patientNameDisplay.textContent = `${patientName}`;

        const stimStartDate = stimStartDateValue ? new Date(stimStartDateValue + 'Z') : null;
        const day11UltrasoundDate = day11UltrasoundValue ? new Date(day11UltrasoundValue + 'Z') : null;

        const { dates } = calculateDates(stimStartDate, day11UltrasoundDate);

        dates.forEach(date => {
            const eventDateString = date.date.toISOString().split('T')[0];
            if (!eventsMap[eventDateString]) {
                eventsMap[eventDateString] = [];
            }
            eventsMap[eventDateString].push(date.event);
        });

        startDate = dates[0].date; // Set the start date for the calendar
        lastDate = dates[dates.length - 1].date; // Set the last date for the calendar
        generateCalendar(startDate, lastDate, eventsMap);
    }

    function calculateDates(stimStartDate, day11UltrasoundDate) {
        const dates = [];
        if (day11UltrasoundDate && !stimStartDate) {
            stimStartDate = new Date(day11UltrasoundDate);
            stimStartDate.setUTCHours(0, 0, 0, 0);
            stimStartDate.setUTCDate(stimStartDate.getUTCDate() - 10);
        }

        if (stimStartDate) {
            stimStartDate.setUTCHours(0, 0, 0, 0);
            dates.push({ date: stimStartDate, event: 'Stim Start' });
            const lastActiveBCPDate = new Date(stimStartDate);
            lastActiveBCPDate.setUTCDate(stimStartDate.getUTCDate() - 5);
            dates.push({ date: lastActiveBCPDate, event: 'Last Active Birth Control Pill' });

            const anticipatedBleedStartDate = new Date(lastActiveBCPDate);
            anticipatedBleedStartDate.setUTCDate(lastActiveBCPDate.getUTCDate());
            const anticipatedBleedEndDate = new Date(lastActiveBCPDate);
            anticipatedBleedEndDate.setUTCDate(lastActiveBCPDate.getUTCDate() + 2);
            dates.push({ date: anticipatedBleedStartDate, event: 'Anticipated Bleed Start' });
            dates.push({ date: anticipatedBleedEndDate, event: 'Anticipated Bleed End' });

            const baselineUltrasoundDate = new Date(lastActiveBCPDate);
            baselineUltrasoundDate.setUTCDate(lastActiveBCPDate.getUTCDate() + 3);
            dates.push({ date: baselineUltrasoundDate, event: 'Baseline Ultrasound' });

            const antagonistStartDate = new Date(stimStartDate);
            antagonistStartDate.setUTCDate(stimStartDate.getUTCDate() + 4);
            const antagonistEndDate = new Date(stimStartDate);
            antagonistEndDate.setUTCDate(stimStartDate.getUTCDate() + 5);
            dates.push({ date: antagonistStartDate, event: 'Antagonist Start' });
            dates.push({ date: antagonistEndDate, event: 'Antagonist End Date' });

            const eggRetrievalStartDate = new Date(stimStartDate);
            eggRetrievalStartDate.setUTCDate(stimStartDate.getUTCDate() + 12);
            const eggRetrievalEndDate = new Date(stimStartDate);
            eggRetrievalEndDate.setUTCDate(stimStartDate.getUTCDate() + 14);
            dates.push({ date: eggRetrievalStartDate, event: 'Egg Retrieval Start Date' });
            dates.push({ date: eggRetrievalEndDate, event: 'Egg Retrieval End Date' });

            if (day11UltrasoundDate) {
                const day11Date = new Date(day11UltrasoundDate);
                day11Date.setUTCHours(0, 0, 0, 0);
                dates.push({ date: day11Date, event: 'Day 11 Ultrasound' });
            }

            dates.sort((a, b) => a.date - b.date);
            const lastDate = dates[dates.length - 1].date;

            return { dates, lastDate };
        } else {
            console.warn('No valid start date provided for calculations.');
            return { dates, lastDate };
        }
    }

    function createWeekElement(week, year, month, eventsMap) {
        const weekElement = document.createElement('div');
        weekElement.className = 'week d-flex';

        week.forEach(day => {
            const dayElement = createDateBox(day, year, month, eventsMap);
            weekElement.appendChild(dayElement);
        });

        return weekElement;
    }

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
                handleDrop(e, dateBox.getAttribute('data-date'));
            });
        });
    }

    function createDateBox(date, year, month, eventsMap) {
        const dateBox = document.createElement('div');
        dateBox.className = 'date flex-fill border p-3';
        dateBox.setAttribute('draggable', isEditing); // Only allow dragging when editing
        dateBox.setAttribute('data-date', `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`); // Store date for drop handling

        const dateText = document.createElement('div');
        dateText.className = 'date-text font-weight-bold';
        dateText.textContent = date;

        dateBox.appendChild(dateText);

        const eventList = document.createElement('ul');
        eventList.className = 'event-list';
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        if (eventsMap[dateKey]) {
            eventsMap[dateKey].forEach(event => {
                const eventItem = document.createElement('li');
                eventItem.className = 'event-item';
                eventItem.setAttribute('draggable', isEditing); // Only allow dragging when editing
                eventItem.textContent = event;
                eventItem.addEventListener('dragstart', function (e) {
                    handleDragStart(e, dateKey, event);
                });
                eventList.appendChild(eventItem);
            });
        }
        dateBox.appendChild(eventList);

        return dateBox;
    }

    function handleDragStart(e, originalDateKey, event) {
        e.dataTransfer.setData('text/plain', event);
        draggedEvent = { originalDateKey, event };
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e, newDateKey) {
        e.preventDefault();
        if (draggedEvent && newDateKey) {
            const { originalDateKey, event } = draggedEvent;
            if (originalDateKey !== newDateKey) {
                // Remove the event from the original date
                const originalDateEvents = eventsMap[originalDateKey];
                const eventIndex = originalDateEvents.indexOf(event);
                if (eventIndex > -1) {
                    originalDateEvents.splice(eventIndex, 1);
                }

                // Add the event to the new date
                if (!eventsMap[newDateKey]) {
                    eventsMap[newDateKey] = [];
                }
                eventsMap[newDateKey].push(event);

                // Re-generate the calendar
                generateCalendar(startDate, lastDate, eventsMap);
            }
            draggedEvent = null;
        }
    }

    const editSaveButton = document.getElementById('edit-save-button');
    editSaveButton.addEventListener('click', function () {
        isEditing = !isEditing;
        editSaveButton.textContent = isEditing ? 'Save' : 'Edit';
        generateCalendar(startDate, lastDate, eventsMap); // Re-generate calendar to update draggable state
    });

    const printButton = document.getElementById('print-button');
    printButton.addEventListener('click', function () {
        window.print();
    });
});
