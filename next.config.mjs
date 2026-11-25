/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a test build run without touching the .next folder used by `next dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // libSQL ships native binaries; keep it out of the bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
