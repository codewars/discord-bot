import {
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  Client,
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  REST,
  ChatInputCommandInteraction,
} from "discord.js";

import { Config } from "../config";

import * as echo from "./echo";
import * as info from "./info";
import * as link from "./link";
import * as introduce from "./introduce";
import * as warn from "./warn";
import * as rankup from "./rankup";
import * as leaderboard from "./leaderboard";
import * as userinfo from "./userinfo";
import * as howto from "./howto";

export type Command = {
  // Data to send when registering.
  data: () => Promise<RESTPostAPIApplicationCommandsJSONBody>;
  // Handler.
  call: (interaction: ChatInputCommandInteraction) => Promise<void>;
  // Autocompletion handler.
  autocomplete?: (
    interaction: AutocompleteInteraction
  ) => Promise<ApplicationCommandOptionChoiceData[]>;
};

export const commands: { [k: string]: Command } = {
  echo,
  info,
  link,
  introduce,
  warn,
  rankup,
  leaderboard,
  userinfo,
  howto,
};

// The caller is responsible for catching any error thrown
export const updateCommands = async (client: Client, config: Config) => {
  const guild = client.guilds.cache.get(config.GUILD_ID);
  if (!guild) throw new Error("Failed to get the current guild");

  const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);
  const body = await Promise.all(Object.values(commands).map((c) => c.data()));
  // Global commands are cached for one hour.
  // Guild commands update instantly.
  // discord.js recommends guild command when developing and global in production.
  // For now, always use guild commands because our bot is only added to our server.
  await rest.put(Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), {
    body,
  });
};
