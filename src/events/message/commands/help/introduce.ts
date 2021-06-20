import { Message, CommandArg } from "../types";
import { Role, TextChannel } from "discord.js";

const isModerator = (role: Role) => role.name === "admin" || role.name === "mods";

// introduce
export default async (message: Message, args: CommandArg[]) => {
  // Authorization
  const author = message.guild?.members.cache.get(message.author.id);
  if (!author) return;
  const isPrivileged = author.roles.cache.some(isModerator);
  if (!isPrivileged) return;

  // Input validation
  if (args.length < 1 || args.length > 2) return;
  const mention = args[0];
  if (typeof mention !== "object") return;
  if (mention.type !== "user") return;
  const user = message.client.users.cache.get(mention.id);
  if (!user) return;
  let channelMention, channel;
  if (args.length > 1) {
    channelMention = args[1];
    if (typeof channelMention !== "object") return;
    if (channelMention.type !== "channel") return;
    channel = message.client.channels.cache.get(channelMention.id);
    if (!(channel instanceof TextChannel)) return;
  }

  // Action
  const reply = !channel
    ? INTRO
    : channel.name === "help-solve"
    ? HELP_SOLVE
    : channel.name === "anything"
    ? ANYTHING
    : INTRO;
  try {
    const dm = await user.createDM();
    await dm.send(reply);
  } catch (err) {
    console.warn(`failed to DM ${user.tag}: ${err.message || "unknown error"}`);
    await message.channel.send(`<@${mention.id}> ${reply}`);
  }
};

const INTRO = `Welcome to the Codewars Discord server!

Codewars is where developers achieve mastery through challenge and improve their skills by training with others on real code challenges. Go check it out if you haven't done so already: https://www.codewars.com/

Some channels to help you get started:

- #beginners is for newcomers to programming
- #codewars is for general Codewars discussion. This is also a great place to introduce yourself as a Codewars user
- #anything is for pretty much anything, whether related to Codewars or not. Kitty pictures are also welcome :-)
- If you need help on solving a Codewars Kata, go to #help-solve
- There are also a number of language subs for discussing stuff related to a particular programming language, related to Codewars or otherwise. If you do JavaScript, check out #javascript

Finally, if you would like to contribute to making me better, feel free to leave comments and feedback at #discord-bot`;

const HELP_SOLVE = `Welcome to #help-solve! For an optimal experience, please include the following information **in #help-solve** (not to me!):

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

const ANYTHING = `Welcome to #anything! You can discuss pretty much anything that is appropriate for all ages on this channel, whether related to programming or not. However, we ask you to respect a few rules:

- Please adhere to the Codewars Terms of Service (ToS) at all times: <https://www.codewars.com/about/terms-of-service>
- Please adhere to the Discord Terms of Service (ToS) at all times: <https://discord.com/terms>
- This is _not_ a place for you to advertise your own products and/or services. You may receive a warning in mild cases, and a kick from the server in severe cases. Repeat offenders will be **permanently banned**
- Nor is this a place to receive free help for completing your programming homework, project, assignment, etc. Similar measures apply as for advertising`;
