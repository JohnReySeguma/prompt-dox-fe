import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Google OAuth client ID is public (it appears in every sign-in URL). The browser
  // needs it to get a fresh ID token when linking Google from the profile page.
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "",
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
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
