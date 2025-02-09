document.addEventListener("DOMContentLoaded", function () {
    const eventDateDisplay = document.getElementById("event-date");
    const datePicker = document.getElementById("date-picker");
    const countdownDisplay = document.getElementById("countdown");
    const mitgliedListe = document.getElementById("mitglied-liste");
    const menuContainer = document.querySelector(".menu-container");

    // 🗓️ Berechnet den nächsten zweiten Sonntag im Monat
    function calculateNextSecondSunday() {
        let today = new Date();
        let month = today.getMonth();
        let year = today.getFullYear();
        
        let firstDay = new Date(year, month, 1).getDay();
        let secondSunday = firstDay === 0 ? 8 : 15 - firstDay;

        return new Date(year, month, secondSunday).toISOString();
    }

    // 🗂️ Holt das gespeicherte Datum oder setzt das Standarddatum
    function getEventDate() {
        return localStorage.getItem("eventDate") || calculateNextSecondSunday();
    }

    // 💾 Speichert das Datum lokal
    function setEventDate(date) {
        localStorage.setItem("eventDate", date);
        updateDateDisplay();
    }

    // ⏳ Berechnet und zeigt den Countdown an
    function updateCountdown(eventDate) {
        const today = new Date();
        const targetDate = new Date(eventDate);
        const diffTime = targetDate - today;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        countdownDisplay.textContent = `Noch ${daysRemaining} Tage bis zum Event!`;
    }

    // 📅 Aktualisiert die Datumsanzeige
    function updateDateDisplay() {
        const eventDate = getEventDate();
        eventDateDisplay.textContent = new Date(eventDate).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        updateCountdown(eventDate);
    }

    // 📌 Öffnet/Schließt den Datepicker
    function toggleDatePicker() {
        datePicker.style.display = datePicker.style.display === "none" ? "block" : "none";
    }

    datePicker.addEventListener("change", function () {
        setEventDate(this.value);
    });

    updateDateDisplay();

    // 📌 Menü-Icon: Dropdown-Menü anzeigen/verstecken
    document.addEventListener("DOMContentLoaded", function () {
        const menuContainer = document.querySelector(".menu-container");
        const menuIcon = document.querySelector(".menu-icon");
    
        // 📌 Menü öffnen/schließen beim Klicken auf das Icon
        menuIcon.addEventListener("click", function (event) {
            event.stopPropagation(); // Verhindert, dass das Schließen-Event ausgelöst wird
            menuContainer.classList.toggle("show");
        });
    
        // 📌 Menü bleibt offen, solange man mit der Maus darüber ist
        menuContainer.addEventListener("mouseenter", function () {
            menuContainer.classList.add("show");
        });
    
        menuContainer.addEventListener("mouseleave", function () {
            menuContainer.classList.remove("show");
        });
    
        // 📌 Menü schließt, wenn man irgendwo außerhalb klickt
        document.addEventListener("click", function (event) {
            if (!menuContainer.contains(event.target)) {
                menuContainer.classList.remove("show");
            }
        });
    });

     // 📌 Mitgliederverwaltung: Mitglieder laden
    function loadMitglieder() {
        const mitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];
        mitgliedListe.innerHTML = "";

        mitglieder.forEach((mitglied, index) => {
            const li = document.createElement("li");
            li.textContent = `${mitglied.name} - Lieblingsgenres: ${mitglied.genre} - Lieblingsanime: ${mitglied.anime}`;

            const löschenButton = document.createElement("button");
            löschenButton.textContent = "Löschen";
            löschenButton.classList.add("löschen");
            löschenButton.onclick = function () {
                deleteMitglied(index);
            };

            li.appendChild(löschenButton);
            mitgliedListe.appendChild(li);
        });
    }

    // 📌 Mitglied hinzufügen
    function hinzufügenMitglied() {
        const name = document.getElementById("mitglied-name").value.trim();
        const genre = document.getElementById("mitglied-genre").value.trim();
        const anime = document.getElementById("mitglied-anime").value.trim();

        if (name === "" || genre === "" || anime === "") {
            alert("Bitte alle Felder ausfüllen!");
            return;
        }

        let mitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];
        mitglieder.push({ name, genre, anime });
        localStorage.setItem("mitglieder", JSON.stringify(mitglieder));

        // Nach dem Speichern aktualisieren
        loadMitglieder();

        // Eingabefelder zurücksetzen
        document.getElementById("mitglied-name").value = "";
        document.getElementById("mitglied-genre").value = "";
        document.getElementById("mitglied-anime").value = "";
    }

    // 📌 Mitglied löschen
    function deleteMitglied(index) {
        let mitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];
        mitglieder.splice(index, 1); // Entfernt das Mitglied an der angegebenen Stelle
        localStorage.setItem("mitglieder", JSON.stringify(mitglieder));
        loadMitglieder();
    }

    // Lade Mitglieder beim Start
    loadMitglieder();

    // Event-Listener für den Hinzufügen-Button
    document.querySelector(".mitglied-form button").addEventListener("click", hinzufügenMitglied);
});
