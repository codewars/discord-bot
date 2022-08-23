import { z } from "zod";
import fetch from "node-fetch";

// Model of the response using zod, for validation

const RankInfo = z.object({
  rank: z.number(),
  name: z.string(),
  color: z.string(),
  score: z.number(),
});

const UserInfo = z.object({
  username: z.string(),
  name: z.nullable(z.string()),
  honor: z.number(),
  clan: z.nullable(z.string()),
  leaderboardPosition: z.nullable(z.number()),
  skills: z.nullable(z.array(z.string())),
  ranks: z.object({
    overall: RankInfo,
    languages: z.record(RankInfo),
  }),
  codeChallenges: z.object({
    totalAuthored: z.number(),
    totalCompleted: z.number(),
  }),
});

const Language = z.object({
  id: z.string(),
  name: z.string(),
});

const LeaderboardPosition = z.object({
  position: z.number(),
  username: z.string(),
  score: z.number(),
  rank: z.number(),
});

type RankInfo = z.infer<typeof RankInfo>;
export type UserInfo = z.infer<typeof UserInfo>;
export type Language = z.infer<typeof Language>;
export type LeaderboardPosition = z.infer<typeof LeaderboardPosition>;

/** Error class indicating an invalid request. */
export class RequestError extends Error {}
export class UserNotFoundError extends RequestError {
  constructor(user: string) {
    super(`Could not find user: ${user}`);
  }
}

/**
 * Get user info.
 *
 * @param user - Username or id
 * @returns User info
 */
export async function getUser(user: string): Promise<UserInfo> {
  const response = await fetch("https://www.codewars.com/api/v1/users/" + user);
  if (response.status === 404) throw new UserNotFoundError(user);
  return UserInfo.parse(await response.json());
}

/**
 * Get user's language or overall score.
 *
 * @param user - Username or id
 * @param lang - Optional language to get the score.
 *               Overall score is returned if unspecified.
 * @returns Language or overall score
 */
export async function getScore(user: string, lang: string | null): Promise<number> {
  const info = await getUser(user);
  return (lang ? info.ranks.languages[lang] : info.ranks.overall)?.score ?? 0;
}

let languages: Language[] | null = null;
/**
 * Get the list of supported languages.
 * The result is stored, so this only requests once.
 * The bot restarts at least once a day, so this should be fine for now.
 * @returns Supported languages
 */
export const getLanguages: () => Promise<Language[]> = async () => {
  if (!languages) {
    const response = await fetch("https://www.codewars.com/api/v1/languages");
    languages = z.object({ data: z.array(Language) }).parse(await response.json()).data;
  }
  return languages;
};

const USERS_PER_PAGE = 50;

/**
 * Get a leaderboard for rank score.
 *
 * @param lang - Optional language to get the leaderboard.
 *               Overall leaderboard is returned if unspecified.
 * @param startPosition - The first shown user position of the result.
                          Will at least 1 be taken as 1.
 * @param limit - Number of positions to fetch
 * @returns Language or overall leaderboard
 */
export async function getLeaderboard(
  lang: string | null,
  startPosition: number,
  limit: number
): Promise<LeaderboardPosition[]> {
  lang = lang ?? "overall";
  startPosition = Math.max(startPosition, 1);
  let startPage = Math.ceil(startPosition / USERS_PER_PAGE);
  let endPage = Math.ceil((startPosition + limit - 1) / USERS_PER_PAGE);
  let result: LeaderboardPosition[] = [];
  for (let p = startPage; p <= endPage; ++p) {
    const url = "https://www.codewars.com/api/v1/leaders/ranks/" + lang + "?page=" + p;
    const response = await fetch(url);
    let data = z.object({ data: z.array(LeaderboardPosition) }).parse(await response.json()).data;
    if (data.length == 0) break;
    result.push(...data);
  }
  let start = (startPosition - 1) % USERS_PER_PAGE;
  return result.slice(start, start + limit);
}
/**
 * Get a leaderboard for rank score searching for a given user.
 *
 * @param lang - Optional language to get the leaderboard.
 *               Overall leaderboard is returned if unspecified.
 * @param user - The name of the Codewars user to search for.
 * @returns Language or overall leaderboard
 */
export async function getLeaderboardForUser(
  lang: string | null,
  user: string
): Promise<LeaderboardPosition[]> {
  lang = lang ?? "overall";
  const url = "https://www.codewars.com/api/v1/leaders/ranks/" + lang + "?user=" + user;
  const response = await fetch(url);
  if (response.status === 404) throw new UserNotFoundError(user);
  return z.object({ data: z.array(LeaderboardPosition) }).parse(await response.json()).data;
}

