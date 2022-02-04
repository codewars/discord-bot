import { Client, Intents } from "discord.js";

import { fromEnv } from "./config";
import { updateCommands } from "./commands";
import { onCommand, onMessageCreate, makeOnReady } from "./events";

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

// Add event listeners
bot.once("ready", makeOnReady(bot));
bot.on("messageCreate", onMessageCreate);
bot.on("interactionCreate", onCommand);

// Update commands and join
(async () => {
  try {
    console.log("Updating application (/) commands");
    await updateCommands(config);
    console.log("Updated application (/) commands");
  } catch (error) {
    console.error(error);
    console.error("Failed to register commands. Aborting.");
    // Prevent the bot from running with outdated commands data.
    process.exit(1);
  }

  await bot.login(config.BOT_TOKEN);
})();
