import app from '../server.js';

export default function handler(req: any, res: any) {
  if (!req.url.startsWith('/api/')) {
    req.url = '/api/products' + (req.url === '/' ? '' : req.url);
  }
  return app(req, res);
}
