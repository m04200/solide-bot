require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const app = express();

/* 💚 PRODUITS SOLIDAZEN */
const produits = [
  { name: "DVD occasion", price: "2€" },
  { name: "Livre solidaire", price: "1€" },
  { name: "Jeu enfant", price: "3€" },
  { name: "Lot jouets", price: "5€" },
  { name: "Pack solidarité", price: "10€" }
];

/* 🧠 PERSONNALITÉ IA (HUMAIN + SOLIDAIRE) */
const SYSTEM_PROMPT = `
Tu es l'assistant officiel de Solidazen.

Ton rôle :
- Parler comme un humain naturel, chaleureux et simple
- Aider les personnes
- Expliquer la boutique et les dons
- Encourager sans forcer
- Toujours orienté solidarité, entraide et anti-gaspillage

Si possible, tu peux proposer :
- produits d’occasion Solidazen
- dons PayPal pour soutenir l’association

Tu ne dois jamais être agressif commercialement.
`;

/* 🎯 choisir un produit aléatoire */
function randomProduct() {
  return produits[Math.floor(Math.random() * produits.length)];
}

/* 🤖 BOT READY */
client.once('ready', () => {
  console.log("🤖 Solidazen IA Bot connecté !");
});

/* 💬 MESSAGE EVENT */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    const userMessage = message.content;

    /* 🧠 APPEL IA */
    const ia = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    let reply = ia.data.choices[0].message.content;

    const text = userMessage.toLowerCase();

    /* 🛒 LOGIQUE VENTE AUTOMATIQUE */
    if (
      text.includes("acheter") ||
      text.includes("produit") ||
      text.includes("prix") ||
      text.includes("boutique")
    ) {
      const p = randomProduct();

      reply += `\n\n🛍️ Suggestion Solidazen :
👉 ${p.name} - ${p.price}
💚 Soutenir / acheter :
${process.env.PAYPAL_LINK}`;
    }

    /* 💰 LOGIQUE DON */
    if (
      text.includes("don") ||
      text.includes("aide") ||
      text.includes("soutenir")
    ) {
      reply += `\n\n💚 Merci pour ton soutien !
👉 Faire un don ici :
${process.env.PAYPAL_LINK}`;
    }

    message.reply(reply);

  } catch (err) {
    console.error(err);
    message.reply("❌ Erreur IA temporaire, réessaie dans un instant.");
  }
});

/* 🌐 KEEP ALIVE (Render) */
app.get("/", (req, res) => {
  res.send("Solidazen bot actif 🤖");
});

app.listen(3000, () => {
  console.log("Serveur actif sur port 3000");
});

/* 🔐 LOGIN DISCORD */
client.login(process.env.DISCORD_TOKEN);
