document.addEventListener("DOMContentLoaded", function () {
    const eventDateDisplay = document.getElementById("event-date");
    const datePicker = document.getElementById("date-picker");
    
    async function updateDateDisplay() {
        const eventDate = await getEventDate();
        eventDateDisplay.textContent = new Date(eventDate).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    datePicker.addEventListener("change", async function () {
        await setEventDate(this.value);
        updateDateDisplay();
    });

    updateDateDisplay();
});

// Menü-Toggle
function toggleMenu() {
    document.querySelector(".dropdown").classList.toggle("show");
}
