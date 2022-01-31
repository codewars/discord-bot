import { Client, Intents } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { onMessage, onInteraction, makeOnReady } from "./events";
import commands from "./events/message/commands";

const CLIENT_ID = process.env.CLIENT_ID;
if (!CLIENT_ID) throw new Error("missing CLIENT_ID");
const GUILD_ID = process.env.GUILD_ID;
if (!GUILD_ID) throw new Error("missing GUILD_ID");
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) throw new Error("missing BOT_TOKEN");

const rest = new REST({ version: "9" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: Object.values(commands).map((command) => command.spec.toJSON()),
    });

    const bot = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
    });

    bot.once("ready", makeOnReady(bot));
    bot.on("messageCreate", onMessage);
    bot.on("interactionCreate", onInteraction);

    bot.login(TOKEN);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
