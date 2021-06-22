import { TextChannel } from "discord.js";
import { fromModerator, getTexts } from "../../../../common";
import { Message, CommandArg } from "../types";

const channels = ["help-solve"];
const USAGE = `Usage: \`?introduce @user #{${channels.join(",")}}\``;
const channelTexts: Map<string, string> = getTexts("introduce", channels);

// introduce
export default async (message: Message, args: CommandArg[]) => {
  // Authorization
  if (!fromModerator(message)) return;

  // Input validation
  if (args.length !== 2) {
    message.reply(USAGE);
    return;
  }
  const mention = args[0];
  if (mention.type !== "user") {
    message.reply(USAGE);
    return;
  }
  const user = message.client.users.cache.get(mention.id);
  if (!user) {
    console.warn("Could not find the user with ID: " + mention.id);
    return;
  }
  const channelMention = args[1];
  if (channelMention.type !== "channel") {
    message.reply(USAGE);
    return;
  }
  const channel = message.client.channels.cache.get(channelMention.id);
  if (!channel) {
    console.warn("Could not find the channel with ID: " + channelMention.id);
    return;
  }
  if (!(channel instanceof TextChannel)) {
    message.reply(USAGE);
    return;
  }
  if (!channels.includes(channel.name)) {
    message.reply(USAGE);
    return;
  }

  // Action
  try {
    const reply = channelTexts.get(channel.name);
    if (!reply) {
      console.warn("Could not get the text for channel #" + channel.name);
      return;
    }
    const dm = await user.createDM();
    await dm.send(reply);
  } catch (err) {
    console.warn(`failed to DM ${user.tag}: ${err.message || "unknown error"}`);
    await message.channel.send(
      `<@${mention.id}>, I couldn't DM you. See <https://github.com/codewars/discord-bot/blob/main/text/introduce/${channel.name}.md> instead.`
    );
  }
};
