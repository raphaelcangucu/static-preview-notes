import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, normalize, resolve, sep } from 'node:path';

const basePath = '/static-preview-notes';
const distDirectory = resolve('dist');
const port = Number.parseInt(process.env.PORT || '4173', 10);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

if (!existsSync(distDirectory)) {
  throw new Error('Missing dist directory. Run npm run build first.');
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

const resolveRequestPath = (requestUrl) => {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);

  if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
    return null;
  }

  const relativePath = pathname.slice(basePath.length).replace(/^\/+/, '') || 'index.html';
  const normalizedPath = normalize(relativePath);
  const absolutePath = resolve(distDirectory, normalizedPath);

  if (
    normalizedPath.startsWith(`..${sep}`) ||
    absolutePath !== distDirectory && !absolutePath.startsWith(`${distDirectory}${sep}`)
  ) {
    return null;
  }

  return absolutePath;
};

const server = createServer((request, response) => {
  const absolutePath = resolveRequestPath(request.url || '/');

  if (
    !absolutePath ||
    !existsSync(absolutePath) ||
    !statSync(absolutePath).isFile()
  ) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'cache-control': 'no-store',
    'content-type': contentTypes[extname(absolutePath)] || 'application/octet-stream',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(absolutePath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static dist server ready at http://127.0.0.1:${port}${basePath}/`);
});
