import { resolve } from "path";

import dotenv from "dotenv";
import { z } from "zod";
import { parseEnv } from "znv";

// Load config from environment variables.
// Exits if required configs are missing or invalid.
export const fromEnv = () => {
  // Use `.env.development` by default.
  dotenv.config({
    path: resolve(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`),
  });
  try {
    return parseEnv(process.env, {
      BOT_TOKEN: {
        description:
          "Your bot token. See https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token",
        schema: z.string().nonempty(),
      },
      // Required for slash commands
      // CLIENT_ID: { schema: z.string().nonempty() },
      // GUILD_ID: { schema: z.string().nonempty() },
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    } else {
      console.error(e);
    }
    process.exit(1);
  }
};
