import app from '../server.js';

export default function handler(req: any, res: any) {
  if (!req.url.startsWith('/api/')) {
    req.url = '/api/orders' + (req.url === '/' ? '' : req.url);
  }
  return app(req, res);
}
