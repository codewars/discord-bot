import { Message } from "discord.js";
import { parse } from "discord-command-parser";

import commands from "./commands";
import handlers from "./handlers";

const PREFIX = process.env.COMMAND_PREFIX || "?";

// `client` can be accessed from `message.client`.
export const onMessage = (message: Message) => {
  // Never react to bots
  if (message.author.bot) return;

  // Parse command arguments. Also used to detect commands.
  // See https://github.com/campbellbrendene/discord-command-parser
  const parsed = parse(message, PREFIX);
  if (parsed.success) {
    if (commands.hasOwnProperty(parsed.command)) {
      // To access arguments, use `parsed.arguments` for simple string array or
      // `parsed.reader` to parse arguments sequentially.
      commands[parsed.command](message, parsed);
    }
    // Ignore unknown command
    return;
  } else if (parsed.error) {
    // Abort if errored
    console.error(parsed.error);
    return;
  }

  // Other handlers, only the first match is applied
  for (const handler of handlers) {
    if (handler.test(message)) {
      handler.action(message);
      return;
    }
  }
};
