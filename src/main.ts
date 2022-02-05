import { Client } from "discord.js";

import { fromEnv } from "./config";
import { onMessage, makeOnReady } from "./events";

const config = fromEnv();

const bot = new Client();

bot.once("ready", makeOnReady(bot));
bot.on("message", onMessage);

bot.login(config.BOT_TOKEN);
