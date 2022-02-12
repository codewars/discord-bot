import { CommandInteraction } from "discord.js";
import {
  SlashCommandBuilder,
  blockQuote,
  bold,
  codeBlock,
  inlineCode,
  italic,
  quote,
  spoiler,
  strikethrough,
  underscore,
} from "@discordjs/builders";

const formats: { [k: string]: (s: string) => string } = {
  blockQuote,
  bold,
  codeBlock,
  inlineCode,
  italic,
  quote,
  spoiler,
  strikethrough,
  underscore,
};

export const data = async () =>
  new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Replies with your input, optionally formatted")
    .addStringOption((option) =>
      option.setName("input").setDescription("The input to echo back").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("format")
        .setDescription("The format to use")
        .addChoices(Object.keys(formats).map((k) => [k, k]))
    )
    .toJSON();

export const call = async (interaction: CommandInteraction) => {
  const input = interaction.options.getString("input", true);
  const format = interaction.options.getString("format");
  const msg = format && formats.hasOwnProperty(format) ? formats[format](input) : input;
  await interaction.reply(msg);
};

/*
// It's annoying having to repeat options name/type in `data` and `call`.
// Maybe it's possible to define `options` in `data` with `zod`?
// Registering should work as long as we can produce an object matching
// `RESTPostAPIApplicationCommandsJSONBody`.
const data = new SlashCommandBuilder()
  .setName("echo")
  .setDescription("Replies with your input")
  .addStringOption((option) =>
    option.setName("input").setDescription("The input to echo back").setRequired(true)
  )
  .toJSON();
// is equivalent to
const data = {
  name: "echo",
  description: "Replies with your input",
  options: [
    {
      // ApplicationCommandOptionType.String
      type: 3,
      name: "input",
      description: "The input to echo back",
      required: true,
    },
  ],
};
// will be nice to use zod to define options, so we can extract in `call`.
const Options = z.preprocess(
  // preprocess `interaction.options.data` array into an object
  preprocessor,
  // schema
  z.object({
    input: z.string().nonempty().describe("The input to echo back"),
  })
);
const data = {
  name: "echo",
  description: "Replies with your input",
  options: toDiscordOptions(Options),
};
// so we can get typed options
// const { input } = Options.parse(interaction.options.data);
*/
