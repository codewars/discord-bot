import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
  RequestError,
  getLeaderboard,
  Language,
  LeaderboardPosition,
  getLeaderboardForUser,
} from "../codewars";
import { table, TableUserConfig } from "table";
import { findLanguage, checkBotPlayground, getUsername } from "../common";
export { languageAutocomplete as autocomplete } from "../common";

const tableConfig = (highlight: number | null): TableUserConfig => {
  let drawHorizontalLine =
    highlight === null
      ? (lineIndex: number, rowCount: number) => lineIndex < 2 || lineIndex === rowCount
      : (lineIndex: number, rowCount: number) =>
          [0, 1, highlight + 1, highlight + 2, rowCount].includes(lineIndex);
  return {
    drawHorizontalLine,
    columns: [
      { alignment: "right" },
      { alignment: "left" },
      { alignment: "right" },
      { alignment: "left" },
    ],
  };
};

// leaderboard
export const data = async () =>
  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show the language score leaderboards")
    .addSubcommand((sub) =>
      sub
        .setName("top")
        .setDescription("Show the language score top 500 leaderboards")
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
    )
    .addSubcommand((sub) =>
      sub
        .setName("user")
        .setDescription("Search for a user on the language score leaderboard")
        .addStringOption((option) =>
          option.setName("username").setDescription("The Codewars username to search for")
        )
        .addStringOption((option) =>
          option
            .setName("language")
            .setDescription("The programming language to show leaderboard for")
            .setAutocomplete(true)
        )
        .addBooleanOption((option) =>
          option.setName("ephemeral").setDescription("Don't show leaderboard to others")
        )
    )
    .toJSON();

function format(lang: Language | null, leaderboard: LeaderboardPosition[], user: string | null) {
  const data = [
    ["#", "username", "score", "rank"],
    ...leaderboard.map((u) => [u.position, u.username, u.score, getRank(u.rank)]),
  ];
  return (
    `:trophy: **${lang?.name ?? "Overall"} leaderboard** :medal:\n` +
    "```\n" +
    table(data, tableConfig(user ? leaderboard.findIndex((u) => user === u.username) : null)) +
    "\n```"
  );
}
function getRank(rank: number) {
  if (rank > 0) return rank + " dan";
  return -rank + " kyu";
}

export const call = async (interaction: CommandInteraction) => {
  const ephemeral = interaction.options.getBoolean("ephemeral") || false;
  checkBotPlayground(ephemeral, interaction);
  const language = await findLanguage(interaction.options.getString("language"));
  let leaderboard: LeaderboardPosition[] = [];
  let user = null;
  switch (interaction.options.getSubcommand()) {
    case "top":
      const startPosition = Math.max(interaction.options.getInteger("startposition") ?? 1, 1);
      const limit = Math.min(Math.max(interaction.options.getInteger("limit") ?? 10, 1), 25);
      leaderboard = await getLeaderboard(language?.id ?? null, startPosition, limit);
      if (leaderboard.length == 0)
        throw new RequestError(`No leaderboard entries found for position ${startPosition}.`);
      break;

    case "user":
      user = getUsername(interaction);
      leaderboard = await getLeaderboardForUser(language?.id ?? null, user);
      if (leaderboard.length == 0) {
        await interaction.reply({
          content: `${user} was not found on the ${
            language?.name ?? "Overall"
          } top 500 leaderboard`,
          ephemeral,
        });
        return;
      }
  }

  await interaction.reply({
    content: format(language, leaderboard, user),
    ephemeral,
  });
};
