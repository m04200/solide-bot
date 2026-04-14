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
  { name: "DVD occasion", price: "2€" },
  { name: "Livre solidaire", price: "1€" },
  { name: "Jeu enfant", price: "3€" },
  { name: "Lot jouets", price: "5€" },
  { name: "Pack solidarité", price: "10€" }
];

/* 🎯 réponse humaine simulée */
function reponseIA(message) {
  const text = message.toLowerCase();

  // SALUTATIONS
  if (text.includes("bonjour") || text.includes("salut")) {
    return "Salut 😊 ! Je suis là pour t’aider. Tu cherches à soutenir Solidazen ou à découvrir nos produits solidaires ?";
  }

  // AIDE
  if (text.includes("aide") || text.includes("besoin")) {
    return "💚 Solidazen aide les personnes en difficulté avec des dons et des produits solidaires. Tu veux en savoir plus ?";
  }

  // BOUTIQUE
  if (text.includes("produit") || text.includes("boutique") || text.includes("prix")) {
    const p = produits[Math.floor(Math.random() * produits.length)];

    return `🛍️ On a plein de produits solidaires !

👉 ${p.name} - ${p.price}

Chaque achat aide directement une personne dans le besoin 💚

👉 Acheter / soutenir :
${process.env.PAYPAL_LINK}`;
  }

  // DON
  if (text.includes("don") || text.includes("soutenir")) {
    return `💚 Merci pour ton soutien !

👉 Faire un don ici :
${process.env.PAYPAL_LINK}

Chaque euro compte 🙏`;
  }

  // PAR DÉFAUT (réponse intelligente simulée)
  return "Je comprends 👍 Tu peux me parler de dons, de produits ou d’aide. Je suis là pour toi 💚";
}

/* 🤖 BOT READY */
client.once('ready', () => {
  console.log("🤖 Bot Solidazen GRATUIT connecté !");
});

/* 💬 MESSAGE */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const reply = reponseIA(message.content);
  message.reply(reply);
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
