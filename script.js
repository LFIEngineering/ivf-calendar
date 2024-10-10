document.addEventListener('DOMContentLoaded', function() {
    function getFirstDayOfWeek(date, dayOfWeek) {
        const diff = (dayOfWeek - date.getDay() + 7) % 7;
        date.setDate(date.getDate() + diff);
        return date;
    }

    const today = new Date();
    const firstFriday = getFirstDayOfWeek(new Date(today), 5); // First Friday
    const firstWednesdayAfterFriday = new Date(firstFriday);
    firstWednesdayAfterFriday.setDate(firstFriday.getDate() + 5); // Add 5 days to get to Wednesday

    const stimStartDateInput = document.getElementById('stim-start-date');
    const day11UltrasoundInput = document.getElementById('day-11-ultrasound');

    if (stimStartDateInput && day11UltrasoundInput) {
        stimStartDateInput.value = firstFriday.toISOString().split('T')[0]; // Set to first Friday
        day11UltrasoundInput.value = firstWednesdayAfterFriday.toISOString().split('T')[0]; // Set to Wednesday after first Friday
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

    const calendarElement = document.getElementById('calendar');

    if (calendarElement) {
        const patientName = localStorage.getItem('patientName');
        const stimStartDateValue = localStorage.getItem('stimStartDate');
        const day11UltrasoundValue = localStorage.getItem('day11Ultrasound');

        if (patientName) {
            const stimStartDate = stimStartDateValue ? new Date(stimStartDateValue) : null;
            const day11Ultrasound = day11UltrasoundValue ? new Date(day11UltrasoundValue) : null;
            const dates = calculateDates(stimStartDate, day11Ultrasound);

            calendarElement.innerHTML = `<h2>IVF Calendar for ${patientName}</h2>`;
            dates.forEach(date => {
                const entry = document.createElement('div');
                entry.className = 'calendar-entry';
                entry.innerText = `${date.date.toDateString()}: ${date.event}`;
                calendarElement.appendChild(entry);
            });
        }
    }

    function calculateDates(stimStartDate, day11Ultrasound) {
        const dates = [];
        if (stimStartDate) {
            dates.push({ date: new Date(stimStartDate), event: 'Stim Start' });
            dates.push({ date: new Date(stimStartDate.getTime() + 7 * 24 * 60 * 60 * 1000), event: 'Anticipated Bleed' });
            dates.push({ date: new Date(stimStartDate.getTime() - 14 * 24 * 60 * 60 * 1000), event: 'Last Active Birth Control Pill' });
            dates.push({ date: new Date(stimStartDate.getTime() + 5 * 24 * 60 * 60 * 1000), event: 'Baseline Ultrasound and Labs' });
            dates.push({ date: new Date(stimStartDate.getTime() + 10 * 24 * 60 * 60 * 1000), event: 'Possible Antagonist Start' });
            dates.push({ date: new Date(stimStartDate.getTime() + 14 * 24 * 60 * 60 * 1000), event: 'Possible Egg Retrieval' });
        } else if (day11Ultrasound) {
            dates.push({ date: new Date(day11Ultrasound.getTime() - 11 * 24 * 60 * 60 * 1000), event: 'Stim Start' });
            dates.push({ date: new Date(day11Ultrasound), event: 'Day 11 Ultrasound' });
            dates.push({ date: new Date(day11Ultrasound.getTime() - 4 * 24 * 60 * 60 * 1000), event: 'Anticipated Bleed' });
            dates.push({ date: new Date(day11Ultrasound.getTime() - 25 * 24 * 60 * 60 * 1000), event: 'Last Active Birth Control Pill' });
            dates.push({ date: new Date(day11Ultrasound.getTime() - 6 * 24 * 60 * 60 * 1000), event: 'Baseline Ultrasound and Labs' });
            dates.push({ date: new Date(day11Ultrasound.getTime() - 1 * 24 * 60 * 60 * 1000), event: 'Possible Antagonist Start' });                    
            dates.push({ date: new Date(day11Ultrasound.getTime() + 3 * 24 * 60 * 60 * 1000), event: 'Possible Egg Retrieval' });
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
