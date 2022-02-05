import { Command } from "./types";
export { parse as parseArguments } from "./args";

import ping from "./dev/ping";
import dump from "./dev/dump";
import introduce from "./help/introduce";
import warn from "./moderation/warn";
import rankup from "./fun/rankup";

const commands: { [k: string]: Command } = {
  ping,
  dump,
  introduce,
  warn,
  rankup,
};
export default commands;
