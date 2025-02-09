document.addEventListener("DOMContentLoaded", function () {
    const mitgliedListe = document.getElementById("mitglied-liste");
    const datePicker = document.getElementById("date-picker");
    const eventDateDisplay = document.getElementById("event-date");
    const countdownDisplay = document.getElementById("countdown");
    const mitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];
    
    function getNextSecondSunday() {
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth() + 1; // Monat beginnt bei 0
        let secondSunday;

        while (true) {
            let firstDay = new Date(year, month - 1, 1);
            let dayOfWeek = firstDay.getDay();
            let firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
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
        let timeDifference = eventDate - today;
        let daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        eventDateDisplay.textContent = `Nächstes Event: ${eventDate.toLocaleDateString("de-DE")}`;
        countdownDisplay.textContent = `Tage bis dahin: ${daysRemaining}`;

        if (daysRemaining < 0) {
            localStorage.setItem("eventDate", getNextSecondSunday().toISOString());
            updateCountdown();
        }
    }

    datePicker.addEventListener("change", function () {
        let selectedDate = new Date(this.value);
        if (!isNaN(selectedDate)) {
            localStorage.setItem("eventDate", selectedDate.toISOString());
            updateCountdown();
        }
    });

    function renderMitglieder() {
        mitgliedListe.innerHTML = "";
        mitglieder.forEach((mitglied, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${mitglied.name} - Genres: ${mitglied.genre} - Lieblingsanime: ${mitglied.anime} 
                            <button class="löschen" onclick="löschenMitglied(${index})">Löschen</button>`;
            mitgliedListe.appendChild(li);
        });
    }

    window.hinzufügenMitglied = function () {
        const name = document.getElementById("mitglied-name").value;
        const genre = document.getElementById("mitglied-genre").value;
        const anime = document.getElementById("mitglied-anime").value;

        if (name.trim() !== "") {
            mitglieder.push({ name, genre, anime });
            localStorage.setItem("mitglieder", JSON.stringify(mitglieder));
            renderMitglieder();
            document.getElementById("mitglied-name").value = "";
            document.getElementById("mitglied-genre").value = "";
            document.getElementById("mitglied-anime").value = "";
        } else {
            alert("Bitte einen Namen eingeben!");
        }
    };

    window.löschenMitglied = function (index) {
        mitglieder.splice(index, 1);
        localStorage.setItem("mitglieder", JSON.stringify(mitglieder));
        renderMitglieder();
    };

    updateCountdown();
    renderMitglieder();
});
