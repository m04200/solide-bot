const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField } = require("discord.js");
const dotenv = require("dotenv");
const config = require("./config.json");

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// =========================
// READY
// =========================
client.once("ready", () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// =========================
// WELCOME SYSTEM
// =========================
client.on("guildMemberAdd", member => {
  const channel = member.guild.channels.cache.get(config.welcomeChannel);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("Bienvenue chez Solidazen ❤️")
    .setDescription(`Bonjour ${member}, bienvenue dans notre association Solidazen 🙏\nNous aidons les personnes en grande précarité.`)
    .setFooter({ text: "Solidazen Association" });

  channel.send({ embeds: [embed] });
});

// =========================
// COMMANDES
// =========================
client.on("messageCreate", async message => {
  if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // HELP
  if (cmd === "help") {
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("Commandes Solidazen")
      .setDescription(`
!help - Affiche les commandes
!don - Infos dons
!kick @user
!ban @user
!clear 10
!ticket
      `);
    return message.reply({ embeds: [embed] });
  }

  // DON
  if (cmd === "don") {
    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("💰 Soutenir Solidazen")
      .setDescription(`
🙏 Merci pour votre soutien !

PayPal : https://www.paypal.com/paypalme/solidazen

💳 Virement :
IBAN : FR76 XXXX XXXX XXXX XXXX

📮 Courrier :
Solidazen - 18 rue Molière, 42160 Andrézieux
      `);
    return message.channel.send({ embeds: [embed] });
  }

  // CLEAR
  if (cmd === "clear") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("❌ Permission refusée");

    const amount = parseInt(args[0]);
    if (!amount) return message.reply("Nombre invalide");

    await message.channel.bulkDelete(amount);
    message.channel.send(`🧹 ${amount} messages supprimés`).then(m => setTimeout(() => m.delete(), 3000));
  }

  // KICK
  if (cmd === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("❌ Permission refusée");

    const user = message.mentions.members.first();
    if (!user) return message.reply("Utilisateur invalide");

    user.kick();
    message.channel.send(`👢 ${user.user.tag} expulsé`);
  }

  // BAN
  if (cmd === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ Permission refusée");

    const user = message.mentions.members.first();
    if (!user) return message.reply("Utilisateur invalide");

    user.ban();
    message.channel.send(`⛔ ${user.user.tag} banni`);
  }

  // TICKET SIMPLE
  if (cmd === "ticket") {
    const channel = await message.guild.channels.create({
      name: `ticket-${message.author.username}`,
      type: 0,
      parent: config.ticketCategory,
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: message.author.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
        {
          id: config.staffRole,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    channel.send(`🎫 Ticket créé par ${message.author}`);
    message.reply("🎫 Ticket créé !");
  }
});

// =========================
// LOGS (messages supprimés)
// =========================
client.on("messageDelete", message => {
  const log = message.guild.channels.cache.get(config.logChannel);
  if (!log) return;

  log.send(`🗑️ Message supprimé dans ${message.channel} : ${message.content}`);
});

// =========================
// ANTI-SPAM SIMPLE
// =========================
const usersMap = new Map();

client.on("messageCreate", message => {
  if (message.author.bot) return;

  const now = Date.now();
  const userData = usersMap.get(message.author.id) || [];

  const recent = userData.filter(t => now - t < 5000);
  recent.push(now);

  usersMap.set(message.author.id, recent);

  if (recent.length > 5) {
    message.delete();
    message.channel.send(`🚨 ${message.author}, stop le spam !`).then(m => setTimeout(() => m.delete(), 3000));
  }
});

client.login(process.env.TOKEN);
