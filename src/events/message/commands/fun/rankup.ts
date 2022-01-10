import { z } from "zod";
import fetch from "node-fetch";
import { Message, CommandArg, word } from "../types";

const USAGE: string =
  "Usage: `?rankup [<username> --target=(username|rank) --language=(py|js|...) --mode={least|each|spread} --limit=(1-8[kyu])]`";

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
*/

enum Mode {
  Least = "least",
  Each = "each",
  Spread = "spread", // default
}
const DEFAULTMODE: Mode = Mode.Spread;
const SPREADWEIGHT: number = 0.6; // used for Spread mode

const LANGS = new Set<string>([
  "agda",
  "bf",
  "c",
  "cfml",
  "clojure",
  "cobol",
  "coffeescript",
  "commonlisp",
  "coq",
  "cpp",
  "crystal",
  "csharp",
  "d",
  "dart",
  "elixir",
  "elm",
  "erlang",
  "factor",
  "forth",
  "fortran",
  "fsharp",
  "go",
  "groovy",
  "haskell",
  "haxe",
  "idris",
  "java",
  "javascript",
  "julia",
  "kotlin",
  "lean",
  "lua",
  "nasm",
  "nim",
  "objc",
  "ocaml",
  "pascal",
  "perl",
  "php",
  "powershell",
  "prolog",
  "purescript",
  "python",
  "r",
  "racket",
  "raku",
  "reason",
  "ruby",
  "rust",
  "scala",
  "shell",
  "solidarity",
  "sql",
  "swift",
  "typescript",
  "vb",
]);

// https://docs.codewars.com/gamification/ranks
// 3-8 dan added speculatively, based on trend
const RANKTHRESHOLDS: { [rank: string]: number } = {
  "7kyu": 20,
  "6kyu": 76,
  "5kyu": 229,
  "4kyu": 643,
  "3kyu": 1768,
  "2kyu": 4829,
  "1kyu": 13147,
  "1dan": 35759,
  "2dan": 97225,
  "3dan": 264324,
  "4dan": 718593,
  "5dan": 1953551,
  "6dan": 5310860,
  "7dan": 14437910,
  "8dan": 39250354,
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

const capitalise = (s: string): string =>
  s.length ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";

// Retrieve a users language score, or overall score if language is undefined
const getUserLangScore = async (user: string, lang?: string): Promise<number | undefined> => {
  return await fetch("https://www.codewars.com/api/v1/users/" + user)
    .then((response: any): any => (response.status === 404 ? { success: false } : response.json()))
    .then((result: any): any => {
      if (result.success === false) return;
      return (lang ? result.ranks.languages[lang] : result.ranks.overall)?.score ?? 0;
    });
};

export default async (message: Message, args: CommandArg[], opts: Record<string, string>) => {
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
  // Get mode
  const mode: Mode = (<any>Mode)[capitalise(String(opts.mode).toLowerCase())] ?? DEFAULTMODE;

  // Check that language exists
  if (opts.language && !LANGS.has(opts.language))
    return send(
      `\`${opts.language}\` is not a valid language ID.
You can find the correct language ID here: <https://docs.codewars.com/languages/>`
    );

  // Get user data
  const score: number | undefined = await getUserLangScore(username, opts.language);
  if (score == undefined)
    return send(`${username} is doomed to stay at :9kyu: forever. (user not found)`);

  // Get target score and rank/user string
  let nextRank: string;
  let remaining: number;

  // If target is a rank
  if (/[1-8](?:kyu|dan)/.test(opts.target)) {
    [nextRank, remaining] = ["reach `" + opts.target + "`", RANKTHRESHOLDS[opts.target]];
    if (remaining <= score) return send("Target has already been reached");
  }

  // If target is a user
  else if (opts.target) {
    const targScore: number | undefined = await getUserLangScore(opts.target, opts.language);
    if (targScore === undefined) return send("Target user could not be found");
    if (targScore < score) return send(`${username} has already reached ${opts.target}'s rank'`);
    [nextRank, remaining] = ["overtake " + opts.target, targScore - score + 1];
  }

  // Otherwise take next rank above user's current
  else {
    [nextRank, remaining] = Object.entries(RANKTHRESHOLDS)
      .map(([rank, points]): [string, number] => [rank, points - score])
      .filter(([, v]) => v > 0)
      .reduce((a, c) => (a[1] < c[1] ? a : c));
    nextRank = "reach `" + nextRank + "`";
  }

  // Get number of each kata required to reach the target
  const rankNums: [number, string][] = Object.entries(RANKPOINTS)
    .filter(([k]) => Number(k[0]) >= Number(String(opts.limit ?? 1)[0]))
    .sort((a, b) => b[1] - a[1])
    .map(([rank, points]) => {
      if (points > remaining && rank != "8kyu") return [0, ""];
      let div: number;
      if (rank === "8kyu" || mode === Mode.Each) {
        div = Math.ceil(remaining / points);
      } else {
        div = Math.floor(remaining / points);
        if (mode === Mode.Spread) div = Math.floor(div * SPREADWEIGHT);
      }
      if (mode !== Mode.Each) remaining -= div * points;
      return [div, rank];
    });

  // Format results and send
  const maxLen: number = Math.max(...rankNums.map((v) => String(v[0]).length));
  const rankStr: string = rankNums
    .map(([div, rank], i) => {
      if (!div) return "";
      const pad: string = " ".repeat(maxLen - String(div).length + 1);
      return mode === Mode.Each
        ? "\n" + (i ? "or " : "   ") + div + pad + rank
        : "\n" + div + pad + rank;
    })
    .join("");
  return send(`${username} needs to complete:
\`\`\`
${rankStr}
\`\`\`
to ${nextRank}${opts.language ? " in " + opts.language : ""}`);
};
