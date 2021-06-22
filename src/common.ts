import * as path from "path";
import { Role, Message } from "discord.js";

const isModerator = (role: Role) => role.name === "admin" || role.name === "mods";

export const fromModerator = (message: Message): boolean => {
  const author = message.guild?.members.cache.get(message.author.id);
  if (!author) return false;
  const isPrivileged = author.roles.cache.some(isModerator);
  if (!isPrivileged) return false;
  return true;
};

export const textPath = path.join(__dirname, "../text");
