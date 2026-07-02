import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "babymoney",
  brand: {
    displayName: "아기머니",
    primaryColor: "#3182F6",
    icon: "https://static.toss.im/appsintoss/51145/ed933c4c-4a61-48aa-9052-b2d620e5cc8c.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
