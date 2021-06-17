import { Message } from "discord.js";

/// A command.
export type Command = (message: Message, args: CommandArgs) => void;

// Argument validation should happen in each command.
// On error, commands can post a help message that's deleted after some time.
export type CommandArgs = {
  // Key value pairs from flags. `--foo=bar`
  options: { [k: string]: string };
  // Positional arguments
  args: CommandArg[];
};

export type CommandArg = string | CodeBlock | DiscordObject;

export type CodeBlock = {
  type: "code";
  info: string;
  code: string;
};

export type DiscordObject = {
  type: "user" | "role" | "channel";
  id: string;
};
