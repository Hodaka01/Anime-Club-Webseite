document.addEventListener("DOMContentLoaded", function () {
    const eventDateDisplay = document.getElementById("event-date");
    const datePicker = document.getElementById("date-picker");
    const mitgliedListe = document.getElementById("mitglied-liste");

    // Datum-Funktionen
    function toggleDatePicker() {
        datePicker.style.display = datePicker.style.display === "none" ? "block" : "none";
    }

    function updateCountdown() {
        const eventDate = new Date(localStorage.getItem("eventDate")) || new Date();
        eventDateDisplay.textContent = eventDate.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    datePicker.addEventListener("change", function () {
        const selectedDate = new Date(this.value);
        if (!isNaN(selectedDate)) {
            localStorage.setItem("eventDate", selectedDate.toISOString());
            updateCountdown();
        }
    });

    // Mitglieder-Daten aus localStorage laden
    function loadMitglieder() {
        const mitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];
        mitgliedListe.innerHTML = "";
        mitglieder.forEach((mitglied, index) => {
            const li = document.createElement("li");
            li.textContent = `${mitglied.name} - Lieblingsgenres: ${mitglied.genre} - Lieblingsanime: ${mitglied.anime}`;
            const löschenButton = document.createElement("button");
            löschenButton.textContent = "Löschen";
            löschenButton.classList.add("löschen");
            löschenButton.onclick = () => {
                mitglieder.splice(index, 1);
                localStorage.setItem("mitglieder", JSON.stringify(mitglieder));
                loadMitglieder();
            };
            li.appendChild(löschenButton);
            mitgliedListe.appendChild(li);
        });
    }

    // Neues Mitglied hinzufügen
    window.hinzufügenMitglied = function () {
        const name = document.getElementById("mitglied-name").value;
        const genre = document.getElementById("mitglied-genre").value;
        const anime = document.getElementById("mitglied-anime").value;

        if (name && genre && anime) {
            const mitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];
            mitglieder.push({ name, genre, anime });
            localStorage.setItem("mitglieder", JSON.stringify(mitglieder));
            loadMitglieder();
            document.getElementById("mitglied-name").value = "";
            document.getElementById("mitglied-genre").value = "";
            document.getElementById("mitglied-anime").value = "";
        }
    };

    updateCountdown();
    loadMitglieder();
});
