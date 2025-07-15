import type { RouteData } from "@/types/routes";

/**
 * Route Config
 * ---------------------------
 * This file defines the application's route structure and access control.
 * It provides a central registry for all application routes along with
 * their metadata.
 *
 * To add a new route:
 * 1. Add the path constant to the paths object
 * 2. Add the route metadata to the routes object with the same key
 * 3. Specify accessType: "public" (unauthenticated only),
 *                        "protected" (authenticated only),
 *                        "universal" (both)
 *
 * Example:
 * RoutePaths.SETTINGS = "/settings"
 * Routes.SETTINGS = {
 *   name: "Settings Page",
 *   path: RoutePaths.SETTINGS,
 *   accessType: "protected",
 * }
 *
 * @module routes
 */

// ⚠️ DEFINE ROUTES HERE ⚠️
// Ensure every route in the app has an entry here
export const paths = {
  landingPage: "/",
  homePage: "/home",
  reelsUploadPage: "/reels/upload",
} as const;

// ⚠️ DEFINE METADATA FOR NEW ROUTES HERE ⚠️
// Ensure every route in paths has a corresponding entry here
export const routes: Record<keyof typeof paths, RouteData> = {
  landingPage: {
    name: "Landing Page",
    path: paths.landingPage,
    accessType: "public",
  },
  homePage: {
    name: "Home Page",
    path: paths.homePage,
    accessType: "protected",
  },
  reelsUploadPage: {
    name: "Reels Upload Page",
    path: paths.reelsUploadPage,
    accessType: "protected",
  },
};
