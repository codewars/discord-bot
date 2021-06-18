import { Message } from "discord.js";

const PATTERN = /https?:\/\/(www\.)?codewars.com\/kata\/[0-9a-f]{24}\/train\/[a-z]+/g;

/// Detect direct links to trainer and show adjusted links with some message.
export default async (message: Message) => {
  const trainerLinks = message.content.match(PATTERN);
  if (!trainerLinks) return false;

  // TODO Add some message
  const links = trainerLinks.map((s) => "- <" + s.replace(/\/train\/[a-z]+$/, "") + ">").join("\n");
  await message.reply(links);
  return true;
};
