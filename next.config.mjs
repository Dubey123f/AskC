// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
CLERK_SECRET_KEY:process.env.CLERK_SECRET_KEY,
      STREAM_API_KEY: process.env.STREAM_API_KEY,
      STREAM_API_SECRET: process.env.STREAM_API_SECRET,
    },
  };
  
  export default nextConfig;