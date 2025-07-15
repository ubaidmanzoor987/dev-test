import type { Session } from "next-auth";

export type SessionContextType = {
  session: Session;
};
