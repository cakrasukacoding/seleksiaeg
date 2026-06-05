import { pendingStore } from './login.js'

export default function handler(req, res) {

  const { token } = req.body

  const data = pendingStore.get(token)

  if (!data) {
    return res.json({
      approved: false,
      denied: true
    })
  }

  return res.json({
    approved: data.status === 'approved',
    denied: data.status === 'denied'
  })
}
