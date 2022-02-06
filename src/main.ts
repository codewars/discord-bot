import { Client, Intents } from "discord.js";

import { fromEnv } from "./config";
import { updateCommands, commands } from "./commands";
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
    const registeredCommands = await updateCommands(config);
    console.log("Updated application (/) commands");
    await bot.login(config.BOT_TOKEN);
    if (!config.ROLE_EVERYONE)
      console.warn("ROLE_EVERYONE is unset; some slash commands may not be available");
    const guild = bot.guilds.cache.get(config.GUILD_ID);
    if (!guild) throw new Error("Failed to fetch the current guild");
    for (const registeredCommand of registeredCommands) {
      const command = await guild.commands.fetch(registeredCommand.id);
      await command.permissions.set({ permissions: [] });
      await command.permissions.add({ permissions: commands[registeredCommand.name].permissions });
    }
  } catch (error) {
    console.error(error);
    console.error("Failed to register commands. Aborting.");
    // Prevent the bot from running with outdated commands data.
    process.exit(1);
  }
})();
