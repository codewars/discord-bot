import { Client } from "discord.js";

export const makeOnReady = (bot: Client) => async () => {
  console.log("ready!");
  bot.user?.setPresence({
    status: "online",
    activities: [
      {
        name: `?help`,
        type: "PLAYING",
      },
    ],
  });
};
