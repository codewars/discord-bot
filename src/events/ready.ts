import { Client } from "discord.js";

const PREFIX = process.env.COMMAND_PREFIX || "?";

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
