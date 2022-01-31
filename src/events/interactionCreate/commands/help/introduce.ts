import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { fromTrustedUser, getTexts } from "../../../../common";

const channels = ["help-solve"];
const channelTexts: Map<string, string> = getTexts("introduce", channels);

// introduce
export default {
  spec: new SlashCommandBuilder()
    .setName("introduce")
    .setDescription("Introduce a user to a channel")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The selected user to introduce a channel to")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The selected channel to introduce a user to")
        .setRequired(true)
    ),
  response: async (interaction: CommandInteraction) => {
    if (!fromTrustedUser(interaction)) {
      await interaction.reply("You are not authorized to use this command.");
      return;
    }
    const user = interaction.options.getUser("user");
    if (!user) throw new Error("The user parameter is required for command introduce");
    const channel = interaction.options.getChannel("channel");
    if (!channel) throw new Error("The channel parameter is required for command introduce");
    try {
      const reply = channelTexts.get(channel.name);
      if (!reply) {
        const WARNING = "Could not get the text for channel #" + channel.name;
        console.warn(WARNING);
        await interaction.reply(WARNING);
        return;
      }
      const dm = await user.createDM();
      await dm.send(reply);
    } catch (err) {
      console.warn(`failed to DM ${user.tag}: ${err.message || "unknown error"}`);
      await interaction.channel?.send(
        `<@${user.id}>, I couldn't DM you. See <https://github.com/codewars/discord-bot/blob/main/text/introduce/${channel.name}.md> instead.`
      );
    } finally {
      await interaction.reply("Channel introduction successfully sent to targeted user");
    }
    await interaction.reply("pong");
  },
};
