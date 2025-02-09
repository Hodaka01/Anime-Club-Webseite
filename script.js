document.addEventListener("DOMContentLoaded", function () {
    const eventDateDisplay = document.getElementById("event-date");
    const datePicker = document.getElementById("date-picker");
    const mitgliedListe = document.getElementById("mitglied-liste");

    // Toggle Date Picker
    function toggleDatePicker() {
        datePicker.style.display = datePicker.style.display === "none" ? "block" : "none";
    }

    // Event date logic
    function updateEventDate() {
        const storedDate = localStorage.getItem("eventDate");
        const eventDate = storedDate ? new Date(storedDate) : new Date();
        eventDateDisplay.textContent = eventDate.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    datePicker.addEventListener("change", function () {
        localStorage.setItem("eventDate", this.value);
        updateEventDate();
    });

    updateEventDate();

    // Mitgliederliste laden
    function ladeMitglieder() {
        const gespeicherteMitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];
        mitgliedListe.innerHTML = "";
        gespeicherteMitglieder.forEach((mitglied, index) => {
            const li = document.createElement("li");
            li.textContent = `${mitglied.name} - ${mitglied.genre} - ${mitglied.anime}`;
            const löschenButton = document.createElement("button");
            löschenButton.textContent = "Löschen";
            löschenButton.classList.add("löschen");
            löschenButton.onclick = () => {
                gespeicherteMitglieder.splice(index, 1);
                localStorage.setItem("mitglieder", JSON.stringify(gespeicherteMitglieder));
                ladeMitglieder();
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
            const gespeicherteMitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];
            gespeicherteMitglieder.push({ name, genre, anime });
            localStorage.setItem("mitglieder", JSON.stringify(gespeicherteMitglieder));
            ladeMitglieder();
            document.getElementById("mitglied-name").value = "";
            document.getElementById("mitglied-genre").value = "";
            document.getElementById("mitglied-anime").value = "";
        }
    };

    ladeMitglieder();
});
