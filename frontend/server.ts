import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3010;

// vite.config.ts's server.proxy only applies to `npm run dev`. In
// production this file serves the built SPA directly, so without an
// explicit forward here, any /api or /media request falls through to the
// catch-all route below and gets back index.html instead of JSON/an image.
const BACKEND_URL = process.env.REALTY_BACKEND_URL || 'http://localhost:8010';

function proxyToBackend(req: express.Request, res: express.Response) {
  const target = new URL(req.originalUrl, BACKEND_URL);
  const proxyReq = http.request(
    target,
    { method: req.method, headers: req.headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ detail: `Backend unreachable: ${err.message}` }));
  });
  req.pipe(proxyReq, { end: true });
}

app.use('/api', proxyToBackend);
app.use('/media', proxyToBackend);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`PTAH Realty frontend listening on port ${port} (backend: ${BACKEND_URL})`);
});
