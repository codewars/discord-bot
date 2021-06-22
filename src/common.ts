import { readFileSync } from "fs";
import * as path from "path";
import { Role, Message } from "discord.js";

const isModerator = (role: Role) => role.name === "admin" || role.name === "mods";

const textPath = path.join(__dirname, "../text");

export const fromModerator = (message: Message): boolean => {
  const author = message.guild?.members.cache.get(message.author.id);
  if (!author) return false;
  const isPrivileged = author.roles.cache.some(isModerator);
  if (!isPrivileged) return false;
  return true;
};

export const getTexts = (commandName: string, values: string[]): Map<string, string> => {
  const commandPath = path.join(textPath, commandName);
  const texts: Map<string, string> = new Map();
  for (const value of values) {
    try {
      texts.set(value, readFileSync(path.join(commandPath, `${value}.md`)).toString());
    } catch (err) {
      console.error(`failed to read texts under ${commandPath}: ${err.message || "unknown error"}`);
      process.exit(1);
    }
  }
  return texts;
};
