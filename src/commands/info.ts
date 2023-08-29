// A subcommand example
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { formatTimeStamp } from "../common";

export const data = async () =>
  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Replies with info")
    .addSubcommand((sub) =>
      sub
        .setName("user")
        .setDescription("Info about a user")
        .addUserOption((o) => o.setName("user").setDescription("The user"))
    )
    .addSubcommand((sub) => sub.setName("server").setDescription("Info about the server"))
    .toJSON();

export const call = async (interaction: ChatInputCommandInteraction) => {
  switch (interaction.options.getSubcommand()) {
    case "user":
      const userparam = interaction.options.getUser("user");
      const user = userparam || interaction.user;
      const member = userparam
        ? interaction.guild?.members.cache.get(user.id) || null
        : (interaction.member as GuildMember | null);
      let msg = `Username: ${user.username}${user.bot ? " *(Bot)*" : ""}
ID: ${user.id}
Created at: ${formatTimeStamp(user.createdTimestamp)}
Global display name: ${user.globalName || "*(not set)*"}`;
      if (member)
        msg += `
Server nickname: ${member.nickname || "*(not set)*"}
Display name: ${member.displayName}
Joined server at: ${formatTimeStamp(member.joinedTimestamp)}`;
      await interaction.reply(msg);
      return;

    case "server":
      const guild = await interaction.guild?.fetch();
      if (guild) {
        await interaction.reply(
          `Server name: ${guild.name}
Total members: ${guild.approximateMemberCount}
Server created at: ${formatTimeStamp(guild.createdTimestamp)}`
        );
      }
      return;
  }
};
