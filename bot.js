require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const app = express();

/* 💚 PRODUITS */
const produits = [
  { name: "DVD occasion", price: "2€", type: "divertissement" },
  { name: "Livre solidaire", price: "1€", type: "lecture" },
  { name: "Jeu enfant", price: "3€", type: "famille" },
  { name: "Lot jouets", price: "5€", type: "enfant" },
  { name: "Pack solidarité", price: "10€", type: "don" }
];

/* 🧠 MÉMOIRE UTILISATEUR */
const users = {};

/* 🎯 outils */
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* 🧠 analyser intention */
function detectIntent(text) {
  text = text.toLowerCase();

  if (text.match(/bonjour|salut|hey/)) return "greeting";
  if (text.match(/produit|prix|acheter|boutique/)) return "buy";
  if (text.match(/don|soutenir|aider/)) return "don";
  if (text.match(/quoi|info|association/)) return "info";

  return "other";
}

/* 🧠 choisir produit intelligent */
function suggestProduct(userId) {
  const user = users[userId] || {};

  if (user.interest === "famille") {
    return produits.find(p => p.type === "enfant");
  }

  if (user.interest === "lecture") {
    return produits.find(p => p.type === "lecture");
  }

  return random(produits);
}

/* 🤖 IA VERSION BOSS */
function generateReply(message, userId) {
  const text = message.toLowerCase();
  const intent = detectIntent(text);

  if (!users[userId]) {
    users[userId] = { messages: 0 };
  }

  users[userId].messages++;

  const empathie = [
    "Je comprends 👍",
    "Merci pour ton message 💚",
    "Franchement c’est top 🙏",
    "Ça fait plaisir 😊"
  ];

  /* GREETING */
  if (intent === "greeting") {
    return random([
      "Salut 😊 ! Bienvenue chez Solidazen 💚 Tu veux aider ou découvrir nos produits ?",
      "Hello 👋 ! Ici Solidazen 💚 On aide concrètement les personnes en difficulté. Tu veux voir comment ?"
    ]);
  }

  /* INFO */
  if (intent === "info") {
    return `${random(empathie)}

Solidazen aide les personnes en difficulté avec des dons et des produits solidaires.

👉 Tu peux soit acheter solidaire, soit faire un don 🙏`;
  }

  /* ACHAT */
  if (intent === "buy") {
    const p = suggestProduct(userId);

    users[userId].interest = p.type;

    return `${random(empathie)} 😊

👉 ${p.name} - ${p.price}

💚 Chaque achat aide directement quelqu’un dans le besoin.

👉 Acheter ici :
${process.env.PAYPAL_LINK}`;
  }

  /* DON */
  if (intent === "don") {
    return `${random(empathie)} 🙏

💚 Chaque don a un impact réel.

👉 Faire un don :
${process.env.PAYPAL_LINK}`;
  }

  /* RELANCE AUTOMATIQUE (SECRET PUISSANT) */
  if (users[userId].messages >= 3) {
    const p = suggestProduct(userId);

    return `${random(empathie)} 😊

Juste pour te dire :

👉 ${p.name} - ${p.price}

ou

👉 soutenir ici :
${process.env.PAYPAL_LINK}

💚 même un petit geste aide énormément.`;
  }

  return "Je suis là si tu veux aider ou découvrir Solidazen 💚";
}

/* 🤖 READY */
client.once('ready', () => {
  console.log("🤖 Solidazen BOSS BOT connecté !");
});

/* 💬 MESSAGE */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const reply = generateReply(message.content, message.author.id);

  setTimeout(() => {
    message.reply(reply);
  }, Math.random() * 1500 + 500);
});

/* 🌐 KEEP ALIVE */
app.get("/", (req, res) => {
  res.send("Bot actif");
});

app.listen(3000, () => {
  console.log("Serveur actif");
});

/* 🔐 LOGIN */
client.login(process.env.DISCORD_TOKEN);
