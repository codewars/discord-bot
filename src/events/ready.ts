import { Client } from "discord.js";
import { PREFIX } from "./messageCreate";

export const makeOnReady = (bot: Client) => async () => {
  console.log("ready!");
  bot.user?.setPresence({
    status: "online",
    activities: [
      {
        name: `${PREFIX}help`,
        type: "PLAYING",
      },
    ],
  });
};
