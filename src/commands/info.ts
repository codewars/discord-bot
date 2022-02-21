// A subcommand example
import { CommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import fetch from "node-fetch";

async function getUserInfo(name: string) {
  const response = await fetch(`https://www.codewars.com/api/v1/users/${name}`);
  if (response.status === 404) return '';
  
  const user = await response.json();

  const rank = user.ranks.overall.name;
  const honor = user.honor;
  const position = user.leaderboardPosition;
  const authored = user.codeChallenges.totalAuthored;
  const completed = user.codeChallenges.totalCompleted;

  return `\`\`\`
User: ${name}
Rank: ${rank}
Honor: ${honor}\
${position ? `\nPosition: #${position}`: ''}\
${authored ? `\nCreated katas: ${authored}`: ''}
Completed katas: ${completed}
\`\`\``
};

export const data = async () =>
  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Replies with info")
    .addSubcommand((sub) =>
      sub
        .setName("user")
        .setDescription("Info about a user")
        .addStringOption((opt) => opt.setName("username").setDescription("The Codewars username for information about the user"))
        .addBooleanOption((opt) => opt.setName("ephemeral").setDescription("Don't show user statistics to others"))
    )
    .addSubcommand((sub) => sub.setName("server").setDescription("Info about the server"))
    .toJSON();

export const call = async (interaction: CommandInteraction) => {
  switch (interaction.options.getSubcommand()) {
    case "user":
      let username = interaction.options.getString("username");
      if (!username) {
        const member = interaction.member;
        const displayName = member instanceof GuildMember ? member.displayName : member?.nick;
        if (!displayName) {
          await interaction.reply({
            content: "Failed to fetch the name of the current user",
            ephemeral: true,
          });
          return;
        }
        username = displayName;
      }

      const ephemeral = interaction.options.getBoolean("ephemeral") || false;      
      const content = await getUserInfo(username);
      
      if (!content) {
        await interaction.reply({
          content: `Could not find user: ${username}`,
          ephemeral: true,
        });
        return;
      }
      
      await interaction.reply({
        content: content,
        ephemeral: ephemeral,
      });
      return;

    case "server":
      const { guild } = interaction;
      if (guild) {
        await interaction.reply(`Server name: ${guild.name}\nTotal members: ${guild.memberCount}`);
      }
      return;
  }
};
