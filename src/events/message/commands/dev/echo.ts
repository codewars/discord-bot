import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

// echo
export default {
  spec: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Echoes the input provided back to the user")
    .addStringOption((option) =>
      option.setName("input").setDescription("The input to echo back to the user").setRequired(true)
    ),
  response: async (interaction: CommandInteraction) => {
    const input = interaction.options.getString("input");
    if (!input) throw new Error("The input parameter is required for command echo");
    await interaction.reply(input);
  },
};
