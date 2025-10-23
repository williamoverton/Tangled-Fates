import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "o93uvkkoj9ljurjj.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withWorkflow(nextConfig);
