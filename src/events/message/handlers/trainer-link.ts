// Detect direct links to trainer and show adjusted links with some message.
import { Action, Predicate } from "./types";

const PATTERN =
  /https?:\/\/(www\.)?codewars.com\/kata\/[0-9a-f]{24}\/train\/[a-z]+/g;

export const test: Predicate = (message) => PATTERN.test(message.content);

export const action: Action = (message) => {
  const trainerLinks = message.content.match(PATTERN);
  if (!trainerLinks) return;

  // TODO Add some message
  const links = trainerLinks
    .map((s) => "- <" + s.replace(/\/train\/[a-z]+$/, "") + ">")
    .join("\n");
  message.reply(links);
};
