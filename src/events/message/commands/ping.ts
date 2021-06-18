import { Command } from "./types";

// ping takes no args
const ping: Command = (message) => {
  message.reply("pong");
};

export default ping;
