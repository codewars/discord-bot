import { readFileSync } from "fs";
import * as path from "path";
import { Role, Interaction } from "discord.js";

const isModerator = (role: Role) => role.name === "admin" || role.name === "mods";
const isTrustedUser = (role: Role) => isModerator(role) || role.name === "power-users";

const textPath = path.join(__dirname, "../text");

export const fromModerator = (interaction: Interaction): boolean => {
  const author = interaction.guild?.members.cache.get(interaction.user.id);
  if (!author) return false;
  const isPrivileged = author.roles.cache.some(isModerator);
  if (!isPrivileged) return false;
  return true;
};

export const fromTrustedUser = (interaction: Interaction): boolean => {
  const author = interaction.guild?.members.cache.get(interaction.user.id);
  if (!author) return false;
  const isTrusted = author.roles.cache.some(isTrustedUser);
  if (!isTrusted) return false;
  return true;
};

export const getTexts = (commandName: string, values: string[]): Map<string, string> => {
  const commandPath = path.join(textPath, commandName);
  const texts: Map<string, string> = new Map();
  try {
    for (const value of values)
      texts.set(value, readFileSync(path.join(commandPath, `${value}.md`)).toString());
  } catch (err) {
    console.error(`failed to read texts under ${commandPath}: ${err.message || "unknown error"}`);
    process.exit(1);
  }
  return texts;
};
