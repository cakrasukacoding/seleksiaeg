// api/send.js
// Handles registration form submission.
// Now supports optional MP4 video upload (base64 encoded).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const {
      nama,
      daerah,
      umur,
      skillState,
      device,
      browser,
      time,
      videoBase64,   // optional: base64-encoded MP4
      videoName      // optional: original filename
    } = req.body

    const fmt = (v) => {
      if (v === null || v === undefined) return 'Belum dipilih ❓'
      return v ? 'Iya ✅' : 'Tidak ❌'
    }

    const message =
`📥 AEG CLAN REGISTRATION

👤 Nama: ${nama}
🌍 Daerah: ${daerah}
🎂 Umur: ${umur}

━━━━━━━━━━━━━━

🖌️ GFX: ${fmt(skillState.gfx)}
✨ L2D: ${fmt(skillState.l2d)}
⚡ JJ: ${fmt(skillState.jj)}
🌸 JJ Soft: ${fmt(skillState.jjsoft)}
🔥 JJ Brutal: ${fmt(skillState.jjbrutal)}
🧊 3D: ${fmt(skillState.threed)}

━━━━━━━━━━━━━━

🖥️ Device: ${device}
🌐 Browser: ${browser}
🕒 Time: ${time}`

    // 1. Send text message
    const textRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text: message
        })
      }
    )
    const textData = await textRes.json()
    if (!textData.ok) throw new Error(textData.description)

    // 2. Send video if provided
    if (videoBase64) {
      // Convert base64 to buffer
      const videoBuffer = Buffer.from(videoBase64, 'base64')
      const filename = videoName || 'edit.mp4'

      // Build multipart/form-data manually using FormData
      const formData = new FormData()
      formData.append('chat_id', String(process.env.CHAT_ID))
      formData.append(
        'video',
        new Blob([videoBuffer], { type: 'video/mp4' }),
        filename
      )
      formData.append('caption', `🎬 Video Edit dari: ${nama}`)
      formData.append('supports_streaming', 'true')

      const videoRes = await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendVideo`,
        { method: 'POST', body: formData }
      )
      const videoData = await videoRes.json()
      // Non-fatal: log but don't fail
      if (!videoData.ok) {
        console.warn('Video upload failed:', videoData.description)
      }
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: err.message })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'   // Allow large base64 video payloads
    }
  }
}
