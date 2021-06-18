import { Message } from "discord.js";

import commands, { parseArguments } from "./commands";
import handlers from "./handlers";

const PREFIX = process.env.COMMAND_PREFIX || "?";

// TODO Decide how to handle errors
// `client` can be accessed from `message.client`.
export const onMessage = async (message: Message) => {
  // Never react to bots
  if (message.author.bot) return;

  const content = message.content;
  if (content.startsWith(PREFIX)) {
    const rest = content.slice(PREFIX.length);
    const name = rest.match(/^\S+/)?.[0];
    // Run command and finish if known, otherwise ignore.
    if (name && commands.hasOwnProperty(name)) {
      const body = rest.slice(name.length).trimLeft();
      const { args, options } = parseArguments(body);
      await commands[name](message, args, options);
      return;
    }
  }

  // Other handlers. Stops when a handler returns true.
  for (const action of handlers) {
    if (await action(message)) return;
  }
};
