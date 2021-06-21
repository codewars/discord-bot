import { Command } from "./types";
export { parse as parseArguments } from "./args";

import ping from "./dev/ping";
import dump from "./dev/dump";
import introduce from "./help/introduce";

const commands: { [k: string]: Command } = {
  ping,
  dump,
  introduce,
};
export default commands;
