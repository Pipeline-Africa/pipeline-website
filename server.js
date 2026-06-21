const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.txt':  'text/plain',
};

const server = http.createServer((req, res) => {

  // ── POST /waitlist — append email to waitlist.txt ──
  if (req.method === 'POST' && req.url === '/waitlist') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email } = JSON.parse(body);
        const valid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

        if (!valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: false, error: 'Invalid email' }));
        }

        const line = `${new Date().toISOString()}  ${email.trim()}\n`;
        fs.appendFileSync(path.join(__dirname, 'waitlist.txt'), line);
        console.log(`Waitlist signup: ${email.trim()}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Bad request' }));
      }
    });
    return;
  }

  // ── Serve static files ──
  const filePath = path.join(
    __dirname,
    req.url === '/' ? 'index.html' : req.url
  );

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Pipeline Africa running at http://localhost:${PORT}`);
});
