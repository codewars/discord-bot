import { Message, CommandArg } from "../types";
import { Role, TextChannel } from "discord.js";
import { readFileSync } from "fs";
import * as path from "path";

const isModerator = (role: Role) => role.name === "admin" || role.name === "mods";
const channels = ["help-solve"];
const channelTexts: Map<string, string> = new Map();
const channelTextsPath = path.join(process.cwd(), "text");
try {
  for (const channel of channels)
    channelTexts.set(
      channel,
      readFileSync(path.join(channelTextsPath, `${channel}.md`)).toString()
    );
} catch (err) {
  console.error(
    `failed to read texts under ${channelTextsPath}: ${err.message || "unknown error"}`
  );
  process.exit(1);
}

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
  try {
    const reply = channelTexts.get(channel.name);
    if (!reply) return;
    const dm = await user.createDM();
    await dm.send(reply);
  } catch (err) {
    console.warn(`failed to DM ${user.tag}: ${err.message || "unknown error"}`);
    await message.channel.send(
      `<@${mention.id}>, I couldn't DM you. See <https://github.com/codewars/discord-bot/blob/main/text/${channel.name}.md> instead.`
    );
  }
};
