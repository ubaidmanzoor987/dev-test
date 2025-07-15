import { type Session } from "next-auth";
import { useContext } from "react";
import { PublicSessionContext } from "../contexts/PublicSessionContext";

export function useSession(): Session | null {
  const context = useContext(PublicSessionContext);

  if (!context) {
    throw new Error(
      "usePublicSession must be used within a PublicSessionProvider",
    );
  }

  return context.session;
}
