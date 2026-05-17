export default async function handler(req, res) {
  const VERIFY_TOKEN = "supremus123";
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_ID = "1032513056622501";
  const AI_STUDIO_TOKEN = process.env.AI_STUDIO_TOKEN;
  const AI_ID = process.env.AI_ID;

  // Verificação do webhook da Meta
  if (req.method === "GET") {
    if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
      return res.status(200).send(req.query["hub.challenge"]);
    }
    return res.status(403).send("Token errado");
  }

  // Receber mensagens do WhatsApp
  if (req.method === "POST") {
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return res.status(200).send("EVENT_RECEIVED");

    const from = msg.from;
    const text = msg.text?.body;

    // Chama sua AI do Meta
    const aiRes = await fetch(`https://api.meta.ai/v1/ai/${AI_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_STUDIO_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: text })
    });
    const aiData = await aiRes.json();
    const reply = aiData.response || "Não entendi. Pode repetir?";

    // Responde no WhatsApp
    await fetch(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      })
    });

    return res.status(200).send("EVENT_RECEIVED");
  }
}
