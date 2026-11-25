/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a test build run without touching the .next folder used by `next dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Server code looks photos up in public/images with fs; on Vercel that folder is not
  // part of the serverless bundle unless it is traced explicitly.
  outputFileTracingIncludes: {
    "/*": ["./public/images/**/*"],
  },
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
