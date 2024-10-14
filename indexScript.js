document.addEventListener('DOMContentLoaded', function() {

    // function calculates the first date of the specified day of the week
    function getFirstDayOfWeek(date, dayOfWeek) {
        const diff = (dayOfWeek - date.getUTCDay() + 7) % 7;
        date.setUTCDate(date.getUTCDate() + diff);
        return date;
    }

    //  calculates the first Friday of the current week and the Monday 10 days after
    const today = new Date();
    const firstFriday = getFirstDayOfWeek(new Date(today), 5); 
    const day11AfterFriday = new Date(firstFriday);
    day11AfterFriday.setUTCDate(firstFriday.getUTCDate() + 10);

    // retrieves the input elements from index.html 
    const stimStartDateInput = document.getElementById('stim-start-date');
    const day11UltrasoundInput = document.getElementById('day-11-ultrasound');

    // sets the default dates in the date picker
    if (stimStartDateInput && day11UltrasoundInput) {
        stimStartDateInput.value = firstFriday.toISOString().split('T')[0];
        day11UltrasoundInput.value = day11AfterFriday.toISOString().split('T')[0];
    }

    // retrieves the ivf form from index.html
    const ivfForm = document.getElementById('ivf-form');

    // handles the form submission
    if (ivfForm) {
        ivfForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const patientName = document.getElementById('patient-name').value;
            const stimStartDateValue = stimStartDateInput.value;
            const day11UltrasoundValue = day11UltrasoundInput.value;

            // verify data 
            console.log('Patient Name:', patientName);
            console.log('Stim Start Date Value:', stimStartDateValue);
            console.log('Day 11 Ultrasound Value:', day11UltrasoundValue);

            if (!stimStartDateValue && !day11UltrasoundValue) {
                alert('Please provide either the stim start date or the day 11 ultrasound date.');
                return;
            }

            // check local storage before clearing
            console.log('Local Storage Before Clear:', localStorage);

            // clear any existing local storage data
            localStorage.clear();

            // check local storage after clearing
            console.log('Local Storage After Clear:', localStorage);

            // saves the variables in local storage so we can retrieve them on the next page
            localStorage.setItem('patientName', patientName);
            localStorage.setItem('stimStartDate', stimStartDateValue);
            localStorage.setItem('day11Ultrasound', day11UltrasoundValue);

            // log to confirm values are set
            console.log('Local Storage After Setting New Values:', {
                patientName: localStorage.getItem('patientName'),
                stimStartDate: localStorage.getItem('stimStartDate'),
                day11Ultrasound: localStorage.getItem('day11Ultrasound')
            });

            // redirect to calendar.html on submit
            window.location.href = `calendar.html`;
        });
    }

    // handles the clear button functionality
    const clearDataButton = document.getElementById('clear-data');

    if (clearDataButton) {
        clearDataButton.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});
