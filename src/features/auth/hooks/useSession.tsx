"use client";

import { type Session } from "next-auth";
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";

export function useSession(): Session {
  const context = useContext(SessionContext);

  if (!context?.session) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context.session;
}
