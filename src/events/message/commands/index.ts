import { Command } from "./types";
export { parse as parseArguments } from "./args";

import ping from "./dev/ping";
import dump from "./dev/dump";

const commands: { [k: string]: Command } = {
  ping,
  dump,
};
export default commands;
