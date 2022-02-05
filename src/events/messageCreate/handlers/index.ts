import { Message } from "discord.js";

import trainerLink from "./trainer-link";

// We can expand this later if we need more than stop/continue.
/// Apply some action to `message`. Return `true` if handled and should stop.
export type MessageAction = (message: Message) => Promise<boolean>;

// Reorder this to control precedence.
const handlers: MessageAction[] = [
  // Detects trainer link
  trainerLink,
];
export default handlers;
