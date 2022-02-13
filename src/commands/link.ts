import { CommandInteraction, User } from "discord.js";
import {
  SlashCommandBuilder,
  hyperlink,
  hideLinkEmbed,
  userMention,
  italic,
  inlineCode,
} from "@discordjs/builders";

const LINKS: { [k: string]: { description: string; url: string } } = {
  docs: {
    description: "The Codewars Docs",
    url: "https://docs.codewars.com/",
  },
  honor: {
    description: "Honor | The Codewars Docs",
    url: "https://docs.codewars.com/gamification/honor",
  },
  kata: {
    description: "Kata | Codewars",
    url: "https://www.codewars.com/kata",
  },
  authoring: {
    description: "Authoring Content | The Codewars Docs",
    url: "https://docs.codewars.com/authoring",
  },
  rank: {
    description: "Reviewing a Kata",
    url: "https://docs.codewars.com/curation/kata",
  },
  troubleshooting: {
    description: "Troubleshooting Your Solution | The Codewars Docs",
    url: "https://docs.codewars.com/training/troubleshooting",
  },
  github: {
    description: "Codewars on GitHub",
    url: "https://github.com/codewars/",
  },
  clans: {
    description: "Clans | The Codewars Docs",
    url: "https://docs.codewars.com/community/following/#clans",
  },
  vim: {
    description: "Editors | The Codewars Docs",
    url: "https://docs.codewars.com/references/kata-trainer/#editors",
  },
};

// link
export const data = async () =>
  new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link to a given topic")
    .addStringOption((option) =>
      option
        .setName("topic")
        .setDescription("The topic to link to")
        .setRequired(true)
        .addChoices(Object.keys(LINKS).map((k) => [LINKS[k].description, k]))
    )
    .addUserOption((option) =>
      option.setName("target").setDescription("Direct the specified user to the given link")
    )
    .toJSON();

export const call = async (interaction: CommandInteraction) => {
  const topic = interaction.options.getString("topic", true);
  const target = interaction.options.getUser("target");
  const linkInfo = LINKS[topic];
  const message = `See ${hyperlink(linkInfo.description, hideLinkEmbed(linkInfo.url))}`;
  await interaction.reply({
    content: maybeMention(message, target),
    ephemeral: !target,
  });
};

const maybeMention = (msg: string, target: User | null) =>
  target ? `${userMention(target.id)} ${msg}` : `${msg}\n\n${italic(NOTE)}`;

const NOTE = `Note: to use this command in response to a user's query, specify the ${inlineCode(
  "target"
)} option when invoking the command.`;
