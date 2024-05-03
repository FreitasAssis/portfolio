/** @type {import('next').NextConfig} */
import dotenv from 'dotenv';

dotenv.config();
const nextConfig = {
    env: {
        FORMSPREE_ENDPOINT: process.env.FORMSPREE_ENDPOINT,
      },
};

export default nextConfig;
