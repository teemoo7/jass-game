import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    supported: {
      "top-level-await": true
    }
  },
  test: {
    globals: true,
    reporters: ["verbose"],
  },
});
