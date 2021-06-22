# Codewars Discord Bot

[![Discord chat](https://img.shields.io/discord/846624424199061524.svg?logo=discord&style=flat)](https://discord.gg/mSwJWRvkHA)
[![CI](https://github.com/codewars/discord-bot/workflows/CI/badge.svg)](https://github.com/codewars/discord-bot/actions?query=workflow%3ACI)

The official Discord bot for Codewars.

## Project Status

Early stage. Expect breaking changes.

Feedback is appreciated (Discord or GitHub issues).

## Configuration

The following environment variables are used:

- `BOT_TOKEN` (required): The token used to log in.
- `COMMAND_PREFIX`: The prefix used to identify commands. Defaults to `?`.

## Developement Setup

> NOTE: Please discuss with us first before adding new features to avoid wasting your time.

> TODO Expand

### Install dependencies and build

```bash
npm install
```

### Start bot with your token

```bash
BOT_TOKEN=.... npm start
```

### Making changes

Let TypeScript compile on change:

```bash
npm run build:watch
```

and restart the bot.

Run tests automatically on save with:

```bash
npm run test:watch
```

Run all tests with:

```bash
npm run test
```

### Adding a new command

Run `npx plop command` to generate boilerplate.

### Adding a new message handler

Run `npx plop message-handler` to generate boilerplate.

## TODO

- [ ] Write contribution guides
