import type { paths } from "@/config/routes";

/**
 * Represents a valid route path string in the application.
 * This type ensures that only paths defined in the routes config are used.
 * Example: "/home", "/settings", "/profile"
 */
export type RoutePath = (typeof paths)[keyof typeof paths];

/**
 * Represents a valid route key in the application.
 * These are the property names from the paths object.
 * Example: "homePage", "settingsPage", "profilePage"
 */
export type RouteKey = keyof typeof paths;

/**
 * Defines the access control level for a route.
 * - "public": Only accessible when NOT authenticated (login, signup)
 * - "protected": Only accessible when authenticated (dashboard, settings)
 * - "universal": Accessible regardless of authentication status (landing, about)
 */
export type RouteAccessType = "public" | "protected" | "universal";

/**
 * Metadata for a single route in the application.
 * Contains all the information needed to handle navigation and access control.
 */
export type RouteData = {
  /** User-friendly name of the route (for display in UI) */
  name: string;

  /** URL path for the route (starts with slash) */
  path: string;

  /** Access control requirement for this route */
  accessType: RouteAccessType;
};
