import { z } from "zod";
import { CommandArg, Message, word } from "../types";

// "?link <topic>" provides a simple shortcut to various useful URLs

const LINKS: { [k: string]: string } = {
  docs: "https://docs.codewars.com/",
  honor: "https://docs.codewars.com/gamification/honor",
  katas: "https://www.codewars.com/kata/latest/my-languages",
  authoring: "https://docs.codewars.com/authoring",
  ranking: "https://docs.codewars.com/curation/kata",
  troubleshooting: "https://docs.codewars.com/training/troubleshooting",
  github: "https://github.com/codewars/",
};

const USAGE: string = `Usage: \`?link {${Object.keys(LINKS).join("|")}}\``;

export default async (message: Message, args: CommandArg[]) => {
  // Input validation
  const result = z.tuple([word((w) => LINKS.hasOwnProperty(w))]).safeParse(args);
  if (!result.success) {
    message.reply(USAGE);
    return;
  }
  const [link] = result.data;

  // Respond with link
  await message.channel.send(`See <${LINKS[link]}>`);
};
