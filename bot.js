require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();

/* 🤖 CLIENT DISCORD (VERSION SAFE) */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* 🔐 CONFIG SAFE */
const PAYPAL = process.env.PAYPAL_LINK || "https://www.paypal.com/paypalme/solidazen";

/* 💚 PRODUITS */
const produits = [
  { name: "DVD occasion", price: "2€" },
  { name: "Livre solidaire", price: "1€" },
  { name: "Jeu enfant", price: "3€" },
  { name: "Lot jouets", price: "5€" },
  { name: "Pack solidarité", price: "10€" }
];

/* 🧠 SIMULATION IA SIMPLE (ULTRA STABLE) */
function brain(message) {
  const text = message.toLowerCase();

  if (text.includes("bonjour") || text.includes("salut")) {
    return "Salut 👋💚 Bienvenue chez Solidazen ! Tu veux aider ou découvrir nos produits ?";
  }

  if (text.includes("aide") || text.includes("association")) {
    return `💚 Solidazen aide les personnes en difficulté.

Tu peux :
- faire un don 🙏
- acheter solidaire 🛍️

👉 ${PAYPAL}`;
  }

  if (text.includes("acheter") || text.includes("produit") || text.includes("prix")) {
    const p = produits[Math.floor(Math.random() * produits.length)];

    return `🛍️ Produit disponible :

👉 ${p.name} - ${p.price}

💚 Chaque achat aide quelqu’un.

👉 Acheter ici :
${PAYPAL}`;
  }

  if (text.includes("don") || text.includes("soutenir")) {
    return `💚 Merci pour ton soutien 🙏

👉 Faire un don ici :
${PAYPAL}

Chaque euro compte.`;
  }

  return "💚 Je suis là pour t’aider. Tu peux parler de dons, produits ou aide.";
}

/* 🤖 READY */
client.once('ready', () => {
  console.log("🤖 Solidazen STABLE PRO connecté !");
});

/* 💬 MESSAGE */
client.on('messageCreate', (message) => {
  try {
    if (message.author.bot) return;

    const reply = brain(message.content);

    setTimeout(() => {
      message.reply(reply).catch(() => {});
    }, 800);

  } catch (err) {
    console.log("❌ ERROR:", err.message);
  }
});

/* 🌐 EXPRESS KEEP ALIVE (RENDER) */
app.get("/", (req, res) => {
  res.send("Solidazen bot OK 💚");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🌐 Serveur OK sur port", PORT);
});

/* 🔐 LOGIN SAFE */
if (!process.env.DISCORD_TOKEN) {
  console.log("❌ DISCORD_TOKEN manquant");
} else {
  client.login(process.env.DISCORD_TOKEN);
}
