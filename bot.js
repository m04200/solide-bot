require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

/* 🔥 ANTI CRASH */
process.on("unhandledRejection", (err) => {
  console.log("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.log("❌ Uncaught Exception:", err);
});

/* 🤖 DISCORD BOT */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* 🌐 EXPRESS SERVER (RENDER) */
const app = express();

/* 💚 PRODUITS SOLIDAZEN */
const produits = [
  { name: "DVD occasion", price: "2€" },
  { name: "Livre solidaire", price: "1€" },
  { name: "Jeu enfant", price: "3€" },
  { name: "Lot jouets", price: "5€" },
  { name: "Pack solidarité", price: "10€" }
];

/* 🧠 IA PERSONNALITÉ */
const SYSTEM_PROMPT = `
Tu es l'assistant officiel de Solidazen.

Tu es :
- humain, chaleureux, simple
- orienté aide et solidarité
- jamais agressif commercialement

Tu peux proposer :
- dons Solidazen
- produits d’occasion
`;

/* 🎯 produit aléatoire */
function randomProduct() {
  return produits[Math.floor(Math.random() * produits.length)];
}

/* 🤖 READY */
client.once('ready', () => {
  console.log("🤖 Solidazen IA Bot connecté !");
});

/* 💬 MESSAGE IA */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    const userMessage = message.content;
    const text = userMessage.toLowerCase();

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

    let reply = ia.data?.choices?.[0]?.message?.content 
      || "Je n'ai pas compris 😅";

    /* 🛒 LOGIQUE VENTE */
    if (
      text.includes("acheter") ||
      text.includes("produit") ||
      text.includes("prix") ||
      text.includes("boutique")
    ) {
      const p = randomProduct();

      reply += `\n\n🛍️ Produit Solidazen :
👉 ${p.name} - ${p.price}
💚 Acheter / soutenir :
${process.env.PAYPAL_LINK}`;
    }

    /* 💰 LOGIQUE DON */
    if (
      text.includes("don") ||
      text.includes("aide") ||
      text.includes("soutenir")
    ) {
      reply += `\n\n💚 Merci pour ton soutien !
👉 Faire un don :
${process.env.PAYPAL_LINK}`;
    }

    message.reply(reply);

  } catch (err) {
  console.log("❌ OPENAI FULL ERROR:", JSON.stringify(err.response?.data, null, 2));
  console.log("❌ MESSAGE:", err.message);

  message.reply("❌ IA erreur : " + (err.response?.data?.error?.message || err.message));
  }
});

/* 🌐 KEEP ALIVE (RENDER) */
app.get("/", (req, res) => {
  res.send("Solidazen bot actif 🤖");
});

/* ⚡ PORT DYNAMIQUE (IMPORTANT RENDER) */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🌐 Serveur actif sur port " + PORT);
});

console.log("IA key loaded:", process.env.OPENAI_API_KEY ? "OK" : "MISSING");

/* 🔐 LOGIN DISCORD */
client.login(process.env.DISCORD_TOKEN);
