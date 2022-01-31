import { Command } from "./types";
import ping from "./dev/ping";
import echo from "./dev/echo";
import warn from "./moderation/warn";
import introduce from "./help/introduce";
import link from "./help/link";

const commands: { [k: string]: Command } = {
  ping,
  echo,
  warn,
  introduce,
  link,
};
export default commands;
