import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

const LINKS: { [k: string]: string } = {
  docs: "https://docs.codewars.com/",
  honor: "https://docs.codewars.com/gamification/honor",
  kata: "https://www.codewars.com/kata",
  katas: "https://www.codewars.com/kata",
  authoring: "https://docs.codewars.com/authoring",
  ranking: "https://docs.codewars.com/curation/kata",
  troubleshooting: "https://docs.codewars.com/training/troubleshooting",
  debug: "https://docs.codewars.com/training/troubleshooting",
  github: "https://github.com/codewars/",
  clans: "https://docs.codewars.com/community/following/#clans",
  vim: "https://docs.codewars.com/references/kata-trainer/#editors",
};

// link
export default {
  spec: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Send a relevant link for the selected topic")
    .addStringOption((option) =>
      option
        .setName("topic")
        .setDescription("The topic to post a link for")
        .setRequired(true)
        .addChoice("docs", "docs")
        .addChoice("honor", "honor")
        .addChoice("kata", "kata")
        .addChoice("katas", "katas")
        .addChoice("authoring", "authoring")
        .addChoice("ranking", "ranking")
        .addChoice("troubleshooting", "troubleshooting")
        .addChoice("debug", "debug")
        .addChoice("github", "github")
        .addChoice("clans", "clans")
        .addChoice("vim", "vim")
    ),
  response: async (interaction: CommandInteraction) => {
    const topic = interaction.options.getString("topic");
    if (!topic) throw new Error("The topic parameter is required for command link");
    await interaction.channel?.send(`See <${LINKS[topic]}>`);
    await interaction.reply("Link successfully sent");
  },
};
