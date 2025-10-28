import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desabilitar React Strict Mode
  reactStrictMode: false,
  
  // Configurações de desenvolvimento mínimas
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any, { dev, isServer }) => {
      if (dev && !isServer) {
        // Desabilitar completamente Fast Refresh e HMR
        config.devServer = {
          ...config.devServer,
          hot: false,
          liveReload: false,
          webSocketServer: false,
        };
        
        // Remover FastRefreshPlugin
        config.plugins = config.plugins.filter((plugin: any) => {
          const pluginName = plugin.constructor.name;
          return !pluginName.includes('FastRefreshPlugin');
        });
      }
      
      return config;
    },
  }),
};

export default nextConfig;
