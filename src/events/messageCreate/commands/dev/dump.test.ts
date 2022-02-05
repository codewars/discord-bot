import { stripIndents } from "common-tags";
import { Word } from "../types";

import { output } from "./dump";

describe("dump output", () => {
  it("empty", () => {
    expect(output([], {})).toEqual(stripIndents`
      arguments:
      \`\`\`json
      []
      \`\`\`
      options:
      \`\`\`json
      {}
      \`\`\`
    `);
  });

  it("with args and opts", () => {
    const word = (word: string): Word => ({ type: "word", word });
    expect(output(["foo", "bar"].map(word), { key: "val" })).toEqual(stripIndents`
      arguments:
      \`\`\`json
      [{"type":"word","word":"foo"},{"type":"word","word":"bar"}]
      \`\`\`
      options:
      \`\`\`json
      {"key":"val"}
      \`\`\`
    `);
  });
});
