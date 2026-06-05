// api/check-approval.js
// Frontend polls this after login request to check if admin approved/denied.

const pendingStore = global._aegPendingStore || (global._aegPendingStore = new Map())

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { token } = req.body

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token required.' })
  }

  if (!pendingStore.has(token)) {
    return res.status(404).json({ success: false, approved: false, denied: false, error: 'Token tidak ditemukan atau kadaluarsa.' })
  }

  const entry = pendingStore.get(token)

  // Check expiry
  if (Date.now() > entry.expires) {
    pendingStore.delete(token)
    return res.status(200).json({ success: true, approved: false, denied: true, error: 'Token kadaluarsa.' })
  }

  if (entry.status === 'approved') {
    // Clean up after use
    pendingStore.delete(token)
    return res.status(200).json({ success: true, approved: true, denied: false })
  }

  if (entry.status === 'denied') {
    pendingStore.delete(token)
    return res.status(200).json({ success: true, approved: false, denied: true })
  }

  // Still pending
  return res.status(200).json({ success: true, approved: false, denied: false, pending: true })
}
