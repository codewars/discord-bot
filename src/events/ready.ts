import { Client } from "discord.js";

export const makeOnReady = (bot: Client) => async () => {
  await bot.user?.setPresence({
    status: "online",
  });
};
