// A subcommand example
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Replies with info")
  .addSubcommand((sub) =>
    sub
      .setName("user")
      .setDescription("Info about a user")
      .addUserOption((o) => o.setName("user").setDescription("The user"))
  )
  .addSubcommand((sub) => sub.setName("server").setDescription("Info about the server"))
  .toJSON();

export const call = async (interaction: CommandInteraction) => {
  switch (interaction.options.getSubcommand()) {
    case "user":
      const user = interaction.options.getUser("target") || interaction.user;
      await interaction.reply(`Username: ${user.username}\nID: ${user.id}`);
      return;

    case "server":
      const { guild } = interaction;
      if (guild) {
        await interaction.reply(`Server name: ${guild.name}\nTotal members: ${guild.memberCount}`);
      }
      return;
  }
};
