 "use client";

import { type Session } from "next-auth";
import { createContext, type ReactNode, useEffect, useRef } from "react";
import { useSSE } from "@/hooks/useSSE";
import type { SessionContextType } from "../types/public";

export const SessionContext = createContext<SessionContextType>({} as SessionContextType);

export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: Session;
}) {
  const sseInitialized = useRef(false);

  // Initialize SSE connection
  const { clientId, isConnected } = useSSE(
    '/api/sse',
    (event, data) => {
      // Handle SSE events
      console.log('SSE event received:', event, data);
    },
    (id) => {
      console.log('SSE Connected:', id);
    },
    (error) => {
      console.error('SSE Error:', error);
    },
    () => {
      console.log('SSE Disconnected');
    }
  );

  // Log connection status changes
  useEffect(() => {
    if (!sseInitialized.current && isConnected) {
      console.log('SSE connection established for user:', session?.user?.id);
      sseInitialized.current = true;
    }
  }, [isConnected, session?.user?.id]);

  return (
    <SessionContext.Provider value={{ session, sseClientId: clientId }}>
      {children}
    </SessionContext.Provider>
  );
}