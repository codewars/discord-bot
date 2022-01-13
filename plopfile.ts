import { NodePlopAPI } from "plop";

// See https://github.com/plopjs/plop
// Run `npx plop` to generate a boilerplate.
export default (plop: NodePlopAPI) => {
  plop.setGenerator("command", {
    description: "new command",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "name of the command",
        validate: (value) => {
          if (/^[a-z]+$/.test(value)) {
            return true;
          }
          return "name should match /^[a-z]+$/";
        },
      },
      {
        type: "list",
        name: "category",
        message: "command category",
        default: 0,
        choices: [
          // TODO add more categories as needed
          { name: "Dev", value: "dev" },
          { name: "Help", value: "help" },
          { name: "Moderation", value: "moderation" },
          { name: "Fun", value: "fun" },
        ],
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/events/message/commands/{{category}}/{{name}}.ts",
        templateFile: "templates/command.ts.hbs",
      },
    ],
  });

  plop.setGenerator("message-handler", {
    description: "new message handler",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "name of the handler, words separated by hyphen",
        validate: (value) => {
          if (/^[a-z]+(-[a-z]+)*$/.test(value)) {
            return true;
          }
          return "name should match /^[a-z]+(-[a-z]+)*$/";
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/events/message/handlers/{{name}}.ts",
        templateFile: "templates/message-handler.ts.hbs",
      },
    ],
  });
};
