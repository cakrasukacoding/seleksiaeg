import { pendingStore } from "./login.js";

export default async function handler(req, res) {

  const callback =
    req.body?.callback_query;

  if (!callback) {
    return res.status(200).end();
  }

  const data =
    callback.data;

  if (data.startsWith("approve:")) {

    const token =
      data.replace("approve:", "");

    const login =
      pendingStore.get(token);

    if (login) {

      login.status = "approved";

      pendingStore.set(
        token,
        login
      );
    }
  }

  if (data.startsWith("deny:")) {

    const token =
      data.replace("deny:", "");

    const login =
      pendingStore.get(token);

    if (login) {

      login.status = "denied";

      pendingStore.set(
        token,
        login
      );
    }
  }

  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerCallbackQuery`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        callback_query_id:
          callback.id
      })
    }
  );

  return res.status(200).end();
}
