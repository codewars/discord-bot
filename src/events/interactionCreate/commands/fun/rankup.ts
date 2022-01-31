import { CommandInteraction, TextChannel, GuildMember } from "discord.js";
import { ZodError } from "zod";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getUser, UserNotFoundError } from "../../../../codewars";

const REDIRECT: string = "This command is only available in channel **#bot-playground**";

const LEAST = "least";
const EACH = "each";
const SPREAD = "spread";
type Mode = typeof LEAST | typeof EACH | typeof SPREAD;
const DEFAULT_MODE = SPREAD;

function isMode(value: unknown): value is Mode {
  return typeof value == "string" && (value == LEAST || value == EACH || value == SPREAD);
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

async function getNextRank(
  score: number,
  user: string,
  targ?: string,
  lang?: string
): Promise<[string, number] | string> {
  // If target is a rank
  if (targ && /^[1-8](?:kyu|dan)$/.test(targ)) {
    const targScore = RANK_THRESHOLDS[targ];
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
  let [nextRank, remaining] = Object.entries(RANK_THRESHOLDS)
    .map(([rank, points]): [string, number] => [rank, points - score])
    .filter(([, v]) => v > 0)
    .reduce((a, c) => (a[1] < c[1] ? a : c));
  nextRank = `reach \`${nextRank}\``;
  return [nextRank, remaining];
}

const RANK_THRESHOLDS: { [rank: string]: number } = {
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

const RANK_POINTS: { [rank: string]: number } = {
  "8kyu": 2,
  "7kyu": 3,
  "6kyu": 8,
  "5kyu": 21,
  "4kyu": 55,
  "3kyu": 149,
  "2kyu": 404,
  "1kyu": 1097,
};

const SPREAD_WEIGHT = 0.6; // used for Spread mode

// Format final output string
function formatResult(
  user: string,
  ranks: [string, string][],
  target: string,
  mode: Mode,
  lang?: string
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

// rankup
export default {
  spec: new SlashCommandBuilder()
    .setName("rankup")
    .setDescription("Query rank up information through the Codewars API")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("The username to check. Defaults to users discord server nickname")
    )
    .addStringOption((option) =>
      option
        .setName("target")
        .setDescription(
          "The rank to reach, or a username of a user to overtake. Defaults to users next rank"
        )
    )
    .addStringOption((option) =>
      option.setName("language").setDescription('The language to inspect. Defaults to "overall"')
    )
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Calculation mode: least / each / spread. Defaults to spread")
        .addChoice("least", "least")
        .addChoice("each", "each")
        .addChoice("spread", "spread")
    )
    .addStringOption((option) =>
      option
        .setName("limit")
        .setDescription("The max rank to use in calculations ([1-8]kyu)")
        .addChoice("1kyu", "1kyu")
        .addChoice("2kyu", "2kyu")
        .addChoice("3kyu", "3kyu")
        .addChoice("4kyu", "4kyu")
        .addChoice("5kyu", "5kyu")
        .addChoice("6kyu", "6kyu")
        .addChoice("7kyu", "7kyu")
        .addChoice("8kyu", "8kyu")
    ),
  response: async (interaction: CommandInteraction) => {
    let username = interaction.options.getString("username");
    let target = interaction.options.getString("target");
    let language = interaction.options.getString("language");
    let mode = interaction.options.getString("mode");
    let limit = interaction.options.getString("limit");

    // If current channel is not #bot-playground, redirect them to that channel
    if ((interaction.channel as TextChannel).name !== "bot-playground") {
      await interaction.reply(REDIRECT);
      return;
    }

    if (!username) {
      const member = interaction.member;
      username = member instanceof GuildMember ? member.displayName : null;
      if (!username) {
        const ERROR = "Could not get Discord username";
        console.warn(ERROR);
        await interaction.reply(ERROR);
        return;
      }
    }

    // Get mode
    if (!isMode(mode)) mode = DEFAULT_MODE;

    // Validate limit
    if (limit && !/^[1-8]kyu$/.test(limit)) {
      const ERROR = "Invalid limit";
      console.warn(ERROR);
      await interaction.reply(ERROR);
      return;
    }

    // Get user data
    let score: number;
    try {
      score = await getUser(username, language || undefined);
    } catch (err) {
      await interaction.reply(errorMessage(err));
      return;
    }
    if (score == 0) {
      await interaction.reply(`${username} has not started training \`${language}\`, or the language ID is invalid.
See <https://docs.codewars.com/languages/> to find the correct ID.`);
      return;
    }

    const nextRankScore = await getNextRank(
      score,
      username,
      target || undefined,
      language || undefined
    );
    if (typeof nextRankScore == "string") {
      await interaction.reply(nextRankScore);
      return;
    }
    let [nextRank, remaining]: [string, number] = nextRankScore;

    // Get number of each kata required to reach the target
    const rankNums: [string, string][] = Object.entries(RANK_POINTS)
      .filter(([k]) => Number(k[0]) >= Number(String(limit ?? 1)[0]))
      .sort((a, b) => b[1] - a[1])
      .map(([rank, points]) => {
        if (points > remaining && rank != "8kyu") return ["0", ""];
        let div: number;
        if (rank === "8kyu" || mode === EACH) {
          div = Math.ceil(remaining / points);
        } else {
          div = Math.floor(remaining / points);
          if (mode === SPREAD) div = Math.floor(div * SPREAD_WEIGHT);
        }
        if (mode !== EACH) remaining -= div * points;
        return [String(div), rank];
      });

    // Format results and reply
    await interaction.reply(
      formatResult(username, rankNums, nextRank, mode as Mode, language || undefined)
    );
  },
};
