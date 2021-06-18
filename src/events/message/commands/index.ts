import { Command } from "./types";
export { parse as parseArguments } from "./args";

import ping from "./ping";
import dump from "./dump";

const commands: { [k: string]: Command } = {
  ping,
  dump,
};
export default commands;
