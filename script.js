document.addEventListener("DOMContentLoaded", async function () {
    const eventDateDisplay = document.getElementById("event-date");
    const datePicker = document.getElementById("date-picker");
    const countdownDisplay = document.getElementById("countdown");

    function calculateNextSecondSunday() {
        let today = new Date();
        let month = today.getMonth();
        let year = today.getFullYear();
        
        let firstDay = new Date(year, month, 1).getDay();
        let secondSunday = firstDay === 0 ? 8 : 15 - firstDay;

        return new Date(year, month, secondSunday).toISOString();
    }

    function updateCountdown(eventDate) {
        const today = new Date();
        const targetDate = new Date(eventDate);
        const diffTime = targetDate - today;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        countdownDisplay.textContent = `Noch ${daysRemaining} Tage bis zum Event!`;
    }

    async function updateDateDisplay() {
        const eventDate = await getEventDate();
        eventDateDisplay.textContent = new Date(eventDate).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        updateCountdown(eventDate);
    }

    function toggleDatePicker() {
        datePicker.style.display = datePicker.style.display === "none" ? "block" : "none";
    }

    datePicker.addEventListener("change", async function () {
        await setEventDate(this.value);
        updateDateDisplay();
    });

    updateDateDisplay();
});

function toggleMenu() {
    document.querySelector(".dropdown").classList.toggle("show");
}
