require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers // ✅ pour détecter nouveaux membres
  ]
});

const app = express();

/* 🔐 VARIABLES SAFE */
const PAYPAL = process.env.PAYPAL_LINK || "https://www.paypal.com/paypalme/solidazen";

/* 💚 PRODUITS */
const produits = [
  { name: "DVD occasion", price: "2€", type: "fun" },
  { name: "Livre solidaire", price: "1€", type: "lecture" },
  { name: "Jeu enfant", price: "3€", type: "famille" },
  { name: "Lot jouets", price: "5€", type: "enfant" },
  { name: "Pack solidarité", price: "10€", type: "don" }
];

/* 🧠 MÉMOIRE */
const users = {};
const relances = {};

/* 🎯 UTILS */
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectIntent(text) {
  text = text.toLowerCase();

  if (text.match(/bonjour|salut|hey/)) return "greeting";
  if (text.match(/produit|prix|acheter|boutique/)) return "buy";
  if (text.match(/don|soutenir|aider/)) return "don";
  if (text.match(/quoi|info|association/)) return "info";

  return "other";
}

function suggestProduct(userId) {
  const user = users[userId] || {};

  if (user.interest === "lecture") return produits[1];
  if (user.interest === "famille") return produits[2];

  return random(produits);
}

/* 🤖 IA GRATUITE */
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
    "C’est top 🙏",
    "Ça fait plaisir 😊"
  ];

  if (intent === "greeting") {
    return random([
      "Salut 😊 ! Bienvenue chez Solidazen 💚 Tu veux aider ou découvrir nos produits ?",
      "Hello 👋 ! On aide les personnes en difficulté 💚 Tu veux voir comment ?"
    ]);
  }

  if (intent === "info") {
    return `${random(empathie)}

Solidazen aide concrètement les personnes en difficulté.

👉 Tu peux soit faire un don, soit acheter solidaire 💚`;
  }

  if (intent === "buy") {
    const p = suggestProduct(userId);
    users[userId].interest = p.type;

    return `${random(empathie)} 😊

👉 ${p.name} - ${p.price}

💚 Chaque achat aide quelqu’un.

👉 Acheter ici :
${PAYPAL}`;
  }

  if (intent === "don") {
    return `${random(empathie)} 🙏

💚 Même 1€ peut aider énormément.

👉 Faire un don :
${PAYPAL}`;
  }

  // relance douce après plusieurs messages
  if (users[userId].messages >= 3) {
    const p = suggestProduct(userId);

    return `${random(empathie)} 😊

👉 ${p.name} - ${p.price}

ou

👉 soutenir ici :
${PAYPAL}

💚 Merci 🙏`;
  }

  return "Je suis là si tu veux aider ou découvrir Solidazen 💚";
}

/* 🤖 BOT READY */
client.once('clientReady', () => {
  console.log("🤖 Solidazen MACHINE À CASH connectée !");
});

/* 📩 NOUVEAUX MEMBRES (SAFE) */
client.on('guildMemberAdd', async (member) => {
  try {
    await member.send(`Salut 👋 bienvenue chez Solidazen 💚

👉 Tu peux aider ici :
${PAYPAL}

Merci 🙏`);
  } catch (err) {
    console.log("❌ DM impossible");
  }
});

/* 💬 MESSAGE */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  const reply = generateReply(message.content, userId);

  // réponse avec effet humain
  setTimeout(() => {
    message.reply(reply);
  }, Math.random() * 1500 + 500);

  /* 💰 RELANCE AUTO (SAFE) */
  if (!relances[userId]) {
    relances[userId] = setTimeout(() => {
      if (message.channel) {
        message.channel.send(`💚 Juste pour te dire :

Même un petit don aide énormément 🙏

👉 ${PAYPAL}`);
      }
    }, 60000);
  }

  /* 🛒 COMMANDE */
  if (message.content === "!boutique") {
    message.reply(`🛍️ Boutique :

DVD - 2€
Livre - 1€
Jeux - 3€
Pack - 10€

👉 ${PAYPAL}`);
  }

  /* 💥 TRIGGER */
  if (message.content.toLowerCase() === "ok") {
    message.reply(`💚 Merci !

👉 ${PAYPAL}`);
  }
});

/* 🌐 KEEP ALIVE */
app.get("/", (req, res) => {
  res.send("Bot actif");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Serveur actif");
});

/* 🔐 LOGIN */
client.login(process.env.DISCORD_TOKEN);
