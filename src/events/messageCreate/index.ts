import { Message } from "discord.js";

import commands, { parseArguments } from "./commands";
import handlers from "./handlers";

export const PREFIX = process.env.COMMAND_PREFIX || "?";

const HELP: string = `The following commands are available:

${Object.keys(commands)
  .map((name) => `- \`${PREFIX}${name}\``)
  .join("\n")}

Note that some commands are only available to privileged users.`;

// `client` can be accessed from `message.client`.
export const onMessageCreate = async (message: Message) => {
  // Never react to bots
  if (message.author.bot) return;

  const content = message.content;
  if (content.startsWith(PREFIX)) {
    const rest = content.slice(PREFIX.length);
    const name = rest.match(/^\S+/)?.[0];
    // Run command and finish if known, otherwise ignore.
    // The help command is special and lists all other existing commands.
    if (name === "help") {
      message.channel.send(HELP);
      return;
    }
    if (name && commands.hasOwnProperty(name)) {
      const body = rest.slice(name.length).trimLeft();
      const { args, options } = parseArguments(body);
      // Catch any unexpected error. Each command should handle errors.
      try {
        await commands[name](message, args, options);
      } catch (e) {
        console.error(e.message);
      }
      return;
    }
  }

  // Other handlers. Stops when a handler returns true.
  // Catch any unexpected error. Each handler should handle errors.
  try {
    for (const action of handlers) {
      if (await action(message)) return;
    }
  } catch (e) {
    console.error(e.message);
  }
};
