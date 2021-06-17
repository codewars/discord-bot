import { Command } from "./types";

// ping takes no args
const ping: Command = (message, _args) => {
  message.reply("pong");
};

export default ping;
