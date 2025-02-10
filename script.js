document.addEventListener("DOMContentLoaded", () => {
  // ============================
  // Element-Selektoren
  // ============================
  const eventDateDisplay = document.getElementById("event-date");
  const datePicker = document.getElementById("date-picker");
  const countdownDisplay = document.getElementById("countdown");
  const mitgliedListe = document.getElementById("mitglied-liste");

  // ============================
  // Datum & Countdown
  // ============================
  /**
   * Berechnet den zweiten Sonntag im aktuellen Monat.
   * Falls der 1. ein Sonntag ist, wird der 8. als zweiter Sonntag genommen,
   * andernfalls der (15 - erster Wochentag)-te Tag.
   */
  const calculateNextSecondSunday = () => {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const secondSunday = firstDay === 0 ? 8 : 15 - firstDay;
    return new Date(year, month, secondSunday).toISOString();
  };

  const getEventDate = () =>
    localStorage.getItem("eventDate") || calculateNextSecondSunday();

  const setEventDate = (date) => {
    localStorage.setItem("eventDate", date);
    updateDateDisplay();
  };

  const updateCountdown = (eventDate) => {
    const today = new Date();
    const targetDate = new Date(eventDate);
    const diffTime = targetDate - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    countdownDisplay.textContent = `Noch ${daysRemaining} Tage bis zum Event!`;
  };

  const updateDateDisplay = () => {
    const eventDate = getEventDate();
    eventDateDisplay.textContent = new Date(eventDate).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    updateCountdown(eventDate);
  };

  // Öffnet/Schließt den Datepicker
  window.toggleDatePicker = () => {
    datePicker.style.display = datePicker.style.display === "none" ? "block" : "none";
  };

  datePicker.addEventListener("change", function () {
    setEventDate(this.value);
  });

  if (!localStorage.getItem("eventDate")) {
    setEventDate(calculateNextSecondSunday());
  }
  updateDateDisplay();

  // ============================
  // Dropdown-Menü
  // ============================
  const menuContainer = document.querySelector(".menu-container");
  const menuIcon = document.querySelector(".menu-icon");
  const dropdown = document.querySelector(".dropdown");
  
  // Flag, das anzeigt, ob das Dropdown per Klick geöffnet wurde
  let clicked = false;
  
  menuIcon.addEventListener("click", (event) => {
    event.stopPropagation();
    // Toggle: Wenn bisher nicht geklickt wurde, wird clicked true
    clicked = !clicked;
    if (clicked) {
      dropdown.classList.add("show");
    } else {
      dropdown.classList.remove("show");
    }
  });
  
  // Beim Hovern soll das Dropdown immer angezeigt werden
  menuContainer.addEventListener("mouseenter", () => {
    dropdown.classList.add("show");
  });
  
  // Beim Verlassen des Menübereichs wird das Dropdown nur geschlossen, wenn es nicht per Klick geöffnet wurde
  menuContainer.addEventListener("mouseleave", (event) => {
    if (!clicked && !menuContainer.contains(event.relatedTarget) && !dropdown.contains(event.relatedTarget)) {
      dropdown.classList.remove("show");
    }
  });
  
  // Klicks außerhalb des Menüs schließen das Dropdown und setzen das Klick-Flag zurück
  document.addEventListener("click", (event) => {
    if (!menuContainer.contains(event.target)) {
      dropdown.classList.remove("show");
      clicked = false;
    }
  });
  // ============================
  // Mitgliederverwaltung
  // ============================
  const loadMitglieder = () => {
    const mitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];
    mitgliedListe.innerHTML = "";
    mitglieder.forEach((mitglied, index) => {
      const li = document.createElement("li");
      li.classList.add("mitglied-item");

      const infoDiv = document.createElement("div");
      infoDiv.classList.add("mitglied-info");

      const nameElem = document.createElement("h3");
      nameElem.textContent = mitglied.name;

      const genreElem = document.createElement("p");
      genreElem.textContent = `Lieblingsgenres: ${mitglied.genre}`;

      const animeElem = document.createElement("p");
      animeElem.textContent = `Lieblingsanime: ${mitglied.anime}`;

      infoDiv.append(nameElem, genreElem, animeElem);

      const loeschenButton = document.createElement("button");
      loeschenButton.textContent = "Löschen";
      loeschenButton.classList.add("löschen");
      loeschenButton.addEventListener("click", () => {
        mitglieder.splice(index, 1);
        localStorage.setItem("mitglieder", JSON.stringify(mitglieder));
        loadMitglieder();
      });

      li.append(infoDiv, loeschenButton);
      mitgliedListe.appendChild(li);
    });
  };

  window.hinzufuegenMitglied = () => {
    const name = document.getElementById("mitglied-name").value.trim();
    const genre = document.getElementById("mitglied-genre").value.trim();
    const anime = document.getElementById("mitglied-anime").value.trim();

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

  loadMitglieder();
});
