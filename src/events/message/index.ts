import { Message } from "discord.js";

import handlers from "./handlers";

// `client` can be accessed from `message.client`.
export const onMessage = async (message: Message) => {
  // Never react to bots
  if (message.author.bot) return;

  // Message handlers. Stops when a handler returns true.
  // Catch any unexpected error. Each handler should handle errors.
  try {
    for (const action of handlers) {
      if (await action(message)) return;
    }
  } catch (e) {
    console.error(e.message);
  }
};
