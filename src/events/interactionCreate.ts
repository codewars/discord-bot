import { CacheType, CommandInteraction, Interaction } from "discord.js";
import { oneLine } from "common-tags";

import { commands } from "../commands";
import { RequestError } from "../codewars";

// Listener for (/) commands from humans.
// We may add more listeners like `onButton`.
export const onCommand = async <T extends CacheType>(interaction: Interaction<T>) => {
  if (!interaction.isCommand() || interaction.user.bot) return;

  const { commandName } = interaction;
  if (commands.hasOwnProperty(commandName)) {
    try {
      await commands[commandName].call(interaction);
    } catch (e) {
      await handleError(e, interaction);
    }
  }
};

async function handleError(err: any, interaction: CommandInteraction) {
  let msg = ERROR_MESSAGE;
  if (err instanceof RequestError) msg = err.message;
  else console.error(err);
  await interaction.reply({
    content: msg,
    // Only show this message to the user who used the command.
    ephemeral: true,
  });
}

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
