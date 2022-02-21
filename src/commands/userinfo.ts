import { CommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getUser } from "../codewars";

async function getUserInfo(name: string): Promise<string> {
  let user;
  try {
    user = await getUser(name);
  } catch (err) {
    return '';
  }
  
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
    .setName("userinfo")
    .setDescription("Info about a user")
    .addStringOption((opt) => opt.setName("username").setDescription("The Codewars username for information about the user"))
    .addBooleanOption((opt) => opt.setName("ephemeral").setDescription("Don't show user statistics to others"))
    .toJSON();

export const call = async (interaction: CommandInteraction) => {
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
};
