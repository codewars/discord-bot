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

type RankInfo = z.infer<typeof RankInfo>;
export type UserInfo = z.infer<typeof UserInfo>;
export type Language = z.infer<typeof Language>;

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

export class UserNotFoundError extends Error {
  constructor(user: string) {
    super(`Could not find user: ${user}`);
  }
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
