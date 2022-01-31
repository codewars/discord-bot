import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

// ping
export default {
  spec: new SlashCommandBuilder().setName("ping").setDescription("Pings the bot for a response"),
  response: async (interaction: CommandInteraction) => {
    await interaction.reply("pong");
  },
};
