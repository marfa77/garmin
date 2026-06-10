/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  output: "export",
  basePath: isGithubPages ? "/garmin" : "",
  assetPrefix: isGithubPages ? "/garmin/" : "",
  trailingSlash: true,
  transpilePackages: ["recharts"],
  images: { unoptimized: true },
};

export default nextConfig;
