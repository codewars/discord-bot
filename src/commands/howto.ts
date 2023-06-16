import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  userMention,
  hyperlink,
  hideLinkEmbed,
  User,
  GuildMember,
  APIInteractionGuildMember,
} from "discord.js";
import { getTexts } from "../common";

// howto
const commands: HowtoCommand[] = [
  {
    name: "ask_for_help",
    description: "How to ask for help in a way others will want to help you",
    reactions: [
      { emoji: "🧵", command: "create_thread" },
      { emoji: "🔗", command: "post_link" },
      { emoji: "#️⃣", command: "format_code" },
    ],
  },
  {
    name: "format_code",
    description: "How to use code formatting in Discord messages",
    reactions: [],
  },
  {
    name: "create_thread",
    description: "How to create discord threads",
    reactions: [],
  },
  {
    name: "post_link",
    description: "How to post links to kata",
    reactions: [],
  },
];

const howtoTexts: Map<string, string> = getTexts(
  "howto",
  commands.map((c) => c.name)
);

export const data = async () => {
  const addTargetUserParam = (scb: SlashCommandSubcommandBuilder) =>
    scb.addUserOption((b) =>
      b.setName("user").setDescription("User to send the message to").setRequired(false)
    );

  let rootCommandBuilder = new SlashCommandBuilder()
    .setName("howto")
    .setDescription("HOWTOs and tutorials");

  for (let subcommand of commands) {
    rootCommandBuilder.addSubcommand((scb) =>
      addTargetUserParam(scb.setName(subcommand.name).setDescription(subcommand.description))
    );
  }
  return rootCommandBuilder.toJSON();
};

const allowedRoles = new Set(["admin", "mods", "mods+", "power-users"]);

const hasSufficientPrivilege = (member: GuildMember | APIInteractionGuildMember | null) => {
  let guildMember: GuildMember = member as GuildMember;
  return guildMember && guildMember.roles.cache.some((role) => allowedRoles.has(role.name));
};

export const call = async (interaction: ChatInputCommandInteraction) => {
  let interactionReply = async (content: string, ephemeral: boolean = true) => {
    await interaction.reply({ content, ephemeral });
  };

  let invokingUser = interaction.user;
  let targetUser = interaction.options.getUser("user", false) ?? invokingUser;

  if (targetUser.bot) {
    await interactionReply(
      `${userMention(invokingUser.id)}, you cannot use this command on a bot.`
    );
    return;
  }

  let selfTarget = targetUser.id === invokingUser.id;
  if (selfTarget || hasSufficientPrivilege(interaction.member)) {
    let subCommand = interaction.options.getSubcommand();
    let dmReply = commands.find((c) => c.name == subCommand);

    if (dmReply) {
      try {
        await postHowtoDm(dmReply, targetUser);
        await interactionReply(`${userMention(targetUser.id)} please check your DMs`, selfTarget);
      } catch (reason) {
        let url = `https://github.com/codewars/discord-bot/blob/main/text/howto/${subCommand}.md`;
        await interactionReply(
          `${userMention(targetUser.id)} I couldn't DM you. See ${hyperlink(
            dmReply.description,
            hideLinkEmbed(url)
          )} instead.`,
          selfTarget
        );
      }
    } else {
      await interactionReply(`Unknown command: \`${subCommand}\``);
    }
  } else {
    await interactionReply(
      `${userMention(invokingUser.id)}, you are not privileged to use this command.`
    );
  }
};

const postHowtoDm = async (command: HowtoCommand, targetUser: User) => {
  let body = howtoTexts.get(command.name);
  if (!body) {
    return;
  }
  let message = await targetUser.send(body);
  await Promise.all(command.reactions.map(r => message.react(r.emoji)));
  
  // Do not set up a collector if there are no reactions
  if (!command.reactions.length) return;

  const collector = message.createReactionCollector({ time: 30*1000, filter: (_, reactor) => !reactor.bot });
  collector
  .on("collect", (reaction, reactor) => {
    if (reactor.bot || reactor.id != targetUser.id) return;

    let emoji = reaction.emoji.name;
    let commandName = command.reactions.find((r) => r.emoji == emoji)?.command;
    let reactionCommand = commands.find((c) => c.name == commandName);
    if (reactionCommand) {
      postHowtoDm(reactionCommand, targetUser);
    }
  })
  .once("end", async () => {
    // Clean up info on reactions when the collector expires.
    // Requires `MANAGE_MESSAGE` permission.
    try {
      await message.edit(message.content.replace(/react with .+? or /g, ""));

      // On DMs, an attempt to remove another user's reaction crashes so
      // the bot needs to take care to remove only its own reactions.
      await Promise.all(message.reactions.cache.map(r => r.users.remove(message.author)));
    } catch (e: any) {
      console.error(`failed to remove reaction: ${e.message || "unknown error"}`);
    }
  });
};

type Reaction = {
  emoji: string;
  command: string;
};

type HowtoCommand = {
  name: string;
  description: string;
  reactions: Reaction[];
};
