import { Client, Intents } from "discord.js";

import { fromEnv } from "./config";
import { onMessageCreate, makeOnReady } from "./events";

const config = fromEnv();

const bot = new Client({
  intents: [
    // Required to work properly.
    Intents.FLAGS.GUILDS,
    // For `messageCreate`.
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  allowedMentions: {
    // Parse roles and users mentions in the context. But not @everyone, nor @here.
    parse: ["roles", "users"],
    // Mention the author of the message being replied.
    repliedUser: true,
  },
});

bot.once("ready", makeOnReady(bot));
bot.on("messageCreate", onMessageCreate);

bot.login(config.BOT_TOKEN);
