document.addEventListener("DOMContentLoaded", function () {
    const eventDateDisplay = document.getElementById("event-date");
    const countdownDisplay = document.getElementById("countdown");
    const datePicker = document.getElementById("date-picker");

    function getNextSecondSunday() {
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let secondSunday;

        while (true) {
            let firstDay = new Date(year, month - 1, 1);
            let firstSunday = firstDay.getDay() === 0 ? 1 : 8 - firstDay.getDay();
            secondSunday = firstSunday + 7;

            let eventDate = new Date(year, month - 1, secondSunday);
            if (eventDate > today) break;
            month++;
            if (month > 12) {
                month = 1;
                year++;
            }
        }
        return new Date(year, month - 1, secondSunday);
    }

    function updateCountdown() {
        let eventDate = new Date(localStorage.getItem("eventDate")) || getNextSecondSunday();
        let today = new Date();
        let daysRemaining = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

        let options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
        eventDateDisplay.textContent = `Nächstes Event: ${eventDate.toLocaleDateString("de-DE", options)}`;
        countdownDisplay.textContent = `Tage bis dahin: ${daysRemaining}`;
    }

    datePicker.addEventListener("change", function () {
        let selectedDate = new Date(this.value);
        if (!isNaN(selectedDate)) {
            localStorage.setItem("eventDate", selectedDate.toISOString());
            updateCountdown();
        }
    });

    updateCountdown();
});
