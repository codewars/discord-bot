import { Client } from "discord.js";

export const makeOnReady = (bot: Client) => async () => {
  console.log("ready!");
  await bot.user?.setPresence({
    status: "online",
  });
};
