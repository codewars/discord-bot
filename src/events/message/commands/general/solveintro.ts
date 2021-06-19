import { User, GuildMember } from "discord.js";
import { Message, CommandArg } from "../types";

// solveintro
export default async (message: Message, args: CommandArg[]) => {
  // Authorization
  let author = message.guild?.members.cache.get(message.author.id);
  if (!(author instanceof GuildMember))
    return;
  let isPrivileged = author.roles
    .cache
    .some(role => role.name === 'admin' || role.name === 'mods');
  if (!isPrivileged)
    return;

  // Input validation
  if (args.length !== 1)
    return;
  let mention = args[0];
  if (typeof mention !== 'object')
    return;
  if (mention.type !== 'user')
    return;
  if (typeof mention.id !== 'string')
    return;
  let user = message.client.users.cache.get(mention.id);
  if (!(user instanceof User))
    return;

  // Action
  try {
    const dm = await user.createDM();
    await dm.send(SOLVE_INTRO);
    await message.channel.send(`<@${mention.id}> I sent you a DM, please check your inbox ;-)`);
  } catch (err) {
    console.warn(`failed to DM ${user.tag}: ${err.message || "unknown error"}`);
    await message.channel.send(`<@${mention.id}> ${SOLVE_INTRO}`);
  }
};

const SOLVE_INTRO = `Welcome! For an optimal experience, please include the following information **in #help-solve** (not to me!):

1. A link to the Kata you are attempting, e.g. <https://www.codewars.com/kata/50654ddff44f800200000004>
2. The language you are attempting the Kata in, e.g. JavaScript
3. What you have tried before asking for help. We'd love to put in the effort to help you, but only if you first help yourself.
4. Your current solution in properly formatted code blocks. For example:

\\\`\\\`\\\`javascript
console.log("Hello World!");
\\\`\\\`\\\`

gives

\`\`\`javascript
console.log("Hello World!");
\`\`\`
5. The input, output from your solution and expected output`;
