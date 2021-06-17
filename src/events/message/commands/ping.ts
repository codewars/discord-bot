import { Command } from "./types";

// ping takes no args
const ping: Command = (message, _parsed) => {
  message.reply("pong");
};

export default ping;
