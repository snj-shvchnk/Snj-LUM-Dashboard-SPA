import { createProxyMiddleware } from 'http-proxy-middleware';

// Snj: on local machine, set up API enpoint heare
export default function(app) {
  app.use(
    '/api/',
    createProxyMiddleware({
      target: '//localhost/api/',
      changeOrigin: true,
    })
  );
};