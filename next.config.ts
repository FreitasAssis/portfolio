import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // redirects() não é suportado em output: 'export'.
  // Os 301 das rotas antigas vivem em public/_redirects (§10.1 do brief).
};

export default nextConfig;
