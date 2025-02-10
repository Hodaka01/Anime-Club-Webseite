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
    window.toggleDatePicker = function () {
        datePicker.style.display = datePicker.style.display === "none" ? "block" : "none";
    };

    datePicker.addEventListener("change", function () {
        setEventDate(this.value);
    });

    // Falls kein Datum gespeichert ist, setze das Standarddatum
    if (!localStorage.getItem("eventDate")) {
        setEventDate(calculateNextSecondSunday());
    }

    updateDateDisplay();

    document.addEventListener("DOMContentLoaded", function () {
        const menuContainer = document.querySelector(".menu-container");
        const menuIcon = document.querySelector(".menu-icon");
        const dropdown = document.querySelector(".dropdown");
    
        // 📌 Menü öffnen und schließen beim Klicken
        menuIcon.addEventListener("click", function (event) {
            event.stopPropagation();
            menuContainer.classList.toggle("show");
        });
    
        // 📌 Menü bleibt offen, wenn man mit der Maus darüberfährt
        menuContainer.addEventListener("mouseenter", function () {
            menuContainer.classList.add("show");
        });
    
        // 📌 Menü schließt, wenn die Maus das Menü verlässt (aber nicht direkt in Dropdown!)
        menuContainer.addEventListener("mouseleave", function (event) {
            // Schließe das Menü nur, wenn die Maus das gesamte Menü UND das Dropdown verlässt
            if (!menuContainer.contains(event.relatedTarget) && !dropdown.contains(event.relatedTarget)) {
                menuContainer.classList.remove("show");
            }
        });
    
        // 📌 Menü schließt sich, wenn man außerhalb klickt
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
            löschenButton.onclick = () => {
                mitglieder.splice(index, 1);
                localStorage.setItem("mitglieder", JSON.stringify(mitglieder));
                loadMitglieder();
            };

            li.appendChild(löschenButton);
            mitgliedListe.appendChild(li);
        });
    }

    // 📌 Mitgliederverwaltung: Mitglied hinzufügen
    function hinzufügenMitglied() {
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
    }

    // Lade Mitglieder beim Start
    loadMitglieder();
});
