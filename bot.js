require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const fs = require('fs');

const app = express();

/* =========================
   🤖 CONFIG DISCORD SAFE
========================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* =========================
   🔐 CONFIG
========================= */
const PAYPAL = process.env.PAYPAL_LINK || "https://www.paypal.com/paypalme/solidazen";
const DB_FILE = "./database.json";

/* =========================
   💾 DATABASE SIMPLE
========================= */
function loadDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let db = loadDB();

/* =========================
   👤 USER SYSTEM
========================= */
function getUser(id) {
  if (!db[id]) {
    db[id] = {
      messages: 0,
      interest: null,
      lastSeen: Date.now(),
      segment: "👀 visiteur",
      score: 0
    };
  }
  return db[id];
}

/* =========================
   🧠 IA LOCALE
========================= */
function localAI(input) {
  const réponses = [
    "💚 Solidazen aide concrètement les personnes en difficulté.",
    "🙏 Chaque action compte.",
    "🛍️ Acheter solidaire = aider directement.",
    "🔥 Tu peux changer une vie aujourd’hui.",
    "💡 Merci de t’intéresser à Solidazen."
  ];

  if (input.includes("don")) {
    return `💚 Tu peux aider ici :\n👉 ${PAYPAL}`;
  }

  if (input.includes("acheter")) {
    return `🛍️ Boutique solidaire :\n👉 ${PAYPAL}`;
  }

  return réponses[Math.floor(Math.random() * réponses.length)];
}

/* =========================
   📊 SCORE + SEGMENTATION
========================= */
function scoreUser(user) {
  let score = 0;

  if (user.messages > 5) score += 2;
  if (user.messages > 10) score += 3;
  if (user.interest === "don") score += 5;
  if (user.interest === "achat") score += 3;

  user.score = score;

  if (score > 7) user.segment = "🔥 client chaud";
  else if (score > 3) user.segment = "🙂 intéressé";
  else user.segment = "👀 visiteur";
}

/* =========================
   💰 TUNNEL DE VENTE
========================= */
function salesTunnel(user) {

  if (user.segment.includes("visiteur")) {
    return `👀 Tu découvres Solidazen.

💚 Regarde comment aider :
👉 ${PAYPAL}`;
  }

  if (user.segment.includes("intéressé")) {
    return `🙂 Tu sembles intéressé.

🙏 Un petit geste peut aider :
👉 ${PAYPAL}`;
  }

  if (user.segment.includes("chaud")) {
    return `🔥 Tu es prêt à agir.

💰 Passe à l’action maintenant :
👉 ${PAYPAL}`;
  }
}

/* =========================
   📩 DM AUTOMATIQUE
========================= */
async function sendDM(userObj, discordUser) {
  try {
    if (!discordUser) return;

    let message = "";

    if (userObj.segment.includes("chaud")) {
      message = `🔥 Tu peux avoir un impact réel maintenant :
👉 ${PAYPAL}`;
    } else {
      message = `💚 Merci pour ton intérêt 🙏
👉 ${PAYPAL}`;
    }

    await discordUser.send(message);

  } catch (e) {}
}

/* =========================
   🔁 RELANCE AUTO
========================= */
setInterval(() => {
  const now = Date.now();

  for (let id in db) {
    const user = db[id];

    if (now - user.lastSeen > 3600000) { // 1h
      const discordUser = client.users.cache.get(id);
      sendDM(user, discordUser);
    }
  }

}, 600000);

/* =========================
   💬 MESSAGE SYSTEM
========================= */
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    const user = getUser(message.author.id);

    user.messages++;
    user.lastSeen = Date.now();

    const text = message.content.toLowerCase();

    if (text.includes("don")) user.interest = "don";
    if (text.includes("acheter")) user.interest = "achat";

    scoreUser(user);

    let reply = "";

    if (text.length < 5) {
      reply = localAI(text);
    } else {
      reply = salesTunnel(user);
    }

    saveDB(db);

    await message.reply(reply);

  } catch (err) {
    console.log("ERROR:", err.message);
  }
});

/* =========================
   🤖 READY
========================= */
client.once('ready', () => {
  console.log("🤖 SOLIDAZEN ULTIME ONLINE 💰");
});

/* =========================
   🌐 SERVER (ANTI-OFFLINE)
========================= */
app.get("/", (req, res) => {
  res.send("Bot actif 💚");
});

setInterval(() => {
  console.log("💚 Alive:", new Date().toLocaleTimeString());
}, 300000);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🌐 Serveur sur port", PORT);
});

/* =========================
   🔐 LOGIN
========================= */
if (!process.env.DISCORD_TOKEN) {
  console.log("❌ Token manquant");
} else {
  client.login(process.env.DISCORD_TOKEN);
}
