// api/registrations.js
// Fetches registration messages from Telegram chat history and parses them.
// Requires ADMIN_TOKEN env var to protect this endpoint.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  // Auth check
  const auth = req.headers['authorization'] || ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  try {
    // Fetch updates from Telegram (last 100 messages)
    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUpdates?limit=100&allowed_updates=["message"]`
    )
    const tgData = await tgRes.json()

    if (!tgData.ok) throw new Error(tgData.description)

    const registrations = []

    for (const update of tgData.result) {
      const msg = update?.message
      if (!msg || !msg.text) continue

      // Only parse messages from the correct chat
      if (String(msg.chat.id) !== String(process.env.CHAT_ID)) continue

      // Check if it's a registration message
      if (!msg.text.includes('AEG CLAN REGISTRATION')) continue

      const parsed = parseRegistration(msg.text, msg.caption_entities)

      // Check for associated video (next message after registration)
      // We'll store videoUrl if the message has a document/video
      if (parsed) {
        registrations.push(parsed)
      }
    }

    // Also check for file messages linked to registrations
    // (send.js sends registration text first, then video as separate message)
    for (const update of tgData.result) {
      const msg = update?.message
      if (!msg) continue
      if (String(msg.chat.id) !== String(process.env.CHAT_ID)) continue

      // Look for video/document messages with registration caption
      const hasMedia = msg.video || msg.document
      if (!hasMedia) continue

      const caption = msg.caption || ''
      if (!caption.includes('AEG')) continue

      // Try to get file URL
      const fileId = msg.video?.file_id || msg.document?.file_id
      if (fileId) {
        const fileUrl = await getTelegramFileUrl(fileId)
        // Match to registration by caption (nama)
        const namaMatch = caption.match(/Nama:\s*(.+)/i)
        if (namaMatch) {
          const nama = namaMatch[1].trim()
          const reg = registrations.find(r => r.nama === nama)
          if (reg) reg.videoUrl = fileUrl
        }
      }
    }

    return res.status(200).json({ success: true, registrations: registrations.reverse() })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: err.message })
  }
}

async function getTelegramFileUrl(fileId) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${fileId}`)
    const d = await r.json()
    if (!d.ok) return null
    return `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${d.result.file_path}`
  } catch { return null }
}

function parseRegistration(text) {
  try {
    const get = (label) => {
      const regex = new RegExp(`${label}:\\s*(.+)`)
      const match = text.match(regex)
      return match ? match[1].trim() : '—'
    }

    const parseBool = (val) => {
      if (!val || val === 'Belum dipilih ❓') return null
      return val.includes('✅')
    }

    return {
      nama:     get('Nama'),
      daerah:   get('Daerah'),
      umur:     get('Umur'),
      device:   get('Device'),
      browser:  get('Browser'),
      time:     get('Time'),
      videoUrl: null,
      skillState: {
        gfx:      parseBool(get('GFX')),
        l2d:      parseBool(get('L2D')),
        jj:       parseBool(get('JJ')),
        jjsoft:   parseBool(get('JJ Soft')),
        jjbrutal: parseBool(get('JJ Brutal')),
        threed:   parseBool(get('3D')),
      }
    }
  } catch { return null }
}
