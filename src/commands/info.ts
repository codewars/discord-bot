// A subcommand example
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = async () =>
  new SlashCommandBuilder()
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

export const call = async (interaction: ChatInputCommandInteraction) => {
  switch (interaction.options.getSubcommand()) {
    case "user":
      const user = interaction.options.getUser("user") || interaction.user;
      await interaction.reply(`Username: ${user.username}\nID: ${user.id}`);
      return;

    case "server":
      const guild = await interaction.guild?.fetch();
      if (guild) {
        await interaction.reply(
          `Server name: ${guild.name}\nTotal members: ${guild.approximateMemberCount}`
        );
      }
      return;
  }
};
