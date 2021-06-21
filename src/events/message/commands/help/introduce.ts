import { Message, CommandArg } from "../types";
import { Role, TextChannel } from "discord.js";
import { promises } from "fs";
import * as path from "path";

const isModerator = (role: Role) => role.name === "admin" || role.name === "mods";
const channels = ["help-solve"];

// introduce
export default async (message: Message, args: CommandArg[]) => {
  // Authorization
  const author = message.guild?.members.cache.get(message.author.id);
  if (!author) return;
  const isPrivileged = author.roles.cache.some(isModerator);
  if (!isPrivileged) return;

  // Input validation
  if (args.length !== 2) return;
  const mention = args[0];
  if (mention.type !== "user") return;
  const user = message.client.users.cache.get(mention.id);
  if (!user) return;
  const channelMention = args[1];
  if (channelMention.type !== "channel") return;
  const channel = message.client.channels.cache.get(channelMention.id);
  if (!(channel instanceof TextChannel)) return;
  if (!channels.includes(channel.name)) return;

  // Action
  const dmPath = path.join(path.join(process.cwd(), "text"), `${channel.name}.txt`);
  let reply;
  try {
    reply = (await promises.readFile(dmPath)).toString();
  } catch (err) {
    console.warn(`failed to open file ${dmPath}: ${err.message || "unknown error"}`);
    return;
  }
  try {
    const dm = await user.createDM();
    await dm.send(reply);
  } catch (err) {
    console.warn(`failed to DM ${user.tag}: ${err.message || "unknown error"}`);
    await message.channel.send(`<@${mention.id}> ${reply}`);
  }
};
