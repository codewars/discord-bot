import { readFileSync } from "fs";
import * as path from "path";

const textPath = path.join(__dirname, "../text");

export const getTexts = (commandName: string, values: string[]): Map<string, string> => {
  const commandPath = path.join(textPath, commandName);
  const texts: Map<string, string> = new Map();
  try {
    for (const value of values)
      texts.set(value, readFileSync(path.join(commandPath, `${value}.md`)).toString());
  } catch (err) {
    console.error(`failed to read texts under ${commandPath}: ${err.message || "unknown error"}`);
    process.exit(1);
  }
  return texts;
};
