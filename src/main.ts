import { Client } from "discord.js";

import { onMessage, makeOnReady } from "./events";

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) throw new Error("missing BOT_TOKEN");

const bot = new Client();

bot.once("ready", makeOnReady(bot));
bot.on("message", onMessage);

bot.login(TOKEN);
