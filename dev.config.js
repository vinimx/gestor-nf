// Configuração personalizada para desenvolvimento sem Fast Refresh
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ 
  dev, 
  hostname, 
  port,
  // Desabilitar Fast Refresh completamente
  conf: {
    reactStrictMode: false,
    experimental: {
      optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    },
  }
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.listen(port, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> Fast Refresh: DISABLED');
    console.log('> HMR: DISABLED');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      process.exit(0);
    });
  });
});
