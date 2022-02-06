// A subcommand example
import { CommandInteraction, ApplicationCommandPermissionData } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { fromEnv } from "../config";

const config = fromEnv();

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Replies with info")
  .setDefaultPermission(false)
  .addSubcommand((sub) =>
    sub
      .setName("user")
      .setDescription("Info about a user")
      .addUserOption((o) => o.setName("user").setDescription("The user"))
  )
  .addSubcommand((sub) => sub.setName("server").setDescription("Info about the server"))
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
  switch (interaction.options.getSubcommand()) {
    case "user":
      const user = interaction.options.getUser("user") || interaction.user;
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
