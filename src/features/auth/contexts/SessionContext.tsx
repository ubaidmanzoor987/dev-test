"use client";

import { createContext, type ReactNode } from "react";
import { type Session } from "next-auth";
import type { SessionContextType } from "../types/public";

// Create a typed context for non-nullable session data
export const SessionContext = createContext<SessionContextType>(
  {} as SessionContextType,
);

export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: Session;
}) {
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}
