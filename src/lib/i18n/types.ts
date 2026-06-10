import type { en } from "./en";

export type Locale = "en" | "ru";

type DeepString<T> = T extends string
  ? string
  : T extends Record<string, unknown>
    ? { [K in keyof T]: DeepString<T[K]> }
    : T;

/** Same nested shape as `en`; all leaf strings may differ per locale. */
export type Dictionary = DeepString<typeof en>;
