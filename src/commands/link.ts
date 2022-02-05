import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

const LINKS: { [k: string]: string } = {
  docs: "https://docs.codewars.com/",
  honor: "https://docs.codewars.com/gamification/honor",
  kata: "https://www.codewars.com/kata",
  katas: "https://www.codewars.com/kata",
  authoring: "https://docs.codewars.com/authoring",
  rank: "https://docs.codewars.com/curation/kata",
  ranking: "https://docs.codewars.com/curation/kata",
  troubleshooting: "https://docs.codewars.com/training/troubleshooting",
  debug: "https://docs.codewars.com/training/troubleshooting",
  github: "https://github.com/codewars/",
  clans: "https://docs.codewars.com/community/following/#clans",
  vim: "https://docs.codewars.com/references/kata-trainer/#editors",
};

// link
export const data = new SlashCommandBuilder()
  .setName("link")
  .setDescription("Link to a given topic")
  .addStringOption((option) =>
    option
      .setName("topic")
      .setDescription("The topic to link to")
      .setRequired(true)
      .addChoices(Object.keys(LINKS).map((k) => [k, k]))
  )
  .toJSON();

export const call = async (interaction: CommandInteraction) => {
  const topic = interaction.options.getString("topic", true);
  await interaction.reply(`See <${LINKS[topic]}>`);
};
