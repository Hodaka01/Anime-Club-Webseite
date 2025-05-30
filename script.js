// =============================================
//  Supabase Setup
// =============================================
const SUPABASE_URL = "https://pnhtasbeulnqcpvvlcvz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…";  // gekürzt
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================================
//  Main Logik nach DOM geladen
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  const eventDateDisplay = document.getElementById("event-date");
  const datePicker       = document.getElementById("date-picker");
  const countdownDisplay = document.getElementById("countdown");
  const mitgliedListe    = document.getElementById("mitglied-liste");

  // --- Eventdatum aus Supabase holen oder Standard berechnen ---
  const getEventDate = async () => {
    const { data, error } = await supabase
      .from("eventdaten")
      .select("*")
      .limit(1)
      .single();
    if (error || !data) return calcSecondSunday();
    return data.eventdate;
  };
  const calcSecondSunday = () => {
    const today = new Date();
    const fd    = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const dd    = fd === 0 ? 8 : 15 - fd;
    return new Date(today.getFullYear(), today.getMonth(), dd)
      .toISOString()
      .slice(0, 10);
  };
  const setEventDate = async (date) => {
    const { data } = await supabase.from("eventdaten").select("*").limit(1).single();
    if (data?.id) {
      await supabase.from("eventdaten").update({ eventdate: date }).eq("id", data.id);
    } else {
      await supabase.from("eventdaten").insert([{ eventdate: date }]);
    }
  };

  // --- Anzeige und Countdown updaten ---
  const updateCountdown = (d) => {
    const diff  = new Date(d) - new Date();
    const days  = Math.ceil(diff / (1000*60*60*24));
    countdownDisplay.textContent = `Noch ${days} Tage bis zum Event!`;
  };
  const updateDisplay = async () => {
    const d = await getEventDate();
    eventDateDisplay.textContent = new Date(d)
      .toLocaleDateString("de-DE", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
    datePicker.value = d;
    updateCountdown(d);
  };

  // --- Picker toggeln ---
  window.toggleDatePicker = () => {
    datePicker.style.display = datePicker.style.display === "block" ? "none" : "block";
  };
  datePicker.addEventListener("change", async () => {
    await setEventDate(datePicker.value);
    updateDisplay();
  });

  // --- Erster Start: Datum laden/setzen ---
  (async () => {
    const { data, error } = await supabase.from("eventdaten").select("*").limit(1).single();
    if (error || !data) {
      const std = calcSecondSunday();
      await setEventDate(std);
    }
    updateDisplay();
  })();

  // ============================
  //  Dropdown-Menü
  // ============================
  const menuIcon = document.querySelector(".menu-icon");
  const dropdown = document.querySelector(".dropdown");
  let open = false;
  menuIcon?.addEventListener("click", e => {
    e.stopPropagation();
    open = !open;
    dropdown.classList.toggle("show", open);
  });
  document.addEventListener("click", () => {
    if (open) {
      dropdown.classList.remove("show");
      open = false;
    }
  });
  dropdown?.addEventListener("click", e => e.stopPropagation());

  // ============================
  //  Mitgliederverwaltung
  // ============================
  const loadMitglieder = async () => {
    mitgliedListe.innerHTML = "Lade...";
    const { data, error } = await supabase
      .from("mitglieder")
      .select("*")
      .order("id", { ascending: true });

    mitgliedListe.innerHTML = "";
    if (error) return mitgliedListe.innerHTML = "<li>Fehler beim Laden!</li>";
    if (!data.length) return mitgliedListe.innerHTML = "<li>Noch keine Mitglieder</li>";

    data.forEach(m => {
      const li = document.createElement("li");
      li.classList.add("mitglied-item");

      const info = document.createElement("div");
      info.classList.add("mitglied-info");
      info.innerHTML = `<h3>${m.name}</h3>
                        <p>Lieblingsgenres: ${m.genre}</p>
                        <p>Lieblingsanime: ${m.anime}</p>`;

      const btn = document.createElement("button");
      btn.classList.add("löschen");
      btn.textContent = "Löschen";
      btn.addEventListener("click", async () => {
        await supabase.from("mitglieder").delete().eq("id", m.id);
        loadMitglieder();
      });

      li.append(info, btn);
      mitgliedListe.appendChild(li);
    });
  };

  window.hinzufuegenMitglied = async () => {
    const n = document.getElementById("mitglied-name").value.trim();
    const g = document.getElementById("mitglied-genre").value.trim();
    const a = document.getElementById("mitglied-anime").value.trim();
    if (n && g && a) {
      await supabase.from("mitglieder").insert([{ name: n, genre: g, anime: a }]);
      loadMitglieder();
      document.getElementById("mitglied-name").value = "";
      document.getElementById("mitglied-genre").value = "";
      document.getElementById("mitglied-anime").value = "";
    }
  };

  // lade Mitglieder initial
  loadMitglieder();
});
