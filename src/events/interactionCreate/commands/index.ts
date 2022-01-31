import { Command } from "./types";
import ping from "./dev/ping";
import echo from "./dev/echo";
import warn from "./moderation/warn";

const commands: { [k: string]: Command } = {
  ping,
  echo,
  warn,
};
export default commands;
