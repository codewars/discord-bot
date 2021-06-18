import { stripIndents } from "common-tags";

import { Message, CommandArg } from "./types";

export default async (message: Message, args: CommandArg[], opts: Record<string, string>) => {
  await message.channel.send("received the following:\n" + output(args, opts));
};

// Export for testing
export const output = (args: CommandArg[], opts: Record<string, string>) => stripIndents`
    arguments:
    ${jsonBlock(JSON.stringify(args))}
    options:
    ${jsonBlock(JSON.stringify(opts))}
  `;

const jsonBlock = (s: string) => "```json\n" + s + "\n```";
