# Codewars Discord Bot

[![Discord chat](https://img.shields.io/discord/846624424199061524.svg?logo=discord&style=flat)](https://discord.gg/mSwJWRvkHA)
[![CI](https://github.com/codewars/discord-bot/workflows/CI/badge.svg)](https://github.com/codewars/discord-bot/actions?query=workflow%3ACI)
[![License MIT](https://img.shields.io/github/license/codewars/discord-bot)](./LICENSE)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)

The official Discord bot for Codewars.

## Project Status

Early stage. Expect breaking changes.

Feedback is appreciated (Discord or GitHub issues/discussions).

## Configuration

The following environment variables are used:

- `CLIENT_ID` (required): The ID of the application associated with your bot
- `GUILD_ID` (required): The ID of your Discord server
- `BOT_TOKEN` (required): The token used to log in

## Developement Setup

> NOTE: Please discuss with us first before adding new features to avoid wasting your time.

Before working on this repo, you should already have [set up a bot account](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) and [added it to your development server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html), with at least the following permissions:

- `applications.commands`: Enables the use of slash commands
- `bot`: Enables your application to join the server as a bot
  - `SEND_MESSAGES`: Enables your bot to send messages to channels
  - `MANAGE_MESSAGES`: Enables your bot to edit server messages and reactions

In order to mimic the Codewars Discord server in your development server, you may also wish to add appropriate roles such as `@admin`, `@mods` and `@power-users`, as well as common channels such as `#help-solve` and `#bot-playground`.

### Making Changes

1. Fork this repo
1. Clone the fork to your local development environment, assuming `GITHUB_USERNAME` is set to your GitHub username:

   ```bash
   $ git clone git@github.com:"$GITHUB_USERNAME"/discord-bot.git
   ```

1. Make this project your working directory
1. Install dependencies and compile TypeScript: `$ npm install`
1. Start TypeScript compiler process to recompile on change: `$ npm run build:watch`
1. In a new terminal session, run the bot with your client and guild IDs, as well as [your token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token)
   ```bash
   $ CLIENT_ID=xxxxxxxxxxxxxxxxxx \
       GUILD_ID=xxxxxxxxxxxxxxxxxx \
       BOT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
       npm start
   ```

After confirming that the bot works as expected, make changes to the local copy of your fork as appropriate and test your changes by restarting the bot.

### Adding a new command

Run `npx plop command` to generate boilerplate. You will be asked to enter the name of the command (lowercase English letters only) which should be a verb and select an associated category.

If your command belongs to a category that does not exist yet, stop the command generation by pressing `Ctrl-C`, then modify `plopfile.ts` as appropriate to add your category and re-run `npx plop command`.

### Adding a new message handler

Run `npx plop message-handler` to generate boilerplate.

### Code Style

[Prettier](https://prettier.io/) is used to ensure consistent style. We use the defaults except for `printWidth: 100` because `80` is often too narrow with types.

`pre-commit` hook to format staged changes is installed automatically when you run `npm install`, so you don't need to do anything. However, it's recommended to [configure your editor](https://prettier.io/docs/en/editors.html) to format on save, and forget about formatting.

## License

[MIT](./LICENSE)
