import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  userMention,
  Message,
  User,
  GuildMember,
  APIInteractionGuildMember,
} from "discord.js";

// howto

const commands: HowtoCommand[] = [
  {
    name: "format_code",
    description: "How to use code formatting in Discord messages",
    body: `# How to use code formatting in Discord messages
Discord supports Markdown for code blocks and syntax highlighting of various programming languages.
If you want to post code and use syntax highlighting, you need to surround it with three backticks,
with an optional name of your language:

\\\`\\\`\\\`python
def hello_world():
  print("Hello, world!")
\\\`\\\`\\\`

When you do this, your code will be neatly formatted:

\`\`\`python
def hello_world():
  print("Hello, world!")
\`\`\`

You can replace \`python\` with any other language supported by Discord, or just omit it.

More info in Discord docs: <https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-#h_01GY0DAKGXDEHE263BCAYEGFJA>.`,
    reactions: [],
  },
  {
    name: "ask_for_help",
    description: "How to ask for help in a way others will want to help you",
    body: `# How to ask for help
- Ask your question in an appropriate channel. You can use \`#help-solve\` for a general help with some kata, or topic-specific channels ( \`#python\`, or \`#algorithms\` ) if you need help with an algorithm or a syntax of a language.
- Create a thread to keep the discussion focused on your topic (react with :thread: \`:thread:\` or use \`/howto create_thread\` for more info).
- Explain what kata you are trying to solve. Post its title, and a link to its description (react with :link: \`:link:\` or use \`/howto kata_link\` for more info).
- Explain what your problem is. Tests do not accept your answers? Solution is timing out? Is there some other problem?
- Post **properly formatted** code of your solution (react with :hash: \`:hash:\` or use \`/howto format_code\` for more info).
- If the code you posted contains spoilers for the discussed kata, please delete it after discussing your matter and getting all necessary help.`,
    reactions: [
      { emoji: "🧵", command: "create_thread" },
      { emoji: "🔗", command: "post_link" },
      { emoji: "#️⃣", command: "format_code" },
    ],
  },
  {
    name: "post_link",
    description: "How to post links to kata",
    body: `# How to post links to kata
- Surround the links to kata with angle brackets: \`<https://www.codewars.com/kata/50654ddff44f800200000004/python>\`. This will prevent Discord from inserting embeds into your message, as they do not carry too much useful information, and are quite annoying.
- Please, do _NOT_  post direct links to kata trainers: make sure you don't have a trailling ~~\`/trainer\`~~ in the url.
- Remember to also mention a title of the kata you are linking to.`,
    reactions: [],
  },
  {
    name: "create_thread",
    description: "How to create discord threads",
    body: `# How to create Discord threads
Please use Discord threads to keep discussions focused, avoid spoilers, and to not introduce unnecessary noise into main channels. Remember to give a meaningful title to your thread, for example _"hobovsky's thread - help to solve Multiply kata"_, or something similar.

See Discord docs if you do not know how to create threads: <https://support.discord.com/hc/en-us/articles/4403205878423-Threads-FAQ#h_01GDXVYE6AZA3QRSB42F5AGGYG>`,
    reactions: [],
  },
];

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
  let invokingUser = interaction.user;
  let targetUser = interaction.options.getUser("user", false) ?? invokingUser;

  if (targetUser.bot) {
    interaction.reply({
      content: `${userMention(invokingUser.id)}, you cannot use this command on a bot.`,
      ephemeral: true,
    });
    return;
  }

  let selfTarget = targetUser.id === invokingUser.id;
  if (selfTarget || hasSufficientPrivilege(interaction.member)) {
    let subCommand = interaction.options.getSubcommand();
    let dmReply = commands.find((c) => c.name == subCommand);

    if (dmReply) {
      postHowtoDm(dmReply, targetUser).then(() =>
        interaction.reply({
          content: `${userMention(targetUser.id)} please check your DMs`,
          ephemeral: selfTarget,
        })
      );
    } else {
      interaction.reply({
        content: `Unknown command: \`${subCommand}\``,
        ephemeral: true,
      });
    }
  } else {
    interaction.reply({
      content: `${userMention(invokingUser.id)}, you are not privileged to use this command.`,
      ephemeral: true,
    });
  }
};

const postHowtoDm = async (command: HowtoCommand, targetUser: User) => {
  const setUpReactions = (msg: Message<false>) => {
    for (let reaction of command.reactions) {
      msg.react(reaction.emoji);
    }

    // Do not set up a collector if there are no reactions
    if (!command.reactions.length) return;

    const collector = msg.createReactionCollector({ filter: (_, reactor) => !reactor.bot });
    collector.on("collect", (reaction, reactor) => {
      if (reactor.bot || reactor.id != targetUser.id) return;

      let emoji = reaction.emoji.name;
      let commandName = command.reactions.find((r) => r.emoji == emoji)?.command;
      let reactionCommand = commands.find((c) => c.name == commandName);
      if (reactionCommand) {
        postHowtoDm(reactionCommand, targetUser);
      }
    });
  };

  return targetUser
    .createDM(true)
    .then((dm) => dm.send(command.body))
    .then(setUpReactions);
};

class Reaction {
  constructor(emoji: string, command: string) {
    this.command = command;
    this.emoji = emoji;
  }

  public readonly emoji: string;
  public readonly command: string;
}

class HowtoCommand {
  constructor(name: string, description: string, body: string, reactions: Reaction[]) {
    this.name = name;
    this.description = description;
    this.body = body;
    this.reactions = reactions;
  }

  public readonly name: string;
  public readonly description: string;
  public readonly body: string;
  public readonly reactions: Reaction[];
}
