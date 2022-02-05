import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/v9";
import { CommandInteraction } from "discord.js";
import { REST } from "@discordjs/rest";

import { Config } from "../config";

import * as echo from "./echo";
import * as info from "./info";

export type Command = {
  // Data to send when registering.
  data: RESTPostAPIApplicationCommandsJSONBody;
  // Handler.
  call: (interaction: CommandInteraction) => Promise<void>;
};

export const commands: { [k: string]: Command } = {
  echo,
  info,
};

// The caller is responsible for catching any error thrown
export const updateCommands = async (config: Config) => {
  const rest = new REST({ version: "9" }).setToken(config.BOT_TOKEN);
  const body = Object.values(commands).map((c) => c.data);
  // Global commands are cached for one hour.
  // Guild commands update instantly.
  // discord.js recommends guild command when developing and global in production.
  // For now, always use guild commands because our bot is only added to our server.
  await rest.put(Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), {
    body,
  });
  // Ideally, we shouldn't show a command if the user cannot use it.
  // If we decide to use permissions, the response for PUT contains command ids.
  // Restricted commands should have default permission false.
  // Then explicitly allow certain roles to use it.
  // If a required config is missing, we can skip registering the command and show a warning.
  // const fullPermissions = [{id: commandId, permissions: [{type: "ROLE", permission: true, id: config.MODS_ID}]}];
  // client.guilds.cache.get(config.GUILD_ID)?.commands?.permissions?.set({ fullPermissions });
};
