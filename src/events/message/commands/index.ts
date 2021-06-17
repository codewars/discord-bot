import { Command } from "./types";
export { parse as parseArguments } from "./args";

import ping from "./ping";

const commands: { [k: string]: Command } = {
  ping,
};
export default commands;
