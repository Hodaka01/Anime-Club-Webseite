// ================================
// 1) Supabase-Client initialisieren
// ================================
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pnhtasbeulnqcpvvlcvz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaHRhc2JldWxucWNwdnZsY3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MzEyNDcsImV4cCI6MjA2NDIwNzI0N30.D5vqyDHJgh3U4gOAWCRoRYec7oGvEfKw846riH_tsnA'
const supabase    = createClient(SUPABASE_URL, SUPABASE_KEY)


// =====================================
// 2) DOM ready: Datum, Dropdown, Mitglieder
// =====================================
document.addEventListener('DOMContentLoaded', () => {
  // Elemente
  const eventDateEl   = document.getElementById('event-date')
  const datePicker    = document.getElementById('date-picker')
  const countdownEl   = document.getElementById('countdown')
  const mitgliedListe = document.getElementById('mitglied-liste')

  // --- Hilfsfunktionen für Datum ---
  const calcSecondSunday = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
    const dayOfMonth = firstDayOfMonth === 0
      ? 8
      : 15 - firstDayOfMonth
    return new Date(today.getFullYear(), today.getMonth(), dayOfMonth)
      .toISOString().slice(0,10)
  }

  async function getEventDate() {
    const { data, error } = await supabase
      .from('eventdaten')
      .select('*')
      .limit(1)
      .single()
    if (error) {
      console.error('Supabase Fehler bei getEventDate():', error)
      return calcSecondSunday()
    }
    return data?.eventdate ?? calcSecondSunday()
  }

  async function setEventDate(date) {
    // erst prüfen, ob ein Datensatz existiert
    const { data: existing, error: err1 } = await supabase
      .from('eventdaten')
      .select('id')
      .limit(1)
      .single()
    if (err1) {
      console.error('Supabase Fehler beim Lesen von eventdaten:', err1)
      return false
    }

    let res
    if (existing?.id) {
      res = await supabase
        .from('eventdaten')
        .update({ eventdate: date })
        .eq('id', existing.id)
    } else {
      res = await supabase
        .from('eventdaten')
        .insert([{ eventdate: date }])
    }

    if (res.error) {
      console.error('Supabase Fehler beim Setzen des Datums:', res.error)
      return false
    }
    return true
  }

  function updateCountdown(dateStr) {
    const diffMs = new Date(dateStr) - new Date()
    const days   = Math.ceil(diffMs / (1000*60*60*24))
    countdownEl.textContent = `Noch ${days} Tage bis zum Event!`
  }

  async function refreshEventDisplay() {
    const date = await getEventDate()
    const formatted = new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long', day:'numeric', month:'long', year:'numeric'
    })
    eventDateEl.textContent = formatted
    datePicker.value = date
    updateCountdown(date)
  }

  // --- Datepicker toggeln & speichern ---
  window.toggleDatePicker = () => {
    datePicker.style.display =
      datePicker.style.display === 'block' ? 'none' : 'block'
  }

  datePicker.addEventListener('change', async () => {
    const ok = await setEventDate(datePicker.value)
    if (ok) {
      await refreshEventDisplay()
    } else {
      alert('Konnte Datum nicht speichern. Details in der Konsole.')
    }
  })

  // beim Start: Standard-Datum setzen oder laden
  (async () => {
    const date = await getEventDate()
    // falls leer: neuen Eintrag anlegen
    if (!date) {
      await setEventDate(calcSecondSunday())
    }
    await refreshEventDisplay()
  })()


  // ====================================
  // Dropdown-Menü
  // ====================================
  const menuIcon = document.querySelector('.menu-icon')
  const dropdown = document.querySelector('.dropdown')
  let open = false

  menuIcon?.addEventListener('click', e => {
    e.stopPropagation()
    open = !open
    dropdown.classList.toggle('show', open)
  })

  document.addEventListener('click', () => {
    if (open) {
      dropdown.classList.remove('show')
      open = false
    }
  })

  dropdown?.addEventListener('click', e => e.stopPropagation())


  // ====================================
  // Mitglieder laden, hinzufügen, löschen
  // ====================================
  async function loadMitglieder() {
    mitgliedListe.innerHTML = '<li>Lade...</li>'
    const { data, error } = await supabase
      .from('mitglieder')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Supabase Fehler beim Laden der Mitglieder:', error)
      mitgliedListe.innerHTML = '<li>Fehler beim Laden!</li>'
      return
    }

    mitgliedListe.innerHTML = ''
    if (!data.length) {
      mitgliedListe.innerHTML = '<li>Noch keine Mitglieder</li>'
      return
    }

    data.forEach(m => {
      const li = document.createElement('li')
      li.className = 'mitglied-item'

      const info = document.createElement('div')
      info.className = 'mitglied-info'
      info.innerHTML = `
        <h3>${m.name}</h3>
        <p>Lieblingsgenres: ${m.genre}</p>
        <p>Lieblingsanime: ${m.anime}</p>
      `

      const btn = document.createElement('button')
      btn.className = 'löschen'
      btn.textContent = 'Löschen'
      btn.addEventListener('click', async () => {
        const { error: eDel } = await supabase
          .from('mitglieder')
          .delete()
          .eq('id', m.id)
        if (eDel) {
          console.error('Fehler beim Löschen eines Mitglieds:', eDel)
        }
        loadMitglieder()
      })

      li.append(info, btn)
      mitgliedListe.appendChild(li)
    })
  }

  window.hinzufuegenMitglied = async () => {
    const n = document.getElementById('mitglied-name').value.trim()
    const g = document.getElementById('mitglied-genre').value.trim()
    const a = document.getElementById('mitglied-anime').value.trim()
    if (!(n && g && a)) return

    const { data, error } = await supabase
      .from('mitglieder')
      .insert([{ name:n, genre:g, anime:a }])

    if (error) {
      console.error('Fehler beim Einfügen eines neuen Mitglieds:', error)
      alert('Mitglied konnte nicht hinzugefügt werden.\n' + error.message)
      return
    }
    document.getElementById('mitglied-name').value  = ''
    document.getElementById('mitglied-genre').value = ''
    document.getElementById('mitglied-anime').value = ''

    loadMitglieder()
  }

  // Initial aufrufen
  loadMitglieder()
})
