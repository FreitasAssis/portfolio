/** @type {import('next').NextConfig} */
import dotenv from 'dotenv';

dotenv.config();
const nextConfig = {
    env: {
        FORMSPREE_ENDPOINT: process.env.FORMSPREE_ENDPOINT,
        ADD_TESTIMONIAL_URL: process.env.ADD_TESTIMONIAL_URL,
        GET_TESTIMONIALS_URL: process.env.GET_TESTIMONIALS_URL,
      },
};

export default nextConfig;
