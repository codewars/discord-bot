import { Command } from "./types";

// ping takes no args
const ping: Command = async (message) => {
  await message.reply("pong");
};

export default ping;
