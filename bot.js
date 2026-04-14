require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔥 PROMPT SYSTEME (PERSONNALITÉ SOLIDAZEN)
const SYSTEM_PROMPT = `
Tu es l'assistant officiel de Solidazen.
Association solidaire qui vend des objets d'occasion (livres, DVD, jouets).

Ton rôle :
- Aider les utilisateurs
- Encourager les dons
- Expliquer la boutique
- Être chaleureux, simple et humain
- Toujours orienté solidarité et entraide
`;

client.once('ready', () => {
  console.log("🤖 Bot IA Solidazen connecté !");
});

// 💬 MESSAGE EVENT
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 🔥 déclenchement seulement si mention ou prefix
  if (!message.content.startsWith("!ia")) return;

  const userMessage = message.content.replace("!ia", "");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    message.reply(reply);

  } catch (err) {
    console.error(err);
    message.reply("❌ Erreur IA temporaire.");
  }
});

client.login(process.env.DISCORD_TOKEN);
