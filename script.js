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

    const calendarElement = document.getElementById('calendar');

    if (calendarElement) {
        const patientName = localStorage.getItem('patientName');
        const stimStartDateValue = localStorage.getItem('stimStartDate');
        const day11UltrasoundValue = localStorage.getItem('day11Ultrasound');

        console.log('Retrieved from localStorage:', {
            patientName,
            stimStartDateValue,
            day11UltrasoundValue
        });

        if (patientName) {
            const stimStartDate = stimStartDateValue ? new Date(stimStartDateValue) : null;
            const day11Ultrasound = day11UltrasoundValue ? new Date(day11UltrasoundValue) : null;

            console.log('Parsed Dates:', {
                stimStartDate: stimStartDate ? stimStartDate.toISOString() : null,
                day11Ultrasound: day11Ultrasound ? day11Ultrasound.toISOString() : null
            });

            const dates = calculateDates(stimStartDate, day11Ultrasound);

            calendarElement.innerHTML = `<h2>IVF Calendar for ${patientName}</h2>`;
            dates.forEach(date => {
                const entry = document.createElement('div');
                entry.className = 'calendar-entry';
                entry.innerText = `${date.date.toISOString().split('T')[0]}: ${date.event}`;
                calendarElement.appendChild(entry);
            });

            console.log('Generated Dates:', dates.map(d => `${d.date.toISOString()}: ${d.event}`));
        }
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
            dates.push({ date: stimStartDate, event: 'Stim Start' });
    
            // Last Active Birth Control Pill - 5 days before stim start
            const lastActiveBCPDate = new Date(stimStartDate);
            lastActiveBCPDate.setUTCDate(stimStartDate.getUTCDate() - 5);
            dates.push({ date: lastActiveBCPDate, event: 'Last Active Birth Control Pill' });
    
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
            dates.push({ date: baselineUltrasoundDate, event: 'Baseline Ultrasound and Labs' });
    
            // Possible Antagonist Start - 10 days after stim start
            const possibleAntagonistStartDate = new Date(stimStartDate);
            possibleAntagonistStartDate.setUTCDate(stimStartDate.getUTCDate() + 10);
            dates.push({ date: possibleAntagonistStartDate, event: 'Possible Antagonist Start' });
    
            // Possible Egg Retrieval - 14 days after stim start
            const possibleEggRetrievalDate = new Date(stimStartDate);
            possibleEggRetrievalDate.setUTCDate(stimStartDate.getUTCDate() + 14);
            dates.push({ date: possibleEggRetrievalDate, event: 'Possible Egg Retrieval' });
    
            // Day 11 Ultrasound (only add if `day11Ultrasound` was provided)
            if (day11Ultrasound) {
                dates.push({ date: new Date(day11Ultrasound), event: 'Day 11 Ultrasound' });
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
