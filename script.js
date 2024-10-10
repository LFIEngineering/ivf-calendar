document.addEventListener('DOMContentLoaded', function() {
    function getFirstDayOfWeek(date, dayOfWeek) {
        const diff = (dayOfWeek - date.getUTCDay() + 7) % 7;
        date.setUTCDate(date.getUTCDate() + diff);
        return date;
    }
    
    const today = new Date();
    const firstFriday = getFirstDayOfWeek(new Date(today), 5); // First Friday
    const day11AfterFriday = new Date(firstFriday);
    day11AfterFriday.setUTCDate(firstFriday.getUTCDate() + 11); // Add 11 days to get to Monday
    
    const stimStartDateInput = document.getElementById('stim-start-date');
    const day11UltrasoundInput = document.getElementById('day-11-ultrasound');
    
    if (stimStartDateInput && day11UltrasoundInput) {
        stimStartDateInput.value = firstFriday.toISOString().split('T')[0]; // Set to first Friday
        day11UltrasoundInput.value = day11AfterFriday.toISOString().split('T')[0]; // Set to 11 days after first Friday
    }

    const ivfForm = document.getElementById('ivf-form');

    if (ivfForm) {
        ivfForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const patientName = document.getElementById('patient-name').value;
            const stimStartDateValue = stimStartDateInput.value;
            const day11UltrasoundValue = day11UltrasoundInput.value;

            if (!patientName || (!stimStartDateValue && !day11UltrasoundValue)) {
                alert('Please provide the patient name and either the stim start date or the day 11 ultrasound date.');
                return;
            }

            localStorage.setItem('patientName', patientName);
            localStorage.setItem('stimStartDate', stimStartDateValue);
            localStorage.setItem('day11Ultrasound', day11UltrasoundValue);

            window.location.href = `calendar.html`;
        });
        console.log("ivfForm works");
    }

    const calendarElement = document.getElementById('calendar-weeks');

    const patientName = localStorage.getItem('patientName');
    const stimStartDateValue = localStorage.getItem('stimStartDate');
    const day11UltrasoundValue = localStorage.getItem('day11Ultrasound');

    if (patientName) {
        const stimStartDate = stimStartDateValue ? new Date(stimStartDateValue) : null;
        const day11Ultrasound = day11UltrasoundValue ? new Date(day11UltrasoundValue) : null;

        const dates = calculateDates(stimStartDate, day11Ultrasound);

        const eventsMap = {};
        dates.forEach(date => {
            const eventDateString = date.date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            if (!eventsMap[eventDateString]) {
                eventsMap[eventDateString] = []; // Initialize if not present
            }
            eventsMap[eventDateString].push(date.event); // Add event to the corresponding date
        });

        // Assuming you have the current month and year you want to display
        const currentDate = new Date(); // You can change this to any month/year
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0 = January, 1 = February, etc.

        // Get the first day of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0); // Last day of the month

        // Create an array to hold the weeks
        const weeks = [];

        // Fill in the weeks
        let week = [];
        let dayCounter = 1;

        // Add empty days for the start of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            week.push('');
        }

        // Fill in the days of the month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            week.push(i);
            if (week.length === 7) {
                weeks.push(week);
                week = []; // Reset for the next week
            }
        }

        // Add empty days for the end of the month
        while (week.length < 7) {
            week.push('');
        }
        if (week.length) {
            weeks.push(week);
        }

        // Populate the calendar
        weeks.forEach((week) => {
            const weekElement = document.createElement('div');
            weekElement.className = 'week d-flex';

            week.forEach((day) => {
                const dayElement = document.createElement('div');
                dayElement.className = 'date flex-fill text-center border p-3';
                dayElement.textContent = day ? day : ''; // Only show numbers for days
                
                // Check if this day has any events
                if (day) {
                    const dateString = `${year}-${month + 1}-${day}`; // Create date string YYYY-MM-DD
                    if (eventsMap[dateString]) {
                        dayElement.innerHTML += `<br>${eventsMap[dateString].join(', ')}`; // Display events for that day
                    }
                }

                weekElement.appendChild(dayElement);
            });

            calendarElement.appendChild(weekElement);
        });
    }


    function calculateDates(stimStart, day11Ultrasound) {
        const dates = [];
        let stimStartDate;
    
        if (stimStart) {
            stimStartDate = new Date(stimStart);
            stimStartDate.setUTCHours(0, 0, 0, 0);
        } else if (day11Ultrasound) {
            stimStartDate = new Date(day11Ultrasound);
            stimStartDate.setUTCHours(0, 0, 0, 0);
            stimStartDate.setUTCDate(stimStartDate.getUTCDate() - 11);
        }
    
        if (stimStartDate) {
            // Stim Start Date
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
    
            // Baseline Ultrasound and Labs - 2 days before stim start
            const baselineUltrasoundDate = new Date(stimStartDate);
            baselineUltrasoundDate.setUTCDate(stimStartDate.getUTCDate() - 2);
            dates.push({ 
                date: baselineUltrasoundDate, 
                event: 'Baseline Ultrasound and Labs' 
            });
    
            // Possible Antagonist Start - 10 days after stim start
            const antagonistStartDate = new Date(stimStartDate);
            const antagonistEndDate = new Date(stimStartDate);
            antagonistStartDate.setUTCDate(stimStartDate.getUTCDate() + 3);
            antagonistEndDate.setUTCDate(antagonistStartDate.getUTCDate() + 1);
            dates.push({ 
                date: antagonistStartDate,
                event: 'Antagonist Start' 
            });
            dates.push({
                date: antagonistEndDate,
                event: 'Antagonist End Date'
            });
    
            // Possible Egg Retrieval - 14 days after stim start
            const eggRetrievalStartDate = new Date(stimStartDate);
            const eggRetrievalEndDate = new Date(stimStartDate);
            eggRetrievalStartDate.setUTCDate(stimStartDate.getUTCDate() + 12);
            eggRetrievalEndDate.setUTCDate(eggRetrievalStartDate.getUTCDate() + 2);
            dates.push({
                date: eggRetrievalStartDate, 
                event: 'Egg Retrieval Start Date' 
            });
            dates.push({
                date: eggRetrievalEndDate,
                event: 'Egg Retrieval End Date'
            })

            if (day11Ultrasound) {
                dates.push({ 
                    date: new Date(day11Ultrasound), 
                    event: 'Day 11 Ultrasound' 
                });
            }
        }
        return dates;
    }

    const printButton = document.getElementById('print-button');
    
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }

    const clearDataButton = document.getElementById('clear-data');

    if (clearDataButton) {
        clearDataButton.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});
