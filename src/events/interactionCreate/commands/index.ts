import { Command } from "./types";
import ping from "./dev/ping";
import echo from "./dev/echo";
import warn from "./moderation/warn";
import introduce from "./help/introduce";
import link from "./help/link";
import rankup from "./fun/rankup";

const commands: { [k: string]: Command } = {
  ping,
  echo,
  warn,
  introduce,
  link,
  rankup,
};
export default commands;
