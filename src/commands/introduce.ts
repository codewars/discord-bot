import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder, userMention, hideLinkEmbed } from "@discordjs/builders";
import { getTexts } from "../common";

const channels = ["help-solve"];
const channelTexts: Map<string, string> = getTexts("introduce", channels);

// introduce
export const data = async () =>
  new SlashCommandBuilder()
    .setName("introduce")
    .setDescription("Introduce the user to the specified channel")
    .setDefaultPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to introduce the specified channel to")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to introduce the specified user to")
        .setRequired(true)
    )
    .toJSON();

export const call = async (interaction: CommandInteraction) => {
  const user = interaction.options.getUser("user", true);
  const channel = interaction.options.getChannel("channel", true);
  const helpText = channelTexts.get(channel.name);
  if (!helpText) {
    await interaction.reply({
      content: `No help text available for the given channel
	
Help text is available for the following channels:

${channels.map((channel) => `- **#${channel}**`).join("\n")}`,
      ephemeral: true,
    });
    return;
  }
  try {
    const dm = await user.createDM();
    await dm.send(helpText);
    await interaction.reply(`${userMention(user.id)} please check your DMs`);
  } catch (err) {
    await interaction.reply(
      `${userMention(user.id)} I couldn't DM you. See ${hideLinkEmbed(
        `https://github.com/codewars/discord-bot/blob/main/text/introduce/${channel.name}.md`
      )} instead.`
    );
  }
};
