import { pendingStore } from "./login.js";

export default async function handler(req, res) {

  const { token } = req.query;

  const data = pendingStore.get(token);

  if (!data) {
    return res.status(404).json({
      success: false,
      status: "not_found"
    });
  }

  return res.status(200).json({
    success: true,
    status: data.status
  });
}
