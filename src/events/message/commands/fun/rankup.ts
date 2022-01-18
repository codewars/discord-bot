import { z, ZodError } from "zod";
import { Message, CommandArg, word } from "../types";
import { getUser, UserNotFoundError } from "../../../../codewars";

const USAGE: string =
  "Usage: `?rankup [<username> --target={username|rank} --language={languageID} --mode={least|each|spread} --limit={1-8[kyu]}]`";

/*
`?rankup` calculates the number of katas of each rank required for a user to rank up.
This command is just for fun, however should increase competition between users,
and (hopefully) increase motivation.

If no username is passed, server nickname of user is taken instead.

Options:
  <username>   The username to check. Defaults to users discord server nickname
  --target=    The rank to reach, or a username of a user to overtake. Defaults to users next rank
  --language=  The language to inspect. Defaults to "overall"
  --mode=      Calculation mode.
                  Least favours 1kyus for least overall katas.
                  Each finds number of katas per rank individually
                  Spread (default) prioritises high katas, but also distributes points to lower ones
  --limit=     The max rank to use in calculations ([1-8]kyu)
  --help       Display USAGE
*/

const LEAST = "least";
const EACH = "each";
const SPREAD = "spread";
type Mode = typeof LEAST | typeof EACH | typeof SPREAD;

function isMode(value: unknown): value is Mode {
  return typeof value == "string" && (value == LEAST || value == EACH || value == SPREAD);
}

const DEFAULTMODE = SPREAD;
const SPREADWEIGHT = 0.6; // used for Spread mode

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
to ${target}${lang ? ` in {lang}` : ""}`;
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
  targ?: string,
  lang?: string
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

export default async function (message: Message, args: CommandArg[], opts: Options) {
  // Helper function
  const send = (msg: string) => {
    message.channel.send(msg);
  };
  let username: string;
  if (args.length == 0) {
    if (!message.member?.displayName) return;
    username = message.member.displayName;
  } else {
    // Input validation
    const result = z.tuple([word()]).safeParse(args);
    if (!result.success) {
      message.reply(USAGE);
      return;
    }
    [username] = result.data;
  }

  // If help option set, simply reply with usage info
  if (opts.help !== undefined) return send(USAGE);

  // Get mode
  const mode = isMode(opts.mode) ? opts.mode : DEFAULTMODE;

  // Validate limit
  if (opts.limit && !/^[1-8]$/.test(opts.limit)) return send("Invalid limit");

  // Get user data
  let score: number;
  try {
    score = await getUser(username, opts.language);
  } catch (err) {
    return send(errorMessage(err));
  }
  if (score == 0)
    return send(`${username} has not started training \`${opts.language}\`, or the language ID is invalid.
See <https://docs.codewars.com/languages/> to find the correct ID.`);

  const nextRankScore = await getNextRank(score, username, opts.target, opts.language);
  if (typeof nextRankScore == "string") return send(nextRankScore);
  let [nextRank, remaining]: [string, number] = nextRankScore;

  // Get number of each kata required to reach the target
  const rankNums: [string, string][] = Object.entries(RANKPOINTS)
    .filter(([k]) => Number(k[0]) >= Number(String(opts.limit ?? 1)[0]))
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
  return send(formatResult(username, rankNums, nextRank, mode, opts.language));
}
