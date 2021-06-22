import { readFileSync } from "fs";
import * as path from "path";
import { fromModerator, textPath } from "../../../../common";
import { Message, CommandArg } from "../types";

const reasons = ["promote", "spoonfeed", "inappropriate"];
const USAGE = `Usage: \`?warn @user {${reasons.join(",")}}\``;
const warnTexts: Map<string, string> = new Map();
const warnPath = path.join(textPath, "warn");
try {
  for (const reason of reasons)
    warnTexts.set(reason, readFileSync(path.join(warnPath, `${reason}.md`)).toString());
} catch (err) {
  console.error(`failed to read texts under ${warnPath}: ${err.message || "unknown error"}`);
  process.exit(1);
}

// warn
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
  const reasonTerm = args[1];
  if (reasonTerm.type !== "word") {
    message.reply(USAGE);
    return;
  }
  const reason = reasonTerm.word;
  if (!reasons.includes(reason)) {
    message.reply(USAGE);
    return;
  }

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
      `<@${mention.id}>, I couldn't DM you. See <https://github.com/codewars/discord-bot/blob/main/text/warn/${reason}.md> instead.`
    );
  }
};
