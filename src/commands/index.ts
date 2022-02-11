import {
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsResult,
  Routes,
} from "discord-api-types/v9";
import {
  Client,
  CommandInteraction,
  Guild,
  GuildApplicationCommandPermissionData,
  ApplicationCommandPermissionData,
} from "discord.js";
import { REST } from "@discordjs/rest";

import { Config } from "../config";

import * as echo from "./echo";
import * as info from "./info";
import * as link from "./link";
import * as introduce from "./introduce";
import * as warn from "./warn";

export type Command = {
  // Data to send when registering.
  data: RESTPostAPIApplicationCommandsJSONBody;
  // Handler.
  call: (interaction: CommandInteraction) => Promise<void>;
  // Roles authorized to use this command.
  // Ignored unless `data.default_permission` is `false`.
  authorizedRoles?: string[];
};

export const commands: { [k: string]: Command } = {
  echo,
  info,
  link,
  introduce,
  warn,
};

// The caller is responsible for catching any error thrown
export const updateCommands = async (client: Client, config: Config) => {
  const guild = client.guilds.cache.get(config.GUILD_ID);
  if (!guild) throw new Error("Failed to get the current guild");

  const rest = new REST({ version: "9" }).setToken(config.BOT_TOKEN);
  const body = Object.values(commands).map((c) => c.data);
  // Global commands are cached for one hour.
  // Guild commands update instantly.
  // discord.js recommends guild command when developing and global in production.
  // For now, always use guild commands because our bot is only added to our server.
  const result = await rest.put(
    Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
    {
      body,
    }
  );
  await setPermissions(guild, result as RESTPutAPIApplicationGuildCommandsResult);
};

// Enable restricted commands for the allowed roles.
// Warn if none of the allowed roles are found.
const setPermissions = async (guild: Guild, result: RESTPutAPIApplicationGuildCommandsResult) => {
  const fullPermissions: GuildApplicationCommandPermissionData[] = [];
  for (const cmd of result) {
    if (cmd.default_permission !== false) continue;

    const { authorizedRoles } = commands[cmd.name];
    if (!Array.isArray(authorizedRoles)) {
      throw new Error(`/${cmd.name} is restricted without authorizedRoles`);
    }

    const permissions: ApplicationCommandPermissionData[] = [];
    for (const name of authorizedRoles) {
      const role = guild.roles.cache.find((role) => role.name === name);
      if (role) {
        permissions.push({ id: role.id, type: "ROLE", permission: true });
      }
    }

    if (permissions.length > 0) {
      fullPermissions.push({ id: cmd.id, permissions });
    } else {
      console.warn(
        `/${cmd.name} is unusable because none of the authorized roles exist.`,
        JSON.stringify(authorizedRoles)
      );
    }
  }

  if (fullPermissions.length > 0) {
    console.log("Setting permissions for restricted (/) commands");
    await guild.commands.permissions.set({ fullPermissions });
    console.log("Successfully set permissions for restricted (/) commands");
  }
};
