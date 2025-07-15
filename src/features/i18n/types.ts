import type { Namespace } from "i18next";

export type $Tuple<T> = readonly [T?, ...T[]];
export type $FirstNamespace<Ns extends Namespace> =
  Ns extends readonly unknown[] ? Ns[0] : Ns;
