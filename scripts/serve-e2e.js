const http = require('http');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '..');
const distRoot = path.join(repositoryRoot, 'dist');
const fixtureRoot = path.join(repositoryRoot, 'e2e', 'fixtures');
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, contents) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Unable to read file');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(contents);
  });
}

function safePath(root, pathname) {
  const resolvedPath = path.resolve(root, `.${pathname}`);
  return resolvedPath.startsWith(`${root}${path.sep}`) ? resolvedPath : null;
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host}`);

  if (requestUrl.pathname === '/e2e-fixtures/schema.json') {
    sendFile(response, path.join(fixtureRoot, 'schema.json'));
    return;
  }

  const requestedPath = safePath(distRoot, requestUrl.pathname);
  if (requestedPath !== null && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    sendFile(response, requestedPath);
    return;
  }

  // The production app is a client-side router, so unknown document paths use
  // the generated entry point while static assets remain strict file lookups.
  if (!path.extname(requestUrl.pathname)) {
    sendFile(response, path.join(distRoot, 'index.html'));
    return;
  }

  response.writeHead(404);
  response.end('Not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving production build for browser tests at http://127.0.0.1:${port}`);
});
