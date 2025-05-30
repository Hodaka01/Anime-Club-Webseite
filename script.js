// =============================================
//  Supabase Setup
// =============================================
const SUPABASE_URL = "https://pnhtasbeulnqcpvvlcvz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaHRhc2JldWxucWNwdnZsY3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MzEyNDcsImV4cCI6MjA2NDIwNzI0N30.D5vqyDHJgh3U4gOAWCRoRYec7oGvEfKw846riH_tsnA";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================================
//  Main Logik nach DOM geladen
// =============================================
document.addEventListener("DOMContentLoaded", () => {

  // ============================
  //  Element-Selektoren
  // ============================
  const eventDateDisplay = document.getElementById("event-date");
  const datePicker = document.getElementById("date-picker");
  const countdownDisplay = document.getElementById("countdown");
  const mitgliedListe = document.getElementById("mitglied-liste");

  // ============================
  //  Datum & Countdown (Supabase)
  // ============================
  // Eventdatum holen
  const getEventDateFromSupabase = async () => {
    const { data, error } = await supabase.from("eventdaten").select("*").limit(1).single();
    if (error || !data) return calculateNextSecondSunday();
    return data.eventdate;
  };

  // Eventdatum setzen
  const setEventDateInSupabase = async (date) => {
    let { data } = await supabase.from("eventdaten").select("*").limit(1).single();
    if (data && data.id) {
      await supabase.from("eventdaten").update({ eventdate: date }).eq("id", data.id);
    } else {
      await supabase.from("eventdaten").insert([{ eventdate: date }]);
    }
  };

  // 2. Sonntag im Monat als Fallback
  const calculateNextSecondSunday = () => {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const secondSunday = firstDay === 0 ? 8 : 15 - firstDay;
    return new Date(year, month, secondSunday).toISOString().slice(0, 10);
  };

  // Countdown-Anzeige
  const updateCountdown = (eventDate) => {
    if (!countdownDisplay) return;
    const today = new Date();
    const targetDate = new Date(eventDate);
    const diffTime = targetDate - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    countdownDisplay.textContent = `Noch ${daysRemaining} Tage bis zum Event!`;
  };

  // Datum aktualisieren (Anzeige + Datepicker + Countdown)
  const updateDateDisplay = async () => {
    if (!eventDateDisplay) return;
    const eventDate = await getEventDateFromSupabase();
    eventDateDisplay.textContent = new Date(eventDate).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (datePicker) datePicker.value = eventDate;
    updateCountdown(eventDate);
  };

  // Datepicker öffnen/schließen
  window.toggleDatePicker = () => {
    if (!datePicker) return;
    datePicker.style.display = datePicker.style.display === "none" ? "block" : "none";
  };

  // Listener für Datepicker-Änderung
  if (datePicker) {
    datePicker.addEventListener("change", async function () {
      await setEventDateInSupabase(this.value);
      updateDateDisplay();
    });
  }

  // Initiales Datum aus Supabase holen oder setzen
  if (eventDateDisplay) {
    (async () => {
      const { data, error } = await supabase.from("eventdaten").select("*").limit(1).single();
      if (!data || error) {
        const defaultDate = calculateNextSecondSunday();
        await setEventDateInSupabase(defaultDate);
      }
      updateDateDisplay();
    })();
  }

  // ============================
  //  Dropdown-Menü (klickbasiert und robust)
  // ============================
  const menuIcon = document.querySelector(".menu-icon");
  const dropdown = document.querySelector(".dropdown");
  let dropdownOpen = false;

  if (menuIcon && dropdown) {
    menuIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownOpen = !dropdownOpen;
      dropdown.classList.toggle("show", dropdownOpen);
    });

    document.addEventListener("click", () => {
      if (dropdownOpen) {
        dropdown.classList.remove("show");
        dropdownOpen = false;
      }
    });

    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // ============================
  //  Mitgliederverwaltung (Supabase)
  // ============================
  const loadMitglieder = async () => {
    if (!mitgliedListe) return;
    mitgliedListe.innerHTML = "Lade...";
    const { data, error } = await supabase.from("mitglieder").select("*").order("id", { ascending: true });
    mitgliedListe.innerHTML = "";
    if (error) {
      mitgliedListe.innerHTML = "<li>Fehler beim Laden!</li>";
      return;
    }
    if (data.length === 0) {
      mitgliedListe.innerHTML = "<li>Noch keine Mitglieder</li>";
      return;
    }
    data.forEach((mitglied) => {
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
      loeschenButton.addEventListener("click", async () => {
        await supabase.from("mitglieder").delete().eq("id", mitglied.id);
        loadMitglieder();
      });

      li.append(infoDiv, loeschenButton);
      mitgliedListe.appendChild(li);
    });
  };

  // Hinzufügen eines Mitglieds
  window.hinzufuegenMitglied = async () => {
    const name = document.getElementById("mitglied-name") ? document.getElementById("mitglied-name").value.trim() : "";
    const genre = document.getElementById("mitglied-genre") ? document.getElementById("mitglied-genre").value.trim() : "";
    const anime = document.getElementById("mitglied-anime") ? document.getElementById("mitglied-anime").value.trim() : "";

    if (name && genre && anime) {
      await supabase.from("mitglieder").insert([{ name, genre, anime }]);
      loadMitglieder();
      if (document.getElementById("mitglied-name")) document.getElementById("mitglied-name").value = "";
      if (document.getElementById("mitglied-genre")) document.getElementById("mitglied-genre").value = "";
      if (document.getElementById("mitglied-anime")) document.getElementById("mitglied-anime").value = "";
    }
  };

  // Mitglieder beim Laden anzeigen
  if (mitgliedListe) loadMitglieder();
});
