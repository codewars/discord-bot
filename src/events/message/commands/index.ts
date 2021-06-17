import { Command } from "./types";

import ping from "./ping";

const commands: { [k: string]: Command } = {
  ping,
};
export default commands;
