import { Command } from "./types";
import ping from "./dev/ping";
import echo from "./dev/echo";

const commands: { [k: string]: Command } = {
  ping,
  echo,
};
export default commands;
