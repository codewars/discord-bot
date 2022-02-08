import { Command } from "./types";
export { parse as parseArguments } from "./args";

import ping from "./dev/ping";
import dump from "./dev/dump";
import warn from "./moderation/warn";
import rankup from "./fun/rankup";

const commands: { [k: string]: Command } = {
  ping,
  dump,
  warn,
  rankup,
};
export default commands;
