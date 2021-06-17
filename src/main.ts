import { Client } from "discord.js";

import { onMessage } from "./events";

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) throw new Error("missing BOT_TOKEN");

const bot = new Client();

bot.on("ready", () => {
  bot.user?.setPresence({
    status: "online",
  });
});

bot.on("message", onMessage);

bot.login(TOKEN);
