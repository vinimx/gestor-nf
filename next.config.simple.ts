import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desabilitar React Strict Mode
  reactStrictMode: false,
  
  // Otimizações para reduzir Fast Refresh
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Configurações de desenvolvimento mais simples
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any, { dev, isServer }) => {
      if (dev && !isServer) {
        // Apenas desabilitar hot reload, manter outros plugins
        config.devServer = {
          ...config.devServer,
          hot: false,
          liveReload: false,
        };
        
        // Configuração de watch básica
        config.watchOptions = {
          poll: false,
          ignored: /node_modules/,
        };
      }
      
      return config;
    },
  }),
};

export default nextConfig;
