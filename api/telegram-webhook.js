import { pendingStore } from "./login.js"

export default async function handler(req, res) {

  const update = req.body

  if (update.callback_query) {

    const data =
      update.callback_query.data

    const [action, token] =
      data.split(":")

    const loginData =
      pendingStore.get(token)

    if (loginData) {

      loginData.status =
        action === "approve"
          ? "approved"
          : "rejected"

      pendingStore.set(
        token,
        loginData
      )
    }
  }

  res.status(200).json({
    ok: true
  })
}
