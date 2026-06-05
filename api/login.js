import crypto from "crypto";

export const pendingStore =
  global.pendingStore ||
  (global.pendingStore = new Map());

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Username dan password wajib diisi"
    });
  }

  const token = crypto.randomBytes(24).toString("hex");

  pendingStore.set(token, {
    username,
    status: "pending",
    createdAt: Date.now()
  });

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

Izinkan login?`,
        reply_markup: {
          inline_keyboard: [[
            {
              text: "✅ Izinkan",
              callback_data: `approve:${token}`
            },
            {
              text: "❌ Tolak",
              callback_data: `deny:${token}`
            }
          ]]
        }
      })
    }
  );

  const tgData = await telegramRes.json();

  if (!tgData.ok) {
    return res.status(500).json({
      success: false,
      error: tgData.description
    });
  }

  return res.status(200).json({
    success: true,
    token
  });
}
