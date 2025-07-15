/**
 * Public API for the authentication module.
 * This file exports only the components, hooks, utilities and types that should be
 * accessible to other parts of the application.
 */

// Hook for accessing the current authentication session state throughout the application
export { useSession } from "./hooks/useSession";

// Provider component that makes authentication session available to the component tree
export { SessionProvider } from "./contexts/SessionContext";

// Provider for public routes that don't require full authentication context
export { PublicSessionProvider } from "./contexts/PublicSessionContext";

// Server request handlers for authentication endpoints
export { handlers } from "./handlers";

// Authentication actions (login, logout, registration, etc.)
export * from "./actions/auth-actions";

// Utility functions for route protection and navigation
export * from "./utils/route-utils"; // isPublicRoute, isPrivateRoute, etc.

// Public types that other modules may need when working with the auth module
export * from "./types/public";
