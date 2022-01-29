import { z } from "zod";
import { fromTrustedUser, getTexts } from "../../../../common";
import { Message, CommandArg, discordUser, discordTextChannel } from "../types";

const PREFIX = process.env.COMMAND_PREFIX || "?";

const channels = ["help-solve"];
const USAGE = `Usage: \`${PREFIX}introduce @user #{${channels.join(",")}}\``;
const channelTexts: Map<string, string> = getTexts("introduce", channels);

// introduce
export default async (message: Message, args: CommandArg[]) => {
  // Authorization
  if (!fromTrustedUser(message)) return;

  // Input validation
  const result = z
    .tuple([
      discordUser(message.client),
      discordTextChannel(message.client, (tc) => channels.includes(tc.name)),
    ])
    .safeParse(args);
  if (!result.success) {
    message.reply(USAGE);
    return;
  }
  const [user, channel] = result.data;

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
      `<@${user.id}>, I couldn't DM you. See <https://github.com/codewars/discord-bot/blob/main/text/introduce/${channel.name}.md> instead.`
    );
  }
};
