import { CommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ZodError } from "zod";
import { getUser, UserNotFoundError } from "../codewars";

const LEAST = "least";
const EACH = "each";
const SPREAD = "spread";
type Mode = typeof LEAST | typeof EACH | typeof SPREAD;

const modes = [
  {
    name: LEAST,
    description: "Complete the fewest possible Kata",
  },
  {
    name: EACH,
    description: "Complete only Kata of the same rank",
  },
  {
    name: SPREAD,
    description: "Complete a balanced range of Kata (default)",
  },
];

const DEFAULTMODE = SPREAD;
const SPREADWEIGHT = 0.6; // used for Spread mode

const limits = ["1kyu", "2kyu", "3kyu", "4kyu", "5kyu", "6kyu", "7kyu", "8kyu"];

// https://docs.codewars.com/gamification/ranks
// 3-8 dan added speculatively, based on trend
const RANKTHRESHOLDS: { [rank: string]: number } = {
  "8kyu": 0,
  "7kyu": 20,
  "6kyu": 76,
  "5kyu": 229,
  "4kyu": 643,
  "3kyu": 1768,
  "2kyu": 4829,
  "1kyu": 13147,
  "1dan": 35759,
  "2dan": 97225,
  "3dan": 264305,
  "4dan": 718477,
  "5dan": 1953045,
  "6dan": 5308948,
  "7dan": 14431239,
  "8dan": 39228196,
};

const RANKPOINTS: { [rank: string]: number } = {
  "8kyu": 2,
  "7kyu": 3,
  "6kyu": 8,
  "5kyu": 21,
  "4kyu": 55,
  "3kyu": 149,
  "2kyu": 404,
  "1kyu": 1097,
};

// Format final output string
function formatResult(
  user: string,
  ranks: [string, string][],
  target: string,
  mode: Mode,
  lang: string | null
) {
  const maxLen = Math.max(...ranks.map((v) => String(v[0]).length));
  const rankStr =
    (mode === EACH ? "   " : "") +
    ranks
      .map(([div, rank]) => (div == "0" ? "" : div.padEnd(maxLen + 1) + rank))
      .filter((v) => v.length > 0)
      .join(mode === EACH ? "\nor " : "\n");
  return `${user} needs to complete:
\`\`\`
${rankStr}
\`\`\`
to ${target}${lang ? ` in ${lang}` : ""}`;
}

function errorMessage(err: unknown): string {
  if (err instanceof UserNotFoundError) {
    return err.message;
  }
  if (err instanceof ZodError) {
    return `Got unexpected response from Codewars API:\n${err.message}`;
  }
  return `Unknown error: ${err}`;
}

export type Options = {
  mode?: string;
  language?: string;
  target?: string;
  limit?: string;
  help?: string;
};

async function getNextRank(
  score: number,
  user: string,
  targ: string | null,
  lang: string | null
): Promise<[string, number] | string> {
  // If target is a rank
  if (targ && /^[1-8](?:kyu|dan)$/.test(targ)) {
    const targScore = RANKTHRESHOLDS[targ];
    if (targScore <= score) return "Target has already been reached";
    return [`reach \`${targ}\``, targScore - score];
  }

  // If target is a user
  if (targ) {
    try {
      const targScore = await getUser(targ, lang);
      if (targScore < score) return `${user} has already reached ${targ}'s rank`;
      return [`overtake ${targ}`, targScore - score + 1];
    } catch (err) {
      return errorMessage(err);
    }
  }

  // Otherwise take next rank above user's current
  let [nextRank, remaining] = Object.entries(RANKTHRESHOLDS)
    .map(([rank, points]): [string, number] => [rank, points - score])
    .filter(([, v]) => v > 0)
    .reduce((a, c) => (a[1] < c[1] ? a : c));
  nextRank = `reach \`${nextRank}\``;
  return [nextRank, remaining];
}

// rankup
export const data = new SlashCommandBuilder()
  .setName("rankup")
  .setDescription("Find out how many Kata to complete to advance to the next rank, and more")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("The Codewars username to query rankup statistics for")
  )
  .addStringOption((option) =>
    option.setName("target").setDescription("The target user or rank to reach")
  )
  .addStringOption((option) =>
    option
      .setName("language")
      .setDescription("The programming language ID to query rankup statistics for")
  )
  .addStringOption((option) =>
    option
      .setName("mode")
      .setDescription("Choose your preferred method to reach your target")
      .addChoices(modes.map((mode) => [mode.description, mode.name]))
  )
  .addStringOption((option) =>
    option
      .setName("limit")
      .setDescription("Don't suggest Kata above this rank")
      .addChoices(limits.map((limit) => [limit, limit]))
  )
  .toJSON();

export const call = async (interaction: CommandInteraction) => {
  let username = interaction.options.getString("username");
  if (!username) {
    const member = interaction.member;
    const displayName = member instanceof GuildMember ? member.displayName : member?.nick;
    if (!displayName) {
      await interaction.reply({
        content: "Failed to fetch the name of the current user",
        ephemeral: true,
      });
      return;
    }
    username = displayName;
  }
  const target = interaction.options.getString("target");
  const language = interaction.options.getString("language");
  const mode = interaction.options.getString("mode") || DEFAULT_MODE;
  const limit = interaction.options.getString("limit") || "1kyu";

  // Get user data
  let score: number;
  try {
    score = await getUser(username, language);
  } catch (err) {
    await interaction.reply({
      content: errorMessage(err),
      ephemeral: true,
    });
    return;
  }
  if (score == 0) {
    await interaction.reply({
      content: `${username} has not started training \`${language}\`, or the language ID is invalid.
See <https://docs.codewars.com/languages/> to find the correct ID.`,
      ephemeral: true,
    });
    return;
  }

  const nextRankScore = await getNextRank(score, username, target, language);
  if (typeof nextRankScore == "string") {
    await interaction.reply({
      content: nextRankScore,
      ephemeral: true,
    });
    return;
  }
  let [nextRank, remaining]: [string, number] = nextRankScore;

  // Get number of each kata required to reach the target
  const rankNums: [string, string][] = Object.entries(RANKPOINTS)
    .filter(([k]) => Number(k[0]) >= Number(String(limit)[0]))
    .sort((a, b) => b[1] - a[1])
    .map(([rank, points]) => {
      if (points > remaining && rank != "8kyu") return ["0", ""];
      let div: number;
      if (rank === "8kyu" || mode === EACH) {
        div = Math.ceil(remaining / points);
      } else {
        div = Math.floor(remaining / points);
        if (mode === SPREAD) div = Math.floor(div * SPREADWEIGHT);
      }
      if (mode !== EACH) remaining -= div * points;
      return [String(div), rank];
    });

  // Format results and send
  await interaction.reply({
    content: formatResult(username, rankNums, nextRank, mode as Mode, language),
    ephemeral: true,
  });
};