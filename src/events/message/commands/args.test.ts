import { parse } from "./args";

describe("parse", () => {
  const word = (word: string) => ({ type: "word", word });
  it("empty", () => {
    expect(parse("")).toEqual({
      options: {},
      args: [],
    });
  });

  it("words", () => {
    expect(parse("foo bar buz")).toEqual({
      options: {},
      args: ["foo", "bar", "buz"].map(word),
    });
  });

  it("double quoted", () => {
    expect(parse('foo "bar baz" "foo bar"')).toEqual({
      options: {},
      args: ["foo", "bar baz", "foo bar"].map(word),
    });

    expect(parse(`foo "bar's baz"`)).toEqual({
      options: {},
      args: ["foo", "bar's baz"].map(word),
    });
  });

  it("single quoted", () => {
    expect(parse("foo 'bar baz'")).toEqual({
      options: {},
      args: ["foo", "bar baz"].map(word),
    });
  });

  it("backtick", () => {
    expect(parse('foo `"bar baz"`')).toEqual({
      options: {},
      args: ["foo", '"bar baz"'].map(word),
    });
  });

  describe("options", () => {
    it("parse flags into options", () => {
      expect(parse("--foo=bar foo bar")).toEqual({
        options: { foo: "bar" },
        args: ["foo", "bar"].map(word),
      });

      expect(parse("--foo foo bar")).toEqual({
        options: { foo: "" },
        args: ["foo", "bar"].map(word),
      });
    });

    it("must use `=` to set value", () => {
      expect(parse("--foo foo bar")).toEqual({
        options: { foo: "" },
        args: ["foo", "bar"].map(word),
      });
    });

    it("flags after -- are arguments", () => {
      expect(parse("--foo=bar -- --a=b foo bar")).toEqual({
        options: { foo: "bar" },
        args: ["--a=b", "foo", "bar"].map(word),
      });
    });
  });

  describe("Discord objects", () => {
    it("user", () => {
      expect(parse("<@000000000000000000> and <@!0000000000000000001>")).toEqual({
        options: {},
        args: [
          { type: "user", id: "000000000000000000" },
          word("and"),
          { type: "user", id: "0000000000000000001" },
        ],
      });
    });

    it("role", () => {
      expect(parse("<@&000000000000000002> to <@!0000000000000000001>")).toEqual({
        options: {},
        args: [
          { type: "role", id: "000000000000000002" },
          word("to"),
          { type: "user", id: "0000000000000000001" },
        ],
      });
    });

    it("channel", () => {
      expect(parse("<@000000000000000000> to <#0000000000000000001>")).toEqual({
        options: {},
        args: [
          { type: "user", id: "000000000000000000" },
          word("to"),
          { type: "channel", id: "0000000000000000001" },
        ],
      });
    });
  });

  it("code block", () => {
    const info = "javascript";
    const code = "console.log(Math.random());";
    // prettier-ignore
    const body = [
      "--languageVersion=12.x",
      "```" + info,
      code,
      "```",
      ""
    ].join("\n");
    expect(parse(body)).toEqual({
      options: {
        languageVersion: "12.x",
      },
      args: [{ type: "code", info, code: code + "\n" }],
    });
  });
});
