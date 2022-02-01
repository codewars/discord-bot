import { Interaction } from "discord.js";
import commands from "./commands";

// `client` can be accessed from `interaction.client`.
export const onInteractionCreate = async (interaction: Interaction) => {
  // Only react to slash commands
  if (!interaction.isCommand()) return;

  // Do not respond to bots
  if (interaction.user.bot) return;

  // Process each command, in order
  const name = interaction.commandName;
  if (name && commands.hasOwnProperty(name)) {
    try {
      await commands[name].response(interaction);
    } catch (e) {
      console.error(e.message);
    }
  }
};
