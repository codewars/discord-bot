import { CommandArgs, CommandArg } from "./types";

export const parse = (body: string): CommandArgs => {
  const options: { [k: string]: string } = {};
  const args: CommandArg[] = [];
  let parseFlags = true;
  let str = body.trimLeft();

  mainLoop: while (str.length > 0) {
    // Collect options from flags (`--foo=bar`). Ignore any flags after delimiter `--`.
    if (parseFlags) {
      const flagMatch = str.match(/^--(\S+)?/);
      if (flagMatch !== null) {
        const option = flagMatch[1];
        if (!option) {
          parseFlags = false;
        } else {
          // Only a simple key value pair for now.
          // Last one wins.
          const [k, v] = option.split("=", 2);
          options[k] = v || "";
        }
        str = str.slice(flagMatch[0].length).trimLeft();
        continue;
      }
    }

    // Parse special Discord tags
    {
      const discordTag = str.match(/^<(@!?|@&|#)(\d{17,19})>/);
      if (discordTag !== null) {
        const prefix = discordTag[1];
        const id = discordTag[2];
        if (prefix === "@" || prefix === "@!") {
          args.push({ type: "user", id });
        } else if (prefix === "@&") {
          args.push({ type: "role", id });
        } else if (prefix === "#") {
          args.push({ type: "channel", id });
        }
        str = str.slice(discordTag[0].length).trimLeft();
        continue;
      }
    }

    // Parse fenced code block and store info string.
    // Can be used for code and multi-line argument.
    {
      const codeBlockMatch = str.match(/^(`{3,})(.+)?\n([^]+\n)\1/);
      if (codeBlockMatch !== null) {
        args.push({
          type: "code",
          info: codeBlockMatch[2] || "",
          code: codeBlockMatch[3],
        });
        str = str.slice(codeBlockMatch[0].length).trimLeft();
        continue;
      }
    }

    // Parse quoted argument. Doesn't handle excaped ones within.
    // Backticks can be used to preserve quotes.
    {
      for (const re of [/^`([^`]+?)`/, /^'([^']+?)'/, /^"([^"]+?)"/]) {
        const match = str.match(re);
        if (match !== null) {
          args.push(match[1]);
          str = str.slice(match[0].length).trimLeft();
          continue mainLoop;
        }
      }
    }

    // Space delimited word. Expected to exist because of the loop condition.
    const word = str.match(/^\S+/)![0];
    args.push(word);
    str = str.slice(word.length).trimLeft();
  }

  return {
    options,
    args,
  };
};
