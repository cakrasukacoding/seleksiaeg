import { pendingStore } from './login.js'

export default async function handler(req, res) {

  const update = req.body

  if (update.callback_query) {

    const callback =
      update.callback_query.data

    const [action, token] =
      callback.split(':')

    const data =
      pendingStore.get(token)

    if (data) {

      data.status =
        action === 'approve'
          ? 'approved'
          : 'denied'

      pendingStore.set(token, data)
    }
  }

  res.status(200).end()
}
