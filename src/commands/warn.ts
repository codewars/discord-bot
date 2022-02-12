import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder, userMention, hideLinkEmbed } from "@discordjs/builders";
import { getTexts } from "../common";

const reasons = [
  {
    name: "conduct",
    description: "Poor conduct: harassment, witch hunting, sexism, etc.",
  },
  {
    name: "content",
    description: "Offensive / NSFW content: nudity, sex, violence, etc.",
  },
  {
    name: "spam",
    description:
      "Spam / phishing: unauthorized server invites, advertisements, malicious links etc.",
  },
];

const warnTexts: Map<string, string> = getTexts(
  "warn",
  reasons.map((reason) => reason.name)
);

// warn
export const data = async () =>
  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn the user for violation of server rules")
    .setDefaultPermission(false)
    .addUserOption((option) =>
      option.setName("user").setDescription("The user who violated server rules").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason the specified user violated server rules")
        .setRequired(true)
        .addChoices(reasons.map((reason) => [reason.description, reason.name]))
    )
    .toJSON();

export const authorizedRoles = ["admin", "mods"];

export const call = async (interaction: CommandInteraction) => {
  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);
  const reply = warnTexts.get(reason);
  if (!reply) {
    await interaction.reply({
      content: `Could not get the text for reason "${reason}"

Text is available for the following reasons:

${reasons.map((reason) => `- ${reason.name}`).join("\n")}`,
      ephemeral: true,
    });
    return;
  }
  try {
    const dm = await user.createDM();
    await dm.send(reply);
    await interaction.reply(
      `${userMention(user.id)} You've violated server rules, please check your DMs now`
    );
  } catch (err) {
    await interaction.reply(
      `${userMention(user.id)} You've violated server rules, see ${hideLinkEmbed(
        `https://github.com/codewars/discord-bot/blob/main/text/warn/${reason}.md`
      )} for details.`
    );
  }
};
