// See https://github.com/plopjs/plop
// Run `npx plop` to generate a boilerplate.
export default (/** @type {import('plop').NodePlopAPI} */ plop) => {
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
    ],
    actions: [
      {
        type: "add",
        path: "src/commands/{{name}}.ts",
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
        path: "src/events/messageCreate/handlers/{{name}}.ts",
        templateFile: "templates/message-handler.ts.hbs",
      },
    ],
  });
};
