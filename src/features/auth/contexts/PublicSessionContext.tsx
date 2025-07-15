"use client";

import { createContext, type ReactNode } from "react";
import { type Session } from "next-auth";

// Create a typed context for nullable session data
export const PublicSessionContext = createContext<{ session: Session | null }>({
  session: null,
});

export function PublicSessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <PublicSessionContext.Provider value={{ session }}>
      {children}
    </PublicSessionContext.Provider>
  );
}
