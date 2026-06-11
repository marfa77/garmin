/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  ...(isGithubPages ? { output: "export" } : {}),
  basePath: isGithubPages ? "/garmin" : "",
  assetPrefix: isGithubPages ? "/garmin/" : "",
  trailingSlash: true,
  transpilePackages: ["recharts"],
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/garmin" : "",
    NEXT_PUBLIC_GITHUB_ACTIONS_SYNC_URL: isGithubPages
      ? "https://github.com/marfa77/garmin/actions/workflows/sync-data.yml"
      : "",
  },
};

export default nextConfig;
