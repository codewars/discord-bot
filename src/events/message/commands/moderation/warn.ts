import { z } from "zod";
import { fromModerator, getTexts } from "../../../../common";
import { Message, CommandArg, discordUser, word } from "../types";

const reasons = ["conduct", "content", "spam"];
const USAGE = `Usage: \`?warn @user {${reasons.join(",")}}\``;
const warnTexts: Map<string, string> = getTexts("warn", reasons);

// warn
export default async (message: Message, args: CommandArg[]) => {
  // Authorization
  if (!fromModerator(message)) return;

  // Input validation
  const result = z
    .tuple([discordUser(message.client), word((w) => reasons.includes(w))])
    .safeParse(args);
  if (!result.success) {
    message.reply(USAGE);
    return;
  }

  const [user, reason] = result.data;
  // Action
  try {
    const reply = warnTexts.get(reason);
    if (!reply) {
      console.warn('Could not get the text for reason "' + reason + '"');
      return;
    }
    const dm = await user.createDM();
    await dm.send(reply);
  } catch (err) {
    console.warn(`failed to DM ${user.tag}: ${err.message || "unknown error"}`);
    await message.channel.send(
      `<@${user.id}>, I couldn't DM you. See <https://github.com/codewars/discord-bot/blob/main/text/warn/${reason}.md> instead.`
    );
  }
};
