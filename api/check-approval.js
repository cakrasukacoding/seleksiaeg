import { pendingStore } from "./login.js"

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      approved: false
    })
  }

  const { token } = req.body

  const data =
    pendingStore.get(token)

  if (!data) {
    return res.json({
      approved: false,
      denied: true
    })
  }

  return res.json({
    approved:
      data.status === "approved",

    denied:
      data.status === "rejected"
  })
}
