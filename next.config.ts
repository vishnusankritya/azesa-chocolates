import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // PGlite uses nodefs via import.meta.url; keep it unbundled so it works in dev.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;