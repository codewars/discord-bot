import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { fromModerator, getTexts } from "../../../../common";

const reasons = ["conduct", "content", "spam"];
const warnTexts: Map<string, string> = getTexts("warn", reasons);

// warn
export default {
  spec: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn the offender for violating a server rule")
    .addUserOption((option) =>
      option
        .setName("offender")
        .setDescription("The user who violated a server rule")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("rule")
        .setDescription("The rule which was violated")
        .setRequired(true)
        .addChoice("content", "content")
        .addChoice("conduct", "conduct")
        .addChoice("spam", "spam")
    ),
  response: async (interaction: CommandInteraction) => {
    if (!fromModerator(interaction)) {
      await interaction.reply("You are not authorized to use this command.");
      return;
    }
    const offender = interaction.options.getUser("offender");
    if (!offender) throw new Error("The offender parameter is required for command warn");
    const rule = interaction.options.getString("rule");
    if (!rule) throw new Error("The rule parameter is required for command warn");
    try {
      const reply = warnTexts.get(rule);
      if (!reply) {
        console.warn('Could not get the text for rule "' + rule + '"');
        return;
      }
      const dm = await offender.createDM();
      await dm.send(reply);
    } catch (err) {
      console.warn(`failed to DM ${offender.tag}: ${err.message || "unknown error"}`);
      await interaction.channel?.send(
        `<@${offender.id}>, I couldn't DM you. See <https://github.com/codewars/discord-bot/blob/main/text/warn/${rule}.md> instead.`
      );
    } finally {
      await interaction.reply("Warning successfully issued.");
    }
  },
};
