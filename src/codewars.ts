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

type RankInfo = z.infer<typeof RankInfo>;
type ProfileResponse = z.infer<typeof ProfileResponse>;

// Retrieve a users language score, or overall score if language is undefined
// Throws error if a user is not found
export async function getUser(user: string, lang?: string): Promise<number> {
  return await fetch("https://www.codewars.com/api/v1/users/" + user)
    .then((response: any): any => (response.status === 404 ? { success: false } : response.json()))
    .then((result: any): any => {
      ProfileResponse.parse(result);
      return (lang ? result.ranks.languages[lang] : result.ranks.overall)?.score ?? 0;
    });
}
