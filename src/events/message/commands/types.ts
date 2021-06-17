import { Message } from "discord.js";
import { SuccessfulParsedMessage } from "discord-command-parser";

/// A command.
/// The second parameter contains parsed message to access arguments.
export type Command = (
  message: Message,
  parsed: SuccessfulParsedMessage<Message>
) => void;
