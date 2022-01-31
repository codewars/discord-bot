import { Interaction } from "discord.js";
import commands from "./commands";

const HELP: string = `The following commands are available:

${Object.keys(commands)
  .map((name) => `- \`/${name}\``)
  .join("\n")}

Note that some commands are only available to privileged users.`;

// `client` can be accessed from `interaction.client`.
export const onInteractionCreate = async (interaction: Interaction) => {
  // Only react to slash commands
  if (!interaction.isCommand()) return;

  // Do not respond to bots
  if (interaction.user.bot) return;

  // Process each command, in order
  const name = interaction.commandName;
  // help is a special command
  if (name === "help") {
    await interaction.reply(HELP);
    return;
  }
  if (name && commands.hasOwnProperty(name)) {
    try {
      await commands[name].response(interaction);
    } catch (e) {
      console.error(e.message);
    }
  }
};
