import { parse } from "./args";

describe("parse", () => {
  it("empty", () => {
    expect(parse("")).toEqual({
      options: {},
      args: [],
    });
  });

  it("words", () => {
    expect(parse("foo bar buz")).toEqual({
      options: {},
      args: ["foo", "bar", "buz"],
    });
  });

  it("double quoted", () => {
    expect(parse('foo "bar baz" "foo bar"')).toEqual({
      options: {},
      args: ["foo", "bar baz", "foo bar"],
    });

    expect(parse(`foo "bar's baz"`)).toEqual({
      options: {},
      args: ["foo", "bar's baz"],
    });
  });

  it("single quoted", () => {
    expect(parse("foo 'bar baz'")).toEqual({
      options: {},
      args: ["foo", "bar baz"],
    });
  });

  it("backtick", () => {
    expect(parse('foo `"bar baz"`')).toEqual({
      options: {},
      args: ["foo", '"bar baz"'],
    });
  });

  describe("options", () => {
    it("parse flags into options", () => {
      expect(parse("--foo=bar foo bar")).toEqual({
        options: { foo: "bar" },
        args: ["foo", "bar"],
      });

      expect(parse("--foo foo bar")).toEqual({
        options: { foo: "" },
        args: ["foo", "bar"],
      });
    });

    it("must use `=` to set value", () => {
      expect(parse("--foo foo bar")).toEqual({
        options: { foo: "" },
        args: ["foo", "bar"],
      });
    });

    it("flags after -- are arguments", () => {
      expect(parse("--foo=bar -- --a=b foo bar")).toEqual({
        options: { foo: "bar" },
        args: ["--a=b", "foo", "bar"],
      });
    });
  });

  describe("Discord objects", () => {
    it("user", () => {
      expect(parse("<@000000000000000000> and <@!0000000000000000001>")).toEqual({
        options: {},
        args: [
          { type: "user", id: "000000000000000000" },
          "and",
          { type: "user", id: "0000000000000000001" },
        ],
      });
    });

    it("role", () => {
      expect(parse("<@&000000000000000002> to <@!0000000000000000001>")).toEqual({
        options: {},
        args: [
          { type: "role", id: "000000000000000002" },
          "to",
          { type: "user", id: "0000000000000000001" },
        ],
      });
    });

    it("channel", () => {
      expect(parse("<@000000000000000000> to <#0000000000000000001>")).toEqual({
        options: {},
        args: [
          { type: "user", id: "000000000000000000" },
          "to",
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
