// ================================
// 1) Supabase-Client initialisieren via CDN-ESM
// ================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://pnhtasbeulnqcpvvlcvz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaHRhc2JldWxucWNwdnZsY3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MzEyNDcsImV4cCI6MjA2NDIwNzI0N30.D5vqyDHJgh3U4gOAWCRoRYec7oGvEfKw846riH_tsnA'
const supabase    = createClient(SUPABASE_URL, SUPABASE_KEY)


// =====================================
// 2) DOM ready: Datum, Dropdown & ggf. Mitglieder
// =====================================
document.addEventListener('DOMContentLoaded', () => {
  // — Elemente für Datum & Dropdown —
  const eventDateEl   = document.getElementById('event-date')
  const datePicker    = document.getElementById('date-picker')
  const countdownEl   = document.getElementById('countdown')

  // Hilfsfunkt.: zweiten Sonntag berechnen
  const calcSecondSunday = () => {
    const today = new Date()
    const firstDow = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
    const day   = firstDow === 0 ? 8 : 15 - firstDow
    return new Date(today.getFullYear(), today.getMonth(), day)
      .toISOString().slice(0,10)
  }

  // Event-Datum holen
  async function getEventDate() {
    const { data, error } = await supabase
      .from('eventdaten')
      .select('eventdate')
      .limit(1)
      .single()
    if (error) {
      console.error('Fehler bei getEventDate:', error)
      return calcSecondSunday()
    }
    return data?.eventdate ?? calcSecondSunday()
  }

  // Event-Datum setzen/aktualisieren
  async function setEventDate(date) {
    const { data: exists, error: e1 } = await supabase
      .from('eventdaten')
      .select('id')
      .limit(1)
      .single()
    if (e1) {
      console.error('Fehler beim Lesen eventdaten:', e1)
      return false
    }

    const res = exists?.id
      ? await supabase.from('eventdaten').update({ eventdate: date }).eq('id', exists.id)
      : await supabase.from('eventdaten').insert([{ eventdate: date }])

    if (res.error) {
      console.error('Fehler beim Setzen des Datums:', res.error)
      return false
    }
    return true
  }

  // Countdown aktualisieren
  function updateCountdown(dateStr) {
    const diff = new Date(dateStr) - new Date()
    const days = Math.ceil(diff / (1000*60*60*24))
    countdownEl.textContent = `Noch ${days} Tage bis zum Event!`
  }

  // Anzeige refreshen
  async function refreshEventDisplay() {
    const date = await getEventDate()
    const fmt  = new Date(date).toLocaleDateString('de-DE', {
      weekday:'long', day:'numeric', month:'long', year:'numeric'
    })
    eventDateEl.textContent = fmt
    datePicker.value       = date
    updateCountdown(date)
  }

  // Datepicker toggeln & speichern
  window.toggleDatePicker = () => {
    datePicker.style.display =
      datePicker.style.display === 'block' ? 'none' : 'block'
  }
  datePicker.addEventListener('change', async () => {
    if (await setEventDate(datePicker.value)) {
      await refreshEventDisplay()
    } else {
      alert('Konnte Datum nicht speichern. Sieh in der Konsole nach.')
    }
  })

  // initial Datum laden/setzen
  ;(async () => {
    const date = await getEventDate()
    if (!date) await setEventDate(calcSecondSunday())
    await refreshEventDisplay()
  })()


  // — Dropdown-Menü —
  const menuIcon = document.querySelector('.menu-icon')
  const dropdown = document.querySelector('.dropdown')
  let open = false

  menuIcon?.addEventListener('click', e => {
    e.stopPropagation()
    open = !open
    dropdown.classList.toggle('show', open)
  })
  document.addEventListener('click', () => {
    if (open) dropdown.classList.remove('show'), open = false
  })
  dropdown?.addEventListener('click', e => e.stopPropagation())


  // — Mitglieder nur auf mitglieder.html —
  const mitgliedListe = document.getElementById('mitglied-liste')
  if (mitgliedListe) {
    // Mitglieder laden
    async function loadMitglieder() {
      mitgliedListe.innerHTML = '<li>Lade...</li>'
      const { data, error } = await supabase
        .from('mitglieder')
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        console.error('Fehler beim Laden der Mitglieder:', error)
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

        li.innerHTML = `
          <div class="mitglied-info">
            <h3>${m.name}</h3>
            <p>Lieblingsgenres: ${m.genre}</p>
            <p>Lieblingsanime: ${m.anime}</p>
          </div>
          <button class="löschen">Löschen</button>
        `
        li.querySelector('button').addEventListener('click', async () => {
          await supabase.from('mitglieder').delete().eq('id', m.id)
          loadMitglieder()
        })
        mitgliedListe.appendChild(li)
      })
    }

    // Neues Mitglied hinzufügen (wird global für onclick bereitgestellt)
    window.hinzufuegenMitglied = async () => {
      const n = document.getElementById('mitglied-name').value.trim()
      const g = document.getElementById('mitglied-genre').value.trim()
      const a = document.getElementById('mitglied-anime').value.trim()
      if (!(n && g && a)) return

      const { error } = await supabase
        .from('mitglieder')
        .insert([{ name:n, genre:g, anime:a }])
      if (error) {
        console.error('Fehler beim Einfügen:', error)
        alert('Mitglied konnte nicht hinzugefügt werden.')
        return
      }

      // Felder zurücksetzen & neu laden
      document.getElementById('mitglied-name').value  = ''
      document.getElementById('mitglied-genre').value = ''
      document.getElementById('mitglied-anime').value = ''
      loadMitglieder()
    }

    // erstmaliges Laden
    loadMitglieder()
  }
})
