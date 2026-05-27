/* ─────────────────────────────
   SKILLS DATA
───────────────────────────── */
const SKILLS = [
  { key: 'gfx', label: 'GFX' },
  { key: 'l2d', label: 'L2D' },
  { key: 'jj', label: 'JJ' },
  { key: 'jjsoft', label: 'JJ Soft' },
  { key: 'jjbrutal', label: 'JJ Brutal' },
  { key: 'threed', label: '3D' },
]

const skillState = {}

SKILLS.forEach(s => {
  skillState[s.key] = null
})

/* ─────────────────────────────
   BUILD SKILL BUTTONS
───────────────────────────── */
const grid = document.getElementById('skills-grid')

SKILLS.forEach(({ key, label }) => {
  const row = document.createElement('div')

  row.className = 'skill-row'

  row.innerHTML = `
    <span class="skill-name">${label}</span>

    <div class="skill-btns">
      <button class="skill-btn" data-skill="${key}" data-val="yes">
        YES
      </button>

      <button class="skill-btn" data-skill="${key}" data-val="no">
        NO
      </button>
    </div>
  `

  grid.appendChild(row)
})

grid.addEventListener('click', e => {
  const btn = e.target.closest('.skill-btn')

  if (!btn) return

  const skill = btn.dataset.skill
  const val = btn.dataset.val

  skillState[skill] = val === 'yes'

  const btns = grid.querySelectorAll(`[data-skill="${skill}"]`)

  btns.forEach(b => {
    b.classList.remove('active-yes')
    b.classList.remove('active-no')
  })

  btn.classList.add(
    val === 'yes'
      ? 'active-yes'
      : 'active-no'
  )
})

/* ─────────────────────────────
   THEME
───────────────────────────── */
const html = document.documentElement

let dark = true

function applyTheme(isDark) {
  dark = isDark

  html.setAttribute(
    'data-theme',
    isDark ? 'dark' : 'light'
  )
}

document
  .getElementById('theme-toggle')
  ?.addEventListener('click', () => {
    applyTheme(!dark)
  })

document
  .getElementById('theme-toggle-mobile2')
  ?.addEventListener('click', () => {
    applyTheme(!dark)
  })

/* ─────────────────────────────
   MOBILE MENU
───────────────────────────── */
const hamburger = document.getElementById('hamburger')
const mobileMenu = document.getElementById('mobile-menu')

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open')
  mobileMenu.classList.toggle('open')
})

document.querySelectorAll('.mobile-link')
  .forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open')
      mobileMenu.classList.remove('open')
    })
  })

/* ─────────────────────────────
   POPUP
───────────────────────────── */
function showPopup(msg, ok = true) {
  const popup = document.getElementById('popup')
  const icon = document.getElementById('popup-icon')
  const text = document.getElementById('popup-msg')

  icon.className = ok
    ? 'fa-solid fa-circle-check'
    : 'fa-solid fa-circle-xmark'

  text.textContent = msg

  popup.classList.add('show')

  setTimeout(() => {
    popup.classList.remove('show')
  }, 4000)
}

/* ─────────────────────────────
   DEVICE INFO
───────────────────────────── */
function getDeviceInfo() {
  const ua = navigator.userAgent

  let device = 'Desktop'

  if (/Android/i.test(ua)) {
    device = 'Android'
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    device = 'iOS'
  }

  let browser = 'Unknown'

  if (/Chrome/i.test(ua)) {
    browser = 'Chrome'
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox'
  } else if (/Safari/i.test(ua)) {
    browser = 'Safari'
  }

  return {
    device,
    browser
  }
}

/* ─────────────────────────────
   SUBMIT FORM
───────────────────────────── */
async function submitForm() {
  const nama = document
    .getElementById('nama')
    .value
    .trim()

  const daerah = document
    .getElementById('daerah')
    .value
    .trim()

  const umur = document
    .getElementById('umur')
    .value
    .trim()

  if (!nama || !daerah || !umur) {
    showPopup(
      'Mohon lengkapi semua field.',
      false
    )

    return
  }

  const btn = document.getElementById('submit-btn')

  btn.disabled = true

  btn.innerHTML = `
    <span class="spinner"></span>
    Sending...
  `

  const { device, browser } = getDeviceInfo()

  const time = new Date()
    .toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta'
    })

  try {
    const res = await fetch('/api/send', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        nama,
        daerah,
        umur,
        skillState,
        device,
        browser,
        time
      })
    })

    const data = await res.json()

    if (data.success) {
      showPopup(
        'Data berhasil dikirim ✅'
      )

      document
        .getElementById('recruit-form')
        .reset()

      document
        .querySelectorAll('.skill-btn')
        .forEach(btn => {
          btn.classList.remove('active-yes')
          btn.classList.remove('active-no')
        })

      SKILLS.forEach(s => {
        skillState[s.key] = null
      })

    } else {
      throw new Error(data.error)
    }

  } catch (err) {
    console.error(err)

    showPopup(
      'Gagal mengirim data ❌',
      false
    )

  } finally {
    btn.disabled = false

    btn.innerHTML = `
      <i class="fa-solid fa-paper-plane"></i>
      Submit Registration
    `
  }
}

/* ─────────────────────────────
   SCROLL REVEAL
───────────────────────────── */
const revealEls =
  document.querySelectorAll('.reveal')

const observer =
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
      }
    })
  }, {
    threshold: 0.12
  })

revealEls.forEach(el => {
  observer.observe(el)
})