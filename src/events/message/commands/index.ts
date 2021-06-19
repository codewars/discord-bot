import { Command } from "./types";
export { parse as parseArguments } from "./args";

import ping from "./dev/ping";
import dump from "./dev/dump";
import solveintro from "./general/solveintro";

const commands: { [k: string]: Command } = {
  ping,
  dump,
  solveintro,
};
export default commands;
