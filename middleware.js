// Vercel Routing Middleware — password gate for /dyc-showcase/
// The password itself is NOT stored here. On login we derive a secret with
// PBKDF2(password) and compare SHA-256(secret) to VERIFY_HASH; the secret is
// then kept in an HttpOnly cookie, so the hash below alone can't forge access.

const BASE = '/dyc-showcase/';
const COOKIE = 'dyc_showcase';
const SALT = 'dyc-showcase-gate-2026';
const ITERATIONS = 200000;
const VERIFY_HASH = 'e6575c92c856c0d817586e9cfe0cb87c8607ec0327b973b278ef51c60367fc23';
const OPEN_FILES = /\/dyc-showcase\/(manifest\.webmanifest|icon-\d+\.png)$/;

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function sha256(str) {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(str)));
}

async function deriveSecret(password) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(SALT), iterations: ITERATIONS },
    key,
    256,
  );
  return hex(bits);
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

async function isAuthorized(request) {
  const secret = readCookie(request, COOKIE);
  if (!secret || !/^[0-9a-f]{64}$/.test(secret)) return false;
  return (await sha256(secret)) === VERIFY_HASH;
}

const passThrough = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

function loginPage(showError) {
  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0E1A0C">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="DYC Showcase">
<link rel="apple-touch-icon" href="${BASE}icon-180.png">
<link rel="manifest" href="${BASE}manifest.webmanifest">
<title>Divine Yagé Church</title>
<style>
  html,body{height:100%;margin:0}
  body{display:flex;align-items:center;justify-content:center;background:#0E1A0C;color:#F3EFE4;
       font:17px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;padding:24px;box-sizing:border-box}
  form{width:100%;max-width:360px;text-align:center}
  h1{font-weight:500;font-size:22px;letter-spacing:.01em;margin:0 0 6px}
  p{margin:0 0 22px;color:#B9C4B0;font-size:15px}
  input{width:100%;box-sizing:border-box;font-size:18px;padding:14px 16px;border-radius:12px;border:1px solid #33452F;
        background:#16241A;color:#F3EFE4;outline:none;text-align:center;letter-spacing:.06em}
  input:focus{border-color:#8FB07E}
  button{margin-top:14px;width:100%;font-size:17px;padding:14px;border-radius:12px;border:0;background:#8FB07E;color:#0E1A0C;font-weight:600}
  .err{color:#E8A88A;font-size:14px;margin:12px 0 0;min-height:1.2em}
</style></head><body>
<form method="post" action="${BASE}" autocomplete="off">
  <h1>Divine Yagé Church</h1>
  <p>Your Generosity at Work</p>
  <input type="password" name="password" placeholder="Password" autofocus required autocapitalize="off" autocorrect="off" spellcheck="false">
  <button type="submit">Enter</button>
  <div class="err">${showError ? 'That password isn’t right — try again.' : ''}</div>
</form>
</body></html>`;
  return new Response(html, {
    status: 401,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  if (OPEN_FILES.test(url.pathname)) return passThrough();
  if (await isAuthorized(request)) return passThrough();

  if (request.method === 'POST') {
    let password = '';
    try {
      const form = await request.formData();
      password = String(form.get('password') || '');
    } catch (_) {}
    if (password) {
      const secret = await deriveSecret(password);
      if ((await sha256(secret)) === VERIFY_HASH) {
        return new Response(null, {
          status: 303,
          headers: {
            location: BASE,
            'set-cookie': `${COOKIE}=${secret}; Path=/dyc-showcase; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`,
            'cache-control': 'no-store',
          },
        });
      }
    }
    return loginPage(true);
  }
  return loginPage(false);
}

export const config = {
  matcher: ['/dyc-showcase', '/dyc-showcase/:path*'],
};
