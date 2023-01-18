import { Client, ActivityType } from "discord.js";

export const makeOnReady = (bot: Client) => async () => {
  console.log("ready!");
  bot.user?.setPresence({
    status: "online",
    activities: [
      {
        name: "Codewars",
        type: ActivityType.Playing,
        url: "https://www.codewars.com/",
      },
    ],
  });
};
