import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Dev-only font picker, injected into index.html when served locally.
// Lets you flip the display typeface live on the real site. Never deployed:
// production serves the static file directly, bypassing this server.
const FONT_PICKER = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..600&family=DM+Serif+Display:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&family=Lora:ital,wght@0,400..700;1,400..700&display=swap">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=zodiak@400,401,500,501&display=swap">
<style id="dev-font-style"></style>
<div id="dev-font-picker" style="position:fixed;bottom:16px;left:16px;z-index:9999;background:#fff;border:1px solid #d8d3c8;border-radius:10px;padding:12px 16px 14px;font:12px/2 system-ui,sans-serif;color:#333;box-shadow:0 6px 24px rgba(0,0,0,0.14);max-height:70vh;overflow:auto;">
  <div style="font-weight:600;letter-spacing:0.04em;font-size:10px;text-transform:uppercase;color:#888;margin-bottom:6px;">Dev &mdash; headline font</div>
</div>
<script>
(function () {
  var FONTS = [
    { name: 'Cormorant Garamond (current)', family: null },
    { name: 'Zodiak', family: 'Zodiak', big: 500, mid: 500 },
    { name: 'Newsreader', family: 'Newsreader', big: 500, mid: 500 },
    { name: 'Playfair Display', family: 'Playfair Display', big: 500, mid: 500 },
    { name: 'Source Serif 4', family: 'Source Serif 4', big: 600, mid: 500 },
    { name: 'Lora', family: 'Lora', big: 600, mid: 500 },
    { name: 'DM Serif Display', family: 'DM Serif Display', big: 400, mid: 400 },
    { name: 'Instrument Serif', family: 'Instrument Serif', big: 400, mid: 400 },
    { name: 'Fraunces', family: 'Fraunces', big: 500, mid: 500 }
  ];
  var SEL = ['.hero-h1', '.s-head .label:not(.label--small)', '.position-sidebar .label',
    '.nav-name', '.position-quote', '.position-quad-h', '.work-n', '.work-title', '.ai-h2',
    '.t-quote', '.t-name', '.about-h2', '.contact-h2', '.proj-hashtag', '.proj-title'];
  var styleEl = document.getElementById('dev-font-style');
  var panel = document.getElementById('dev-font-picker');

  function apply(font) {
    if (!font.family) { styleEl.textContent = ''; return; }
    styleEl.textContent =
      SEL.join(',') + "{font-family:'" + font.family + "',Georgia,serif !important;}" +
      '.hero-h1{font-weight:' + font.big + ' !important;}' +
      '.s-head .label:not(.label--small),.position-sidebar .label,.ai-h2,.about-h2,' +
      '.contact-h2,.nav-name,.position-quad-h,.work-title,.t-name,.proj-title' +
      '{font-weight:' + font.mid + ' !important;}' +
      '.position-quote,.t-quote,.proj-hashtag,.work-n{font-weight:400 !important;}';
  }

  var saved = localStorage.getItem('devFont');
  FONTS.forEach(function (font) {
    var row = document.createElement('label');
    row.style.cssText = 'display:block;cursor:pointer;white-space:nowrap;';
    var radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'devfont';
    radio.style.marginRight = '7px';
    radio.checked = saved ? saved === font.name : !font.family;
    radio.addEventListener('change', function () {
      apply(font);
      localStorage.setItem('devFont', font.name);
    });
    row.appendChild(radio);
    row.appendChild(document.createTextNode(font.name));
    panel.appendChild(row);
    if (radio.checked) apply(font);
  });
})();
</script>
`;

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${urlPath}`);
      return;
    }
    if (urlPath === '/index.html') {
      const html = data.toString().replace('</body>', FONT_PICKER + '</body>');
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(html);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
