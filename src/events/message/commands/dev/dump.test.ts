import { stripIndents } from "common-tags";

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
    expect(output(["foo", "bar"], { key: "val" })).toEqual(stripIndents`
      arguments:
      \`\`\`json
      ["foo","bar"]
      \`\`\`
      options:
      \`\`\`json
      {"key":"val"}
      \`\`\`
    `);
  });
});
