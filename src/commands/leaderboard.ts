import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { RequestError, getLeaderboard, Language, LeaderboardPosition } from "../codewars";
import { table, TableUserConfig } from "table";
import { findLanguage, checkBotPlayground } from "../common";
export { languageAutocomplete as autocomplete } from "../common";

const tableConfig: TableUserConfig = {
  drawHorizontalLine: (lineIndex: number, rowCount: number) =>
    lineIndex < 2 || lineIndex === rowCount,
  columns: [
    { alignment: "right" },
    { alignment: "left" },
    { alignment: "right" },
    { alignment: "left" },
  ],
};

// leaderboard
export const data = async () =>
  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show the language score leaderboards")
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription("The programming language to show leaderboard for")
        .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("startposition")
        .setDescription("The top shown position (default 1)")
        // limits seem not to be checked by Discord API, maybe support in the future
        .setMinValue(1)
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("The number of shown users (default 10, range 1 - 25)")
        .setMinValue(1)
        // cut off at 25 because of Discord message length limit, 31 would fit
        .setMaxValue(25)
    )
    .addBooleanOption((option) =>
      option.setName("ephemeral").setDescription("Don't show leaderboard to others")
    )
    .toJSON();

function format(lang: Language | null, leaderboard: LeaderboardPosition[]) {
  const data = [
    ["#", "username", "score", "rank"],
    ...leaderboard.map((u) => [u.position, u.username, u.score, getRank(u.rank)]),
  ];
  return (
    `:trophy: **${lang?.name ?? "Overall"} leaderboard** :medal:\n` +
    "```\n" +
    table(data, tableConfig) +
    "\n```"
  );
}
function getRank(rank: number) {
  if (rank > 0) return rank + " dan";
  return -rank + " kyu";
}

export const call = async (interaction: CommandInteraction) => {
  const language = await findLanguage(interaction.options.getString("language"));
  const startPosition = Math.max(interaction.options.getInteger("startposition") ?? 1, 1);
  const limit = Math.min(Math.max(interaction.options.getInteger("limit") ?? 10, 1), 25);
  const ephemeral = interaction.options.getBoolean("ephemeral") || false;
  checkBotPlayground(ephemeral, interaction);

  const leaderboard = await getLeaderboard(language?.id ?? null, startPosition, limit);
  if (leaderboard.length == 0)
    throw new RequestError(`No leaderboard entries found for position ${startPosition}.`);

  await interaction.reply({
    content: format(language, leaderboard),
    ephemeral,
  });
};
