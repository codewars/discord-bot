import { readFileSync } from "fs";
import * as path from "path";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  CommandInteractionOption,
  GuildMember,
  TextChannel,
} from "discord.js";
import { RequestError, getLanguages, Language } from "./codewars";
import fuzzysearch from "fuzzysearch";

const textPath = path.join(__dirname, "../text");

export const getTexts = (commandName: string, values: string[]): Map<string, string> => {
  const commandPath = path.join(textPath, commandName);
  const texts: Map<string, string> = new Map();
  try {
    for (const value of values)
      texts.set(value, readFileSync(path.join(commandPath, `${value}.md`)).toString());
  } catch (err: any) {
    console.error(`failed to read texts under ${commandPath}: ${err.message || "unknown error"}`);
    process.exit(1);
  }
  return texts;
};

/**
 * Attemps to parse a username from the 'username' option. If no value is present the display name of the user sending the interaction is taken.
 * @param interaction the CommandInteraction to get the values from
 * @returns username
 * @throws RequestError if the username could not be fetched
 */
export const getUsername = (interaction: ChatInputCommandInteraction): string => {
  let username = interaction.options.getString("username");
  if (!username) {
    const member = interaction.member;
    const displayName = member instanceof GuildMember ? member.displayName : member?.nick;
    if (!displayName) throw new RequestError("Failed to fetch the name of the current user");
    username = displayName;
  }
  return username;
};

/**
 * Language option autocomplete interaction. Export as `autocomplete` to activate.
 * @param interaction the AutocompleteInteraction to check
 * @returns List of fuzzy matching languages, max 25
 */
export const languageAutocomplete = async (interaction: AutocompleteInteraction) => {
  const focused = getFocused(interaction.options.data);
  // The following shouldn't happen since "language" is the only option with autocompletion, but
  // this can be used to detect the focused option if we have multiple autocomplete options.
  if (focused?.name !== "language") return [];

  const typed = interaction.options.getString("language");
  // We can't show all options because we have more than 25.
  // Discord shows "no option match your search" when returning an empty array.
  if (!typed) return [];

  const languages = await getLanguages();
  const ignoreCase = typed.toLowerCase() === typed;
  const filtered = languages
    .filter(
      ({ id, name }) =>
        fuzzysearch(typed, id) || fuzzysearch(typed, ignoreCase ? name.toLowerCase() : name)
    )
    .map(({ id, name }) => ({ name: name, value: id }));
  // Make sure the response is 25 items or less.
  return filtered.slice(0, 25);
};

function getFocused(
  data: readonly CommandInteractionOption[] | undefined
): CommandInteractionOption | undefined {
  return (
    data?.find((opt) => opt.focused) ?? data?.map((opt) => getFocused(opt.options)).find((o) => o)
  );
}

/**
 * Attempts to parse a language matching by id or name to the given language option string or
 * `null` if not given (= overall). Throws {@link RequestError} if no matching language was found.
 * @param language - the language option to parse
 * @returns Language or null
 * @throws RequestError
 */
export const findLanguage = async (language: string | null): Promise<Language | null> => {
  if (language) {
    const languages = await getLanguages();
    // Discord started sending the `name` of autocompleted options.
    // Work around by finding the language id by name.
    const found = languages.find((x) => x.id === language || x.name === language);
    if (!found) throw new RequestError(`${language} is not a valid language id or name`);
    return found;
  }
  return null;
};

const REDIRECT: string = "This command is only available in channel **#bot-playground**";

/**
 * Restrict command output to #bot-playground unless ephemeral is set.
 * @throws RequestError
 */
export const checkBotPlayground = (ephemeral: Boolean, interaction: CommandInteraction) => {
  if (!ephemeral && (interaction.channel as TextChannel).name !== "bot-playground")
    throw new RequestError(REDIRECT);
};

/**
 * Format the given timestamp as discord timestamp in full short date/time format or "unknown" if null.
 * @param timestamp the unix timestamp in milliseconds
 * @returns formatted date string
 * @see https://discord.com/developers/docs/reference#message-formatting-timestamp-styles
 */
export const formatTimeStamp = (timestamp: number | null): string => {
  return timestamp ? `<t:${Math.round(timestamp / 1000)}:f>` : "unknown";
};
