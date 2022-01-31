import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export type Command = {
  spec: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  response: (interaction: CommandInteraction) => Promise<void>;
};
