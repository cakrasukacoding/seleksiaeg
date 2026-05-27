export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false
    })
  }

  try {
    const {
      nama,
      daerah,
      umur,
      skillState,
      device,
      browser,
      time
    } = req.body

    const fmt = (v) => {
      if (v === null) {
        return 'Belum dipilih ❓'
      }

      return v
        ? 'Iya ✅'
        : 'Tidak ❌'
    }

    const message = `
📥 AEG CLAN REGISTRATION

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
🕒 Time: ${time}
`

    const telegram =
      await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            chat_id: process.env.CHAT_ID,
            text: message
          })
        }
      )

    const data = await telegram.json()

    if (!data.ok) {
      throw new Error(data.description)
    }

    return res.status(200).json({
      success: true
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
      }
