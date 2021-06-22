import { readFileSync } from "fs";
import * as path from "path";
import { fromModerator, textPath } from "../../../../common";
import { Message, CommandArg } from "../types";

let warnText = "";
const warnPath = path.join(textPath, "warn");
try {
  warnText = readFileSync(path.join(warnPath, "warn.md")).toString();
} catch (err) {
  console.error(`failed to read texts under ${warnPath}: ${err.message || "unknown error"}`);
  process.exit(1);
}

// warn
export default async (message: Message, args: CommandArg[]) => {
  // Authorization
  if (!fromModerator(message)) return;

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
