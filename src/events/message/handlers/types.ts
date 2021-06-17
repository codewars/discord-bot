import { Message } from "discord.js";

/// Return true to apply `action` on `message`.
export type Predicate = (message: Message) => boolean;

/// Apply some action to `message`.
export type Action = (message: Message) => void;

/// Handler for 'message' events.
export type OnMessage = {
  /// Return `true` if this handler should be called on the `message`.
  test: Predicate;
  /// Do something on the `message`.
  action: Action;
};
