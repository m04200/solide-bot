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

/* 🎯 réponses variées */
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* 🧠 simulation IA humaine */
function reponseIA(userMessage) {
  const text = userMessage.toLowerCase();

  // émotions / ton humain
  const empathie = [
    "Je vois 👍",
    "Je comprends 💚",
    "C’est super important 🙏",
    "Merci de t’y intéresser 😊",
    "Franchement ça fait plaisir 💚"
  ];

  const transitions = [
    "Du coup",
    "En vrai",
    "Honnêtement",
    "Ce que tu peux faire",
    "Je te conseille"
  ];

  // SALUTATION
  if (text.match(/bonjour|salut|hey/)) {
    return random([
      "Salut 😊 ! Bienvenue chez Solidazen 💚 Tu veux découvrir nos actions ou nos produits solidaires ?",
      "Hello 👋 ! Ici Solidazen 💚 On aide les personnes en difficulté. Tu cherches quoi exactement ?",
      "Salut ! 💚 Tu veux aider, acheter solidaire ou juste te renseigner ?"
    ]);
  }

  // AIDE / ASSOCIATION
  if (text.match(/aide|association|solidarité|sans abri/)) {
    return `${random(empathie)}.

Solidazen aide concrètement les personnes en difficulté (nourriture, vêtements, etc).

${random(transitions)} tu peux soit soutenir avec un don, soit acheter un produit solidaire 🙏`;
  }

  // PRODUITS
  if (text.match(/produit|boutique|acheter|prix/)) {
    const p = random(produits);

    return `${random(empathie)} 😊

On a pas mal de choses solidaires !

👉 ${p.name} - ${p.price}

💚 Chaque achat aide directement quelqu’un dans le besoin.

👉 Acheter ici :
${process.env.PAYPAL_LINK}`;
  }

  // DON
  if (text.match(/don|soutenir|aider financièrement/)) {
    return `${random(empathie)} 🙏

Chaque don compte vraiment, même petit.

👉 Faire un don :
${process.env.PAYPAL_LINK}

💚 Merci pour ton soutien, ça change des vies.`;
  }

  // CONVERSION DOUCE (ULTRA IMPORTANT)
  if (text.length > 5) {
    const p = random(produits);

    return `${random(empathie)} 😊

Si tu veux aider concrètement :

👉 ${p.name} - ${p.price}

ou

👉 faire un don ici :
${process.env.PAYPAL_LINK}

💚 même un petit geste fait une vraie différence.`;
  }

  return "Je suis là si tu veux aider ou découvrir Solidazen 💚";
}

/* 🤖 READY */
client.once('ready', () => {
  console.log("🤖 Solidazen IA GRATUITE ULTRA connectée !");
});

/* 💬 MESSAGE */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const reply = reponseIA(message.content);

  // simulation “humain”
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
