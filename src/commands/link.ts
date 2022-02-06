import { CommandInteraction, ApplicationCommandPermissionData } from "discord.js";
import { SlashCommandBuilder, hyperlink, hideLinkEmbed, userMention } from "@discordjs/builders";
import { fromEnv } from "../config";

const config = fromEnv();

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
export const data = new SlashCommandBuilder()
  .setName("link")
  .setDescription("Link to a given topic")
  .setDefaultPermission(false)
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

let permissions: ApplicationCommandPermissionData[] = [];
if (config.ROLE_EVERYONE) {
  permissions.push({
    id: config.ROLE_EVERYONE,
    type: "ROLE",
    permission: true,
  });
}
export { permissions };

export const call = async (interaction: CommandInteraction) => {
  const topic = interaction.options.getString("topic", true);
  const target = interaction.options.getUser("target");
  const linkInfo = LINKS[topic];
  let replyMsg = `See ${hyperlink(linkInfo.description, hideLinkEmbed(linkInfo.url))}`;
  if (target) replyMsg = `${userMention(target.id)} ${replyMsg}`;
  await interaction.reply({
    content: replyMsg,
    ephemeral: !target,
  });
};
