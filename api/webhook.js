export default async function handler(req, res) {
  const VERIFY_TOKEN = "supremus123";
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

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
    
    if (msg) {
      const from = msg.from;
      const text = msg.text?.body;

      // Resposta fixa por enquanto - depois a gente conecta IA
      const reply = `Olá! Bot Supremus online 🚀 Você disse: ${text}`;

      // ENVIA DE VOLTA PRO WHATSAPP - ISSO QUE FALTAVA
      await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
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
    }
    
    return res.status(200).send("EVENT_RECEIVED");
  }
}
