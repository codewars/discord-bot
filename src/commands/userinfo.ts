import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getUser } from "../codewars";
import { checkBotPlayground, getUsername } from "../common";

async function getUserInfo(name: string): Promise<string> {
  let user = await getUser(name);

  const rank = user.ranks.overall.name;
  const honor = user.honor;
  const position = user.leaderboardPosition;
  const authored = user.codeChallenges.totalAuthored;
  const completed = user.codeChallenges.totalCompleted;

  return `\`\`\`
User: ${name}
Rank: ${rank}
Honor: ${honor}\
${position ? `\nPosition: #${position}` : ""}\
${authored ? `\nCreated kata: ${authored}` : ""}
Completed kata: ${completed}
\`\`\``;
}

export const data = async () =>
  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get info about a Codewars user")
    .addStringOption((opt) => opt.setName("username").setDescription("The username to look up"))
    .addBooleanOption((opt) => opt.setName("ephemeral").setDescription("Hide from others"))
    .toJSON();

export const call = async (interaction: CommandInteraction) => {
  const username = getUsername(interaction);
  const ephemeral = interaction.options.getBoolean("ephemeral") || false;
  checkBotPlayground(ephemeral, interaction);

  const content = await getUserInfo(username);

  await interaction.reply({
    content: content,
    ephemeral: ephemeral,
  });
};
