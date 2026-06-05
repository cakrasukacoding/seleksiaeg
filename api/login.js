export default async function handler(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: "API login berjalan"
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
}
