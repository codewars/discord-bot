import { readFileSync } from "fs";
import * as path from "path";
import { Role } from "discord.js";
import { Message, CommandArg } from "../types";

const isModerator = (role: Role) => role.name === "admin" || role.name === "mods";
const textPath = path.join(process.cwd(), "text");
let warnText = "";
try {
  warnText = readFileSync(path.join(textPath, "warn.md")).toString();
} catch (err) {
  console.error(`failed to read texts under ${textPath}: ${err.message || "unknown error"}`);
  process.exit(1);
}

// warn
export default async (message: Message, args: CommandArg[]) => {
  // Authorization
  const author = message.guild?.members.cache.get(message.author.id);
  if (!author) return;
  const isPrivileged = author.roles.cache.some(isModerator);
  if (!isPrivileged) return;

  // Input validation
  if (args.length !== 1) return;
  const mention = args[0];
  if (mention.type !== "user") return;
  const user = message.client.users.cache.get(mention.id);
  if (!user) return;

  // Action
  try {
    const dm = await user.createDM();
    await dm.send(warnText);
  } catch (err) {
    console.warn(`failed to DM ${user.tag}: ${err.message || "unknown error"}`);
    await message.channel.send(
      `<@${mention.id}>, I couldn't DM you. See <https://github.com/codewars/discord-bot/blob/main/text/warn.md> instead.`
    );
  }
};
