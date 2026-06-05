export default async function handler(req, res) {

  const url =
    process.env.UPSTASH_REDIS_REST_URL

  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN

  const r = await fetch(
    `${url}/set/test/hello`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const data = await r.json()

  res.status(200).json(data)
}
