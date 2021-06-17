import { Message } from "discord.js";

import commands, { parseArguments } from "./commands";
import handlers from "./handlers";

const PREFIX = process.env.COMMAND_PREFIX || "?";

// `client` can be accessed from `message.client`.
export const onMessage = (message: Message) => {
  // Never react to bots
  if (message.author.bot) return;

  const content = message.content;
  if (content.startsWith(PREFIX)) {
    const rest = content.slice(PREFIX.length);
    const name = rest.match(/^\S+/)?.[0];
    // Run command and finish if known, otherwise ignore.
    if (name && commands.hasOwnProperty(name)) {
      const body = rest.slice(name.length).trimLeft();
      commands[name](message, parseArguments(body));
      return;
    }
  }

  // Other handlers, only the first match is applied
  for (const handler of handlers) {
    if (handler.test(message)) {
      handler.action(message);
      return;
    }
  }
};
