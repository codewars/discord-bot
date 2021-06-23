import { Message, Client, TextChannel } from "discord.js";
import { z } from "zod";
// reexport for convenience
export { Message };

const wordSchema = () =>
  z.object({
    type: z.literal("word"),
    word: z.string(),
  });

const codeBlockSchema = () =>
  z.object({
    type: z.literal("code"),
    info: z.string(),
    code: z.string(),
  });

const userTagSchema = () =>
  z.object({
    type: z.literal("user"),
    id: z.string(),
  });

const roleTagSchema = () =>
  z.object({
    type: z.literal("role"),
    id: z.string(),
  });

const channelTagSchema = () =>
  z.object({
    type: z.literal("channel"),
    id: z.string(),
  });

export type Word = z.infer<ReturnType<typeof wordSchema>>;
export type CodeBlock = z.infer<ReturnType<typeof codeBlockSchema>>;
export type UserTag = z.infer<ReturnType<typeof userTagSchema>>;
export type RoleTag = z.infer<ReturnType<typeof roleTagSchema>>;
export type ChannelTag = z.infer<ReturnType<typeof channelTagSchema>>;
export type CommandArg = Word | CodeBlock | UserTag | RoleTag | ChannelTag;

/// A command.
export type Command = (
  message: Message,
  args: CommandArg[],
  opts: Record<string, string>
) => Promise<void>;

// Some convenience functions to get the actual values used in commands.

const anyWord = (_: string) => true;
export const word = (validator: (w: string) => boolean = anyWord) =>
  wordSchema()
    .refine((w) => validator(w.word))
    .transform((w) => w.word);

export const discordUser = (client: Client) =>
  userTagSchema()
    .refine(
      (u) => client.users.cache.get(u.id) !== undefined,
      (u) => ({
        message: `Could not find user with ID: ${u.id}`,
      })
    )
    .transform((u) => client.users.cache.get(u.id)!);

export const discordTextChannel = (client: Client) =>
  channelTagSchema()
    .refine(
      (c) => client.channels.cache.get(c.id) instanceof TextChannel,
      (c) => ({
        message: `Could not find text channel with ID: ${c.id}`,
      })
    )
    .transform((u) => client.channels.cache.get(u.id)! as TextChannel);
