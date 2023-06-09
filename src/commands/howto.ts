import { ChatInputCommandInteraction, SlashCommandBuilder, userMention, Message, User, GuildMember, APIInteractionGuildMember } from "discord.js";

// howto
export const data = async () =>
  new SlashCommandBuilder()
    .setName("howto")
    .setDescription("HOWTOs and tutorials")
    .addSubcommand(scb => scb.setName("format_code"  ).addUserOption(b => b.setName("user").setDescription("User to send the message to").setRequired(false)).setDescription("How to use code formatting in Discord messages"))
    .addSubcommand(scb => scb.setName("ask_for_help" ).addUserOption(b => b.setName("user").setDescription("User to send the message to").setRequired(false)).setDescription("How to ask for help in a way others will want to help you"))
    .addSubcommand(scb => scb.setName("post_link"    ).addUserOption(b => b.setName("user").setDescription("User to send the message to").setRequired(false)).setDescription("How to post links to kata"))
    .addSubcommand(scb => scb.setName("create_thread").addUserOption(b => b.setName("user").setDescription("User to send the message to").setRequired(false)).setDescription("How to create discord threads"))
    .toJSON();

const allowedRoles = new Set(["admin", "mods", "mods+", "power-users"]);

const hasSufficientPrivilege = (member: GuildMember | APIInteractionGuildMember | null) => {
  let apimember: GuildMember = member as GuildMember;
  if(!apimember)
    return;
  console.info(typeof apimember.roles);
  return apimember && apimember.roles.cache.some(role => allowedRoles.has(role.name));
}

export const call = async (interaction: ChatInputCommandInteraction) => {  
  let targetUser = interaction.options.getUser("user", false) ?? interaction.user;
  if(targetUser.id !== interaction.user.id && !hasSufficientPrivilege(interaction.member)) {
    interaction.reply("You are not privileged to use this command.")
    return;
  }
  
  let subCommand = interaction.options.getSubcommand();  
  postHowtoDm(subCommand, targetUser).then( () => interaction.reply(`${userMention(targetUser.id)} please check your DMs`));
};


const postHowtoDm = async (command: string, user: User) => {
  
  let reply = ReplyBuilder.for(command).buildReply(); 

  const setUpReactions = (msg: Message<false>) => {
    for(let reaction of reply.reactions) { msg.react(reaction.emoji); }
    if(!reply.reactions.length)
      return;

    const collector = msg.createReactionCollector({filter: (_, u) => !u.bot });

    collector.on('collect', (reaction, reactor) => {
      if(reactor.bot || reactor.id != user.id)
        return;
      let emoji = reaction.emoji.name;
      let cmd = reply.reactions.find(r => r.emoji == emoji)?.command;
      if(cmd)
        postHowtoDm(cmd, user);
    });
  }


  return user.createDM(true)
  .then(dm => dm.send(reply.body))
  .then(setUpReactions);
}

class Reaction {

  constructor(emoji: string, command: string) {
    this.command = command;
    this.emoji = emoji;
  }

  public readonly emoji: string;
  public readonly command: string;
}

class HowtoReply {
  
  constructor(body: string, reactions: Reaction[]) {
    this.body = body;
    this.reactions = reactions;
  }
  
  public readonly body: string;
  public readonly reactions: Reaction[];
}

interface IReplyBuilder {
  buildReply(): HowtoReply;
}

class ReplyBuilder {
  static for(topic: string): IReplyBuilder {
    switch(topic) {
      case "format_code":   return new FormatCodeReplyBuilder();
      case "ask_for_help":  return new AskForHelpReplyBuilder();
      case "post_link":     return new PostKataLinkReplyBuilder();
      case "create_thread": return new CreateThreadReplyBuilder();
      default:              return new DummyReplyBuilder();
    }
  }
}

class FormatCodeReplyBuilder implements IReplyBuilder {
  buildReply(): HowtoReply {
    return { 
      reactions: [],
      body: 
      `# How to use code formatting in Discord messages
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

More info in Discord docs: <https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-#h_01GY0DAKGXDEHE263BCAYEGFJA>.` };
  }
}

class AskForHelpReplyBuilder implements IReplyBuilder {
  buildReply(): HowtoReply {
    return { reactions: [
      { emoji: '🧵', command: "create_thread" },
      { emoji: '🔗', command: "post_link"     }, 
      { emoji: '#️⃣', command: "format_code"   }
    ], body: `# How to ask for help
- Ask your question in an appropriate channel. You can use \`#help-solve\` for a general help with some kata, or topic-specific channels ( \`#python\`, or \`#algorithms\` ) if you need help with an algorithm or a syntax of a language.
- Create a thread to keep the discussion focused on your topic (react with :thread: \`:thread:\` or use \`/howto create_thread\` for more info).
- Explain what kata you are trying to solve. Post its title, and a link to its description (react with :link: \`:link:\` or use \`/howto kata_link\` for more info).
- Explain what your problem is. Tests do not accept your answers? Solution is timing out? Is there some other problem?
- Post **properly formatted** code of your solution (react with :hash: \`:hash:\` or use \`/howto format_code\` for more info).
- If the code you posted contains spoilers for the discussed kata, please delete it after discussing your matter and getting all necessary help.
` };
  }
}

class PostKataLinkReplyBuilder implements IReplyBuilder {
  buildReply(): HowtoReply {
    return { reactions: [], body: `# How to post links to kata
When posting links to kata, please remember to not post links directly to kata trainer. Make sure that links posted by you do not end with \`/trainer\`, but lead to a kata description.` };
  }
}

class CreateThreadReplyBuilder implements IReplyBuilder {
  buildReply(): HowtoReply {
    return { reactions: [], body: `# How to create Discord threads
Please use Discord threads to keep discussions focused, avoid spoilers, and to not introduce unnecessary noise into main channels.
See Discord docs if you do not know how to create threads: <https://support.discord.com/hc/en-us/articles/4403205878423-Threads-FAQ#h_01GDXVYE6AZA3QRSB42F5AGGYG>` };
  }
}

class DummyReplyBuilder implements IReplyBuilder {
  buildReply(): HowtoReply {
    return { reactions: [], body: "Unknown topic" };
  }
}