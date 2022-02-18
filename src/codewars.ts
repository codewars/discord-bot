import { z } from "zod";
import fetch from "node-fetch";

// Model of the response using zod, for validation

const RankInfo = z.object({
  rank: z.number(),
  name: z.string(),
  color: z.string(),
  score: z.number(),
});

const ProfileResponse = z.object({
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
});

const Language = z.object({
  id: z.string(),
  name: z.string(),
});

type RankInfo = z.infer<typeof RankInfo>;
type ProfileResponse = z.infer<typeof ProfileResponse>;
export type Language = z.infer<typeof Language>;

// Retrieve a users language score, or overall score if language is undefined
// Throws error if a user is not found
export async function getUser(user: string, lang: string | null): Promise<number> {
  const response = await fetch("https://www.codewars.com/api/v1/users/" + user);
  if (response.status === 404) throw new UserNotFoundError(user);

  const result = ProfileResponse.parse(await response.json());
  return (lang ? result.ranks.languages[lang] : result.ranks.overall)?.score ?? 0;
}

export class UserNotFoundError extends Error {
  constructor(user: string) {
    super(`Could not find user: ${user}`);
  }
}

let languages: Language[] | null = null;
/**
 * Get the list of supported languages using Codewars API.
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
