import { Message } from "./types";

// ping takes no args
export default async (message: Message) => {
  await message.reply("pong");
};
