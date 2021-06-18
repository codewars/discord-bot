import { Message } from "discord.js";

/// Return true to apply `action` on `message`.
export type Predicate = (message: Message) => boolean;

/// Apply some action to `message`. Return `true` if handled and should stop.
export type Action = (message: Message) => boolean;

/// Handler for 'message' events.
export type OnMessage = {
  /// Return `true` if this handler should be called on the `message`.
  test: Predicate;
  /// Do something on the `message`.
  action: Action;
};
