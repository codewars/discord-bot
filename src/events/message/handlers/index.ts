import { OnMessage } from "./types";
import * as trainerLink from "./trainer-link";

// Reorder this to control precedence.
const handlers: OnMessage[] = [
  // Detects trainer link
  trainerLink,
];
export default handlers;
