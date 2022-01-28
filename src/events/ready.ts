import { Client } from "discord.js";
import { PREFIX } from "./message";

export const makeOnReady = (bot: Client) => async () => {
  console.log("ready!");
  await bot.user?.setPresence({
    status: "online",
    activity: {
      name: `${PREFIX}help`,
      type: "PLAYING",
    },
  });
};
