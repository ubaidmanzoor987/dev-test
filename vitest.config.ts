import { join } from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// We need this hack to load env vars in tests
import pkg from "@next/env";
const { loadEnvConfig } = pkg;

export default defineConfig(() => {
  loadEnvConfig(process.cwd());

  return {
    // Shared configuration
    resolve: {
      alias: {
        "@": join(__dirname, "./src/"),
      },
    },
    test: {
      reporters: ["default"],
      logHeapUsage: false,
      silent: true,
      projects: [
        // Browser/React tests configuration
        {
          plugins: [react(), tsconfigPaths()],
          test: {
            name: "browser",
            environment: "jsdom",
            exclude: [
              "**/*.node.test.{ts,tsx,js,jsx}", // Exclude node-specific test files
              "**/node_modules/**",
            ],
            setupFiles: ["./src/test/setup.ts"],
          },
        },

        // Node.js tests configuration
        {
          plugins: [tsconfigPaths()],
          test: {
            name: "node",
            environment: "node",
            include: ["**/*.node.test.{ts,tsx,js,jsx}"], // Only include node-specific test files
            exclude: ["**/node_modules/**"],
            server: {
              deps: {
                inline: ["next"],
              },
            },
          },
        },
      ],
    },
  };
});
