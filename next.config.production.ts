import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração de produção para desenvolvimento
  reactStrictMode: false,
  
  // Desabilitar Fast Refresh completamente
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Configurações de desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any, { dev, isServer }) => {
      if (dev && !isServer) {
        // Desabilitar HMR completamente
        config.optimization = {
          ...config.optimization,
          moduleIds: 'deterministic',
        };
        
        // Desabilitar Fast Refresh
        config.devServer = {
          ...config.devServer,
          hot: false,
          liveReload: false,
        };
        
        // Desabilitar watch mode
        config.watchOptions = {
          poll: false,
          ignored: /node_modules/,
          aggregateTimeout: 0,
        };
        
        // Remover plugins de Fast Refresh
        config.plugins = config.plugins.filter((plugin: any) => {
          const pluginName = plugin.constructor.name;
          return !pluginName.includes('FastRefreshPlugin') &&
                 !pluginName.includes('HotModuleReplacementPlugin') &&
                 !pluginName.includes('ReactRefreshPlugin');
        });
        
        // Desabilitar Fast Refresh no entry
        if (config.entry && typeof config.entry === 'object') {
          Object.keys(config.entry).forEach(key => {
            if (Array.isArray(config.entry[key])) {
              config.entry[key] = config.entry[key].filter((entry: string) => 
                !entry.includes('fast-refresh') && 
                !entry.includes('hot-reloader') &&
                !entry.includes('react-refresh')
              );
            }
          });
        }
        
        // Desabilitar Fast Refresh no resolve
        if (config.resolve && config.resolve.alias) {
          config.resolve.alias = {
            ...config.resolve.alias,
            'react-refresh': false,
            'fast-refresh': false,
          };
        }
      }
      
      return config;
    },
  }),
};

export default nextConfig;
