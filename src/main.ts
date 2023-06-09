import { Client, GatewayIntentBits, Events } from "discord.js";

import { fromEnv } from "./config";
import { updateCommands } from "./commands";
import { onAutocomplete, onCommand, onMessageCreate, makeOnReady } from "./events";

const config = fromEnv();

const bot = new Client({
  intents: [
    // Required to work properly.
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    // For `messageCreate`.
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,

    GatewayIntentBits.DirectMessageReactions,
  ],
  allowedMentions: {
    // Parse roles and users mentions in the context. But not @everyone, nor @here.
    parse: ["roles", "users"],
    // Mention the author of the message being replied.
    repliedUser: true,
  },
});

// Add event listeners
bot.once(Events.ClientReady, makeOnReady(bot));
bot.on(Events.MessageCreate, onMessageCreate);
bot.on(Events.InteractionCreate, onCommand);
bot.on(Events.InteractionCreate, onAutocomplete);

// Update commands and join
(async () => {
  try {
    await bot.login(config.BOT_TOKEN);
    console.log("Updating application (/) commands");
    await updateCommands(bot, config);
    console.log("Updated application (/) commands");
  } catch (error) {
    console.error(error);
    console.error("Failed to register commands. Aborting.");
    // Prevent the bot from running with outdated commands data.
    process.exit(1);
  }
})();
