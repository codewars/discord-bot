import { Message } from "discord.js";
import { stripIndents, oneLine } from "common-tags";

/// Detect direct links to trainer and show adjusted links.
export default async (message: Message) => {
  const trainerLinks = message.content.match(PATTERN);
  if (!trainerLinks) return false;

  const links = trainerLinks.map((s) => "- <" + s.replace(/\/train\/[a-z]+$/, "") + ">").join("\n");
  const Q = "❓";
  const newMessage = await message.channel.send(stripIndents`
    Fixed direct link(s) to trainer:
    ${links}
    React with ${Q} within ${REACTION_SECS}s to get a DM with explanation.
  `);
  // React to the new message so users can just click it.
  const reaction = await newMessage.react(Q);
  newMessage
    .createReactionCollector({
      filter: (reaction, _user) => reaction.emoji.name === Q,
      time: REACTION_SECS * 1000,
    })
    .on("collect", async (_reaction, user) => {
      if (user.bot) return;

      try {
        const dm = await user.createDM();
        await dm.send(INFO);
      } catch (err) {
        // Can error if the user have DM disabled.
        console.warn(`failed to DM ${user.tag}: ${err.message || "unknown error"}`);
      }
    })
    .once("end", async () => {
      // Requires `MANAGE_MESSAGE` permission.
      try {
        await newMessage.edit(newMessage.content.replace(/React with .+$/, "").trimRight());
        await reaction.remove();
      } catch (e) {
        console.log(`failed to remove reaction: ${e.message || "unknown error"}`);
      }
    });

  return true;
};

const PATTERN = /https?:\/\/(?:www\.)?codewars.com\/kata\/[0-9a-f]{24}\/train\/[a-z]+/g;

const INFO = oneLine`
  When you post a link to a kata, make sure the link doesn't end with \`/train/{language-id}\`.
  Those are links to trainers and will start a training session when followed. This can be annoying
  for other users because they can end up with an unwanted kata in their "unfinished" list.
`;

const REACTION_SECS = 15;
