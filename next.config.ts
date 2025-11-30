
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
pathname: '/**',
      },
      {
        protocol: 'https' ,
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Expor variáveis de ambiente para o cliente de forma segura
  env: {
    NEXT_PUBLIC_FB_AK: process.env.FB_AK,
    NEXT_PUBLIC_FB_AD: process.env.FB_AD,
    NEXT_PUBLIC_FB_PID: process.env.FB_PID,
    NEXT_PUBLIC_FB_SB: process.env.FB_SB,
    NEXT_PUBLIC_FB_MSID: process.env.FB_MSID,
    NEXT_PUBLIC_FB_APPID: process.env.FB_APPID,
  },
};

export default nextConfig;
