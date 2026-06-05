// api/telegram-webhook.js
// Telegram sends a POST here when admin taps ✅ Iya or ❌ Tidak.
// Set your webhook URL to: https://YOUR-DOMAIN/api/telegram-webhook

// Share the same in-memory store from login.js
const pendingStore = global._aegPendingStore || (global._aegPendingStore = new Map())

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  // Answer Telegram immediately (required within 60s)
  res.status(200).json({ ok: true })

  const update = req.body
  const cb = update?.callback_query
  if (!cb) return

  const callbackId = cb.id
  const data       = cb.data || ''   // "approve:<token>" or "deny:<token>"
  const chatId     = cb.message?.chat?.id
  const messageId  = cb.message?.message_id

  const [action, token] = data.split(':')
  if (!token || !pendingStore.has(token)) {
    // Expired or unknown token — answer the callback anyway
    await answerCallback(callbackId, '⚠️ Token kadaluarsa atau tidak valid.')
    return
  }

  const entry = pendingStore.get(token)

  // Guard: ignore if already acted on
  if (entry.status !== 'pending') {
    await answerCallback(callbackId, 'Sudah diproses sebelumnya.')
    return
  }

  if (action === 'approve') {
    entry.status = 'approved'
    pendingStore.set(token, entry)
    await answerCallback(callbackId, '✅ Akses diizinkan!')
    await editMessage(chatId, messageId,
      `✅ *Login DIIZINKAN*\n\n👤 Username: \`${entry.username}\`\n\nAkses diberikan.`)
  } else if (action === 'deny') {
    entry.status = 'denied'
    pendingStore.set(token, entry)
    await answerCallback(callbackId, '❌ Akses ditolak.')
    await editMessage(chatId, messageId,
      `❌ *Login DITOLAK*\n\n👤 Username: \`${entry.username}\`\n\nAkses ditolak.`)
  }
}

async function answerCallback(callbackQueryId, text) {
  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerCallbackQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text })
    }
  )
}

async function editMessage(chatId, messageId, text) {
  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/editMessageText`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown'
      })
    }
  )
}
