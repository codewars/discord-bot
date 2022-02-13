import { CacheType, Interaction } from "discord.js";
import { oneLine } from "common-tags";

import { commands } from "../commands";

// Listener for (/) commands from humans.
// We may add more listeners like `onButton`.
export const onCommand = async <T extends CacheType>(interaction: Interaction<T>) => {
  if (!interaction.isCommand() || interaction.user.bot) return;

  const { commandName } = interaction;
  if (commands.hasOwnProperty(commandName)) {
    try {
      await commands[commandName].call(interaction);
    } catch (e) {
      console.error(e);
      await interaction.reply({
        content: ERROR_MESSAGE,
        // Only show this message to the user who used the command.
        ephemeral: true,
      });
    }
  }
};

const ERROR_MESSAGE = oneLine`
  Something went wrong!
  If the issue persists, please open an [issue](https://github.com/codewars/discord-bot/issues).
`;

// Listener for handling autocompletion of command options
export const onAutocomplete = async <T extends CacheType>(interaction: Interaction<T>) => {
  if (!interaction.isAutocomplete()) return;
  const { commandName } = interaction;
  if (!commands.hasOwnProperty(commandName)) return;
  const command = commands[commandName];
  if (typeof command.autocomplete !== "function") return;

  try {
    const options = await command.autocomplete(interaction);
    await interaction.respond(options);
  } catch (e) {
    console.error(e);
  }
};
