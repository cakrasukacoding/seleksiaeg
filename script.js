/* ─────────────────────────────
   CANVAS BACKGROUND
───────────────────────────── */
const bgCanvas = document.getElementById('bg-canvas')
const bgCtx    = bgCanvas.getContext('2d')
let W, H, pts = []

function resize() {
  W = bgCanvas.width  = window.innerWidth
  H = bgCanvas.height = window.innerHeight
}
resize()
window.addEventListener('resize', () => { resize(); initPts() })

function initPts() {
  pts = []
  const n = Math.floor((W * H) / 18000)
  for (let i = 0; i < n; i++) {
    pts.push({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.2 + 0.4
    })
  }
}
initPts()

function drawBg() {
  bgCtx.clearRect(0, 0, W, H)
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  const clr    = isDark ? 'rgba(255,255,255,' : 'rgba(0,0,0,'

  pts.forEach(p => {
    p.x += p.vx; p.y += p.vy
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
    bgCtx.beginPath()
    bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    bgCtx.fillStyle = clr + '0.35)'
    bgCtx.fill()
  })

  pts.forEach((a, i) => {
    for (let j = i + 1; j < pts.length; j++) {
      const b = pts[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d < 100) {
        bgCtx.beginPath()
        bgCtx.moveTo(a.x, a.y); bgCtx.lineTo(b.x, b.y)
        bgCtx.strokeStyle = clr + (0.06 * (1 - d / 100)) + ')'
        bgCtx.lineWidth = 0.5
        bgCtx.stroke()
      }
    }
  })
  requestAnimationFrame(drawBg)
}
drawBg()

/* ─────────────────────────────
   SKILLS DATA
───────────────────────────── */
const SKILLS = [
  { key: 'gfx',      label: 'GFX'      },
  { key: 'l2d',      label: 'L2D'      },
  { key: 'jj',       label: 'JJ'       },
  { key: 'jjsoft',   label: 'JJ Soft'  },
  { key: 'jjbrutal', label: 'JJ Brutal'},
  { key: 'threed',   label: '3D'       },
]

const skillState = {}
SKILLS.forEach(s => { skillState[s.key] = null })

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
      <button type="button" class="skill-btn" data-skill="${key}" data-val="yes">YES</button>
      <button type="button" class="skill-btn" data-skill="${key}" data-val="no">NO</button>
    </div>
  `
  grid.appendChild(row)
})

grid.addEventListener('click', e => {
  const btn = e.target.closest('.skill-btn')
  if (!btn) return

  const skill = btn.dataset.skill
  const val   = btn.dataset.val

  skillState[skill] = val === 'yes'

  grid.querySelectorAll(`[data-skill="${skill}"]`).forEach(b => {
    b.classList.remove('active-yes', 'active-no')
  })
  btn.classList.add(val === 'yes' ? 'active-yes' : 'active-no')
})

/* ─────────────────────────────
   VIDEO UPLOAD
───────────────────────────── */
let selectedVideoFile = null

function onVideoSelected(input) {
  const file = input.files[0]
  if (!file) return

  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    showPopup('Video terlalu besar. Maks 50MB.', false)
    input.value = ''
    return
  }

  selectedVideoFile = file

  document.getElementById('upload-placeholder').style.display = 'none'
  document.getElementById('upload-selected').style.display    = 'block'
  document.getElementById('upload-filename').textContent      = file.name
  document.getElementById('upload-area').classList.add('has-file')
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}

/* ─────────────────────────────
   THEME
───────────────────────────── */
const html = document.documentElement
let dark = true

function applyTheme(isDark) {
  dark = isDark
  html.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

document.getElementById('theme-toggle')
  ?.addEventListener('click', () => applyTheme(!dark))

document.getElementById('theme-toggle-mobile2')
  ?.addEventListener('click', () => applyTheme(!dark))

/* ─────────────────────────────
   MOBILE MENU
───────────────────────────── */
const hamburger  = document.getElementById('hamburger')
const mobileMenu = document.getElementById('mobile-menu')

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open')
  mobileMenu.classList.toggle('open')
})

document.querySelectorAll('.mobile-link').forEach(link => {
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
  const icon  = document.getElementById('popup-icon')
  const text  = document.getElementById('popup-msg')

  icon.className   = ok ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'
  text.textContent = msg

  popup.classList.add('show')
  setTimeout(() => popup.classList.remove('show'), 4000)
}

/* ─────────────────────────────
   DEVICE INFO
───────────────────────────── */
function getDeviceInfo() {
  const ua = navigator.userAgent
  let device = 'Desktop'
  if (/Android/i.test(ua))          device = 'Android'
  else if (/iPhone|iPad|iPod/i.test(ua)) device = 'iOS'

  let browser = 'Unknown'
  if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Safari/i.test(ua))  browser = 'Safari'
  else if (/Edge/i.test(ua))    browser = 'Edge'

  return { device, browser }
}

/* ─────────────────────────────
   SUBMIT FORM
───────────────────────────── */
async function submitForm() {
  const nama   = document.getElementById('nama').value.trim()
  const daerah = document.getElementById('daerah').value.trim()
  const umur   = document.getElementById('umur').value.trim()

  if (!nama || !daerah || !umur) {
    showPopup('Mohon lengkapi semua field.', false)
    return
  }

  const btn = document.getElementById('submit-btn')
  btn.disabled = true
  btn.innerHTML = '<span class="spinner"></span> Sending...'

  const { device, browser } = getDeviceInfo()
  const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })

  try {
    // Convert video to base64 if selected
    let videoBase64 = null
    let videoName   = null

    if (selectedVideoFile) {
      btn.innerHTML = '<span class="spinner"></span> Uploading video...'
      videoBase64 = await fileToBase64(selectedVideoFile)
      videoName   = selectedVideoFile.name
    }

    const res = await fetch('/api/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama, daerah, umur, skillState,
        device, browser, time,
        videoBase64, videoName
      })
    })

    const data = await res.json()

    if (data.success) {
      showPopup('Data berhasil dikirim ✅')

      // Reset form
      document.getElementById('recruit-form').reset()
      document.querySelectorAll('.skill-btn').forEach(b => {
        b.classList.remove('active-yes', 'active-no')
      })
      SKILLS.forEach(s => { skillState[s.key] = null })

      // Reset video upload
      selectedVideoFile = null
      document.getElementById('upload-placeholder').style.display = 'block'
      document.getElementById('upload-selected').style.display    = 'none'
      document.getElementById('upload-area').classList.remove('has-file')
      document.getElementById('video-file').value = ''

    } else {
      throw new Error(data.error || 'Unknown error')
    }

  } catch (err) {
    console.error(err)
    showPopup(err.message, false)

  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Registration'
  }
}

/* ─────────────────────────────
   SCROLL REVEAL
───────────────────────────── */
const revealEls = document.querySelectorAll('.reveal')
const observer  = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible')
    })
  },
  { threshold: 0.12 }
)
revealEls.forEach(el => observer.observe(el))
