# Theme Switcher (Paper / Terminal / Studio) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A three-way nav selector that swaps the whole site among three complete design personalities (Paper = current editorial, Terminal = mono noir, Studio = bold grotesk daylight) with persistence and zero content changes.

**Architecture:** `data-theme` attribute on `<html>` is the only switch. The existing CSS is the Paper theme and must not change visually. Terminal and Studio are override blocks appended to the `<style>` in `index.html`: each first re-declares the CSS custom properties (`--bg`, `--ink-*`, `--brand`, `--f-*`), then adds ~30 structural rules. A FOUC-guard script in `<head>` applies the saved theme before paint; chip buttons in the nav set + persist it.

**Tech Stack:** Static `index.html` (all inline CSS/JS), Google Fonts, Puppeteer screenshots via `node screenshot.mjs` and the scratchpad `shot-clip.mjs` helper. Dev server: `PORT=3210 node serve.mjs` (port 3000 often shadowed by Open WebUI). Verification is visual — no unit test framework exists; every task ends with screenshots read via the Read tool.

**Spec:** `docs/superpowers/specs/2026-09-17-theme-switcher-design.md`. Reference mockups render at `.superpowers/brainstorm/74396-1789698007/content/builder-aesthetic-v2.html` (open via the brainstorm server or directly in a browser).

**Ground rules for every task:**
- Work on `main` (established project pattern; site deploys from `main` via Vercel git integration).
- NEVER `git add -A` — the working tree holds Robert's unrelated in-flight files (`middleware.js`, `api/`, `dyc-showcase/*`). Stage only files you touched, by name.
- After every commit, do NOT push until the final task.
- Baseline screenshots to compare against live in `temporary screenshots/` (numbering auto-increments).

---

### Task 1: Icons to `currentColor` + Paper regression baseline

The inline SVG icons hardcode `#4A80AA` (63 occurrences: `stroke="#4A80AA"` and `fill="#4A80AA"`). Themes need to recolor them with one rule. Note `#4A80AA` is NOT `var(--brand)` (brand is `hsl(205,44%,35%)` ≈ `#32678F`), so the base rule must use the literal color to keep Paper identical.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Capture Paper baseline screenshots (pre-change)**

```bash
cd /Users/ram/Documents/Websites/RobertMacNaughton.com-site
curl -s -o /dev/null -w '%{http_code}' http://localhost:3210 || (PORT=3210 nohup node serve.mjs >/dev/null 2>&1 & sleep 1)
node screenshot.mjs http://localhost:3210 paper-baseline
```
Expected: `Screenshot saved: .../screenshot-N-paper-baseline.png`

- [ ] **Step 2: Replace the hardcoded icon color**

```bash
python3 - <<'EOF'
src = open('index.html').read()
n = src.count('#4A80AA')
assert n == 63, f"expected 63 occurrences, found {n}"
src = src.replace('stroke="#4A80AA"', 'stroke="currentColor"').replace('fill="#4A80AA"', 'fill="currentColor"')
assert src.count('#4A80AA') == 0
old = """    .quad-icon {
      display: block;
      margin-bottom: 24px;
      flex-shrink: 0;
    }"""
new = """    .quad-icon {
      display: block;
      margin-bottom: 24px;
      flex-shrink: 0;
      color: #4A80AA; /* icon ink; themes override */
    }"""
assert old in src
src = src.replace(old, new)
open('index.html','w').write(src)
print('ok')
EOF
```
Expected: `ok`. (`.offer-icon` elements also carry class `quad-icon`, so one rule covers both.)

- [ ] **Step 3: Screenshot and compare against baseline**

```bash
node screenshot.mjs http://localhost:3210 paper-after-currentcolor
```
Read both PNGs with the Read tool. The quadrant icons (The Work section) and offer-card icons must be identical in color to the baseline. Any color shift = the base rule is missing or wrong.

- [ ] **Step 4: Commit**

```bash
git add index.html && git commit -m "Refactor icon SVGs to currentColor (no visual change)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Fonts, FOUC guard, fade infrastructure

**Files:**
- Modify: `index.html` (head, line ~12 font link; `<style>` end)

- [ ] **Step 1: Extend the Google Fonts link**

Replace (line ~12):
```html
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Raleway:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
with:
```html
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Raleway:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600;700&family=Inter:wght@400;700;800;900&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add the FOUC guard immediately after the font `<link>`**

```html
  <script>
    /* Apply saved theme before first paint */
    try {
      var __t = localStorage.getItem('siteTheme');
      if (__t === 'terminal' || __t === 'studio') document.documentElement.setAttribute('data-theme', __t);
    } catch (e) {}
  </script>
```

- [ ] **Step 3: Add the fade rule at the end of the main `<style>` block (before `</style>`)**

```css
    /* ================================================
       THEME SWITCH — fade (opacity only)
       ================================================ */
    body { transition: opacity 0.15s ease; }
    body.theme-fading { opacity: 0; }
```

- [ ] **Step 4: Verify no visual change and no console errors**

```bash
node screenshot.mjs http://localhost:3210 paper-after-infra
```
Compare with Task 1 baseline via Read tool: identical. Also `curl -s http://localhost:3210 | grep -c 'siteTheme'` → `1`.

- [ ] **Step 5: Commit**

```bash
git add index.html && git commit -m "Add theme fonts, FOUC guard, and fade infrastructure

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Selector chips (markup, base CSS, JS)

**Files:**
- Modify: `index.html` (nav markup ~line 1289; `<style>`; bottom `<script>`)

- [ ] **Step 1: Insert chips into `.nav-right`**

Replace:
```html
        <div class="nav-right">
          <a href="#right-relationship" class="nav-link">#RightRelationshipwithAI</a>
```
with:
```html
        <div class="nav-right">
          <div class="theme-switch" role="group" aria-label="Site theme">
            <button type="button" class="theme-chip" data-theme="paper" aria-pressed="true"><span class="tch-full">Paper</span><span class="tch-init">P</span></button>
            <button type="button" class="theme-chip" data-theme="terminal" aria-pressed="false"><span class="tch-full">Terminal</span><span class="tch-init">T</span></button>
            <button type="button" class="theme-chip" data-theme="studio" aria-pressed="false"><span class="tch-full">Studio</span><span class="tch-init">S</span></button>
          </div>
          <a href="#right-relationship" class="nav-link">#RightRelationshipwithAI</a>
```
(Do NOT reuse class prefixes `tc-` — `.tc-src`/`.tc-d` belong to the Trainings icon.)

- [ ] **Step 2: Add chip CSS at the end of the main `<style>` (after the fade rules)**

```css
    .theme-switch {
      display: flex;
      gap: 6px;
    }
    .theme-chip {
      font-family: var(--f-label);
      font-size: 0.5625rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink-muted);
      background: transparent;
      border: 1px solid var(--rule);
      padding: 5px 10px;
      cursor: pointer;
      transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
    }
    .theme-chip:hover { color: var(--brand); border-color: var(--brand); }
    .theme-chip:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
    .theme-chip:active { transform: translateY(1px); }
    .theme-chip[aria-pressed="true"] {
      background: var(--brand);
      border-color: var(--brand);
      color: #FFFFFF;
    }
    .tch-init { display: none; }
    @media (max-width: 640px) {
      .tch-full { display: none; }
      .tch-init { display: inline; }
      .theme-chip { padding: 5px 8px; }
    }
```

- [ ] **Step 3: Add switch JS inside the existing bottom `<script>` IIFE (before its closing `})();`)**

```js
      /* ── Theme switcher ── */
      var THEME_KEY = 'siteTheme';
      var chips = document.querySelectorAll('.theme-chip');
      function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        chips.forEach(function (c) {
          c.setAttribute('aria-pressed', String(c.getAttribute('data-theme') === t));
        });
      }
      var savedTheme = null;
      try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
      applyTheme(savedTheme === 'terminal' || savedTheme === 'studio' ? savedTheme : 'paper');
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var t = chip.getAttribute('data-theme');
          if (document.documentElement.getAttribute('data-theme') === t) return;
          document.body.classList.add('theme-fading');
          setTimeout(function () {
            applyTheme(t);
            try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
            requestAnimationFrame(function () {
              document.body.classList.remove('theme-fading');
            });
          }, 150);
        });
      });
```

- [ ] **Step 4: Verify chips render and switching sets the attribute**

```bash
node screenshot.mjs http://localhost:3210 chips
node - <<'EOF'
const { createRequire } = require('module');
const require2 = createRequire('/Users/ram/Documents/Websites/RobertMacNaughton.com-site/');
const puppeteer = require2('puppeteer');
(async () => {
  const b = await puppeteer.launch({headless:true,args:['--no-sandbox']});
  const p = await b.newPage();
  await p.goto('http://localhost:3210', {waitUntil:'networkidle2'});
  await p.click('.theme-chip[data-theme="terminal"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('attr:', await p.evaluate(() => document.documentElement.getAttribute('data-theme')));
  await p.reload({waitUntil:'networkidle2'});
  console.log('persisted:', await p.evaluate(() => document.documentElement.getAttribute('data-theme')));
  await b.close();
})();
EOF
```
Expected output: `attr: terminal` then `persisted: terminal`. Screenshot shows three chips in nav with PAPER filled, no layout break.

- [ ] **Step 5: Commit**

```bash
git add index.html && git commit -m "Add Paper/Terminal/Studio selector chips with persistence

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Terminal theme

**Files:**
- Modify: `index.html` (append a clearly-commented override block at the end of the main `<style>`)

- [ ] **Step 1: Append the Terminal block**

```css
    /* ================================================
       THEME: TERMINAL
       ================================================ */
    html[data-theme="terminal"] {
      --brand:        #5FA8E0;
      --brand-hover:  #82BCE8;
      --brand-mid:    #41586E;
      --brand-light:  #1A2635;
      --ink-00:   #F2F5FA;
      --ink-dark: #E8ECF2;
      --ink-mid:  #B9C2CF;
      --ink-muted:#8A97AB;
      --ink-light:#5F708A;
      --ink-faint:#465468;
      --bg:      #0B0E12;
      --surface: #10151C;
      --rule:    #223046;
      --f-display: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
      --f-label:   'IBM Plex Mono', ui-monospace, Menlo, monospace;
      --f-body:    'IBM Plex Mono', ui-monospace, Menlo, monospace;
    }
    html[data-theme="terminal"] .quad-icon { color: var(--brand); }
    html[data-theme="terminal"] body { line-height: 1.65; }

    /* type voice */
    html[data-theme="terminal"] .hero-h1 {
      font-weight: 700;
      font-size: clamp(2.25rem, 4.2vw, 4.25rem);
      letter-spacing: -0.02em;
    }
    html[data-theme="terminal"] .hero-h1 em { font-style: normal; }
    html[data-theme="terminal"] .hero-h1::after {
      content: '';
      display: inline-block;
      width: 0.5em; height: 1em;
      background: var(--brand);
      margin-left: 0.15em;
      vertical-align: -0.1em;
      animation: cursor-blink 1.1s steps(1) infinite;
    }
    @keyframes cursor-blink { 50% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      html[data-theme="terminal"] .hero-h1::after { animation: none; }
    }

    /* // section markers */
    html[data-theme="terminal"] .label::before,
    html[data-theme="terminal"] .hero-eyebrow::before,
    html[data-theme="terminal"] .ai-eyebrow::before {
      content: '// ';
      color: var(--brand);
    }
    html[data-theme="terminal"] .s-head .label:not(.label--small),
    html[data-theme="terminal"] .position-sidebar .label {
      font-weight: 700;
      font-size: clamp(1.5rem, 2.6vw, 2.25rem);
      letter-spacing: 0;
    }

    /* hero: engineering grid + photo treatment */
    html[data-theme="terminal"] .hero {
      background-image:
        linear-gradient(rgba(95,168,224,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(95,168,224,0.05) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    html[data-theme="terminal"] .hero-right img,
    html[data-theme="terminal"] .about-portrait img {
      filter: grayscale(1) contrast(1.08) brightness(0.92);
    }
    html[data-theme="terminal"] .hero-right::after,
    html[data-theme="terminal"] .about-portrait::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(95,168,224,0.14);
      mix-blend-mode: color;
      pointer-events: none;
    }
    html[data-theme="terminal"] .proj-img img {
      filter: grayscale(0.85) contrast(1.05);
    }

    /* buttons / links */
    html[data-theme="terminal"] .nav-cta,
    html[data-theme="terminal"] .hero-link {
      border: 1px solid var(--rule);
      padding: 8px 14px;
      color: var(--brand);
    }
    html[data-theme="terminal"] .theme-chip[aria-pressed="true"] { color: #0B0E12; }

    /* logos strip: invert dark marks for dark ground */
    html[data-theme="terminal"] .client-logo { filter: invert(1) grayscale(1) opacity(0.5); }

    /* cards: panels with hairlines (surface/rule vars do most of it) */
    html[data-theme="terminal"] .position-compact-item:hover,
    html[data-theme="terminal"] .offer-card:hover {
      background: #131A24;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    html[data-theme="terminal"] .proj-card,
    html[data-theme="terminal"] .t-card {
      border: 1px solid var(--rule);
    }
    html[data-theme="terminal"] .proj-img--logo { background: #131A24; }
```
Adjust selectors on sight if a rule misses (e.g., `.t-card` class name should be confirmed by grep before writing).

- [ ] **Step 2: Screenshot Terminal (full page + hero close-up), two comparison rounds vs mockup**

```bash
S="/private/tmp/claude-501/-Users-ram-Documents-Websites-RobertMacNaughton-com-site/87103410-3998-48a0-b241-8cf018d80210/scratchpad/shot-clip.mjs"
# force theme for the screenshot by clicking the chip:
# simplest: temporarily seed localStorage via evaluateOnNewDocument in a variant of shot-clip,
# or click the chip after load. Add to shot-clip a THEME env: if set, click chip and wait 500ms.
```
Modify scratchpad `shot-clip.mjs`: after `page.goto`, add
```js
if (process.env.THEME) {
  await page.click(`.theme-chip[data-theme="${process.env.THEME}"]`);
  await new Promise(r => setTimeout(r, 600));
}
```
Then:
```bash
THEME=terminal node "$S" http://localhost:3210 "temporary screenshots/screenshot-N-terminal-hero.png" 0
THEME=terminal node "$S" http://localhost:3210 "temporary screenshots/screenshot-N-terminal-offers.png" 2400
THEME=terminal node "$S" http://localhost:3210 "temporary screenshots/screenshot-N-terminal-projects.png" 5400
```
Read each. Compare hero against the Terminal-Noir mockup card: dark ground, grid, mono headline, cursor, `//` markers, accent #5FA8E0. Fix mismatches, re-screenshot (minimum 2 rounds). Watch for: unreadable creds bar, logo strip legibility, testimonial headshot treatment, footer.

- [ ] **Step 3: Commit**

```bash
git add index.html && git commit -m "Add Terminal theme

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Studio theme

**Files:**
- Modify: `index.html` (append after Terminal block)

- [ ] **Step 1: Append the Studio block**

```css
    /* ================================================
       THEME: STUDIO
       ================================================ */
    html[data-theme="studio"] {
      --brand:        #0A0A0A;
      --brand-hover:  #333333;
      --brand-mid:    #777777;
      --brand-light:  #EDEDED;
      --ink-00:   #000000;
      --ink-dark: #0A0A0A;
      --ink-mid:  #333333;
      --ink-muted:#555555;
      --ink-light:#8A8A8A;
      --ink-faint:#B5B5B5;
      --bg:      #FFFFFF;
      --surface: #FAFAFA;
      --rule:    #EAEAEA;
      --f-display: 'Inter', system-ui, sans-serif;
      --f-label:   'Inter', system-ui, sans-serif;
      --f-body:    'Inter', system-ui, sans-serif;
    }
    html[data-theme="studio"] .quad-icon { color: #0A0A0A; }

    /* type voice: massive, tight, heavy */
    html[data-theme="studio"] .hero-h1 {
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 0.98;
    }
    html[data-theme="studio"] .hero-h1 em {
      font-style: normal;
      color: #2E6FA3; /* the single permitted blue moment */
    }
    html[data-theme="studio"] .s-head .label:not(.label--small),
    html[data-theme="studio"] .position-sidebar .label,
    html[data-theme="studio"] .ai-h2,
    html[data-theme="studio"] .about-h2,
    html[data-theme="studio"] .contact-h2 {
      font-weight: 800;
      letter-spacing: -0.03em;
    }
    html[data-theme="studio"] .work-title,
    html[data-theme="studio"] .proj-title,
    html[data-theme="studio"] .t-name,
    html[data-theme="studio"] .position-quad-h,
    html[data-theme="studio"] .nav-name { font-weight: 800; letter-spacing: -0.02em; }
    html[data-theme="studio"] body { line-height: 1.6; }

    /* mono code-comment section markers */
    html[data-theme="studio"] .label,
    html[data-theme="studio"] .hero-eyebrow,
    html[data-theme="studio"] .ai-eyebrow {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      text-transform: lowercase;
      letter-spacing: 0.02em;
      color: #999999;
    }
    html[data-theme="studio"] .label::before,
    html[data-theme="studio"] .hero-eyebrow::before,
    html[data-theme="studio"] .ai-eyebrow::before { content: '// '; }

    /* pills */
    html[data-theme="studio"] .nav-cta,
    html[data-theme="studio"] .hero-link {
      background: #0A0A0A;
      color: #FFFFFF;
      border: none;
      border-radius: 999px;
      padding: 10px 20px;
    }
    html[data-theme="studio"] .theme-chip { border-radius: 999px; }
    html[data-theme="studio"] .theme-chip[aria-pressed="true"] { color: #FFFFFF; }

    /* cards: flat white, hairline, soft radius */
    html[data-theme="studio"] .offer-card,
    html[data-theme="studio"] .position-compact-item,
    html[data-theme="studio"] .t-card,
    html[data-theme="studio"] .proj-card {
      background: #FFFFFF;
      border: 1px solid #EAEAEA;
      border-radius: 16px;
      overflow: hidden;
    }
    html[data-theme="studio"] .offer-card:hover,
    html[data-theme="studio"] .position-compact-item:hover {
      background: #FFFFFF;
      box-shadow: 0 14px 40px rgba(0,0,0,0.08);
    }

    /* photos untreated */
    html[data-theme="studio"] .hero-right::before,
    html[data-theme="studio"] .about-portrait::after { display: none; }
    html[data-theme="studio"] .hero-right img,
    html[data-theme="studio"] .about-portrait img { filter: none; }
```
Same caveat: grep-confirm `.t-card` etc. before finalizing; adjust on sight.

- [ ] **Step 2: Screenshot Studio, two rounds vs the Grotesk-Daylight mockup**

```bash
THEME=studio node "$S" http://localhost:3210 "temporary screenshots/screenshot-N-studio-hero.png" 0
THEME=studio node "$S" http://localhost:3210 "temporary screenshots/screenshot-N-studio-offers.png" 2400
THEME=studio node "$S" http://localhost:3210 "temporary screenshots/screenshot-N-studio-projects.png" 5400
```
Check: heavy tight headline, lowercase mono markers, black pills, rounded hairline cards, full-color photos. Iterate ≥2 rounds.

- [ ] **Step 3: Commit**

```bash
git add index.html && git commit -m "Add Studio theme

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Cross-theme verification matrix + mobile + regression

**Files:**
- Modify: `index.html` (fixes only, as found)

- [ ] **Step 1: Paper regression check**

```bash
node screenshot.mjs http://localhost:3210 paper-final
```
Compare against Task 1 baseline with the Read tool. Paper must be pixel-identical (chips in nav are the ONLY permitted difference).

- [ ] **Step 2: Mobile matrix**

```bash
VW=430 VH=930 THEME=terminal node "$S" http://localhost:3210 "temporary screenshots/screenshot-N-terminal-mobile.png" 0
VW=430 VH=930 THEME=studio  node "$S" http://localhost:3210 "temporary screenshots/screenshot-N-studio-mobile.png" 0
VW=430 VH=930 node "$S" http://localhost:3210 "temporary screenshots/screenshot-N-paper-mobile.png" 0
```
Check: chips show P · T · S initials; Terminal headline fits at mobile clamp; Studio pills don't overflow nav.

- [ ] **Step 3: Behavior checks**

Re-run the Task 3 Step 4 puppeteer snippet for each theme value. Also no-JS check:
```bash
curl -s http://localhost:3210 | grep -o 'data-theme' | wc -l
```
Expected: `0` occurrences in served HTML outside the guard script string (static markup has no `data-theme` attr → crawlers get Paper).

- [ ] **Step 4: Fix anything found, re-screenshot, commit**

```bash
git add index.html && git commit -m "Theme polish pass from verification matrix

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
(Skip the commit if nothing needed fixing.)

---

### Task 7: Docs, ship, live verify

**Files:**
- Modify: `docs/TODO.md`, `docs/Positioning.md`

- [ ] **Step 1: Record in docs**

Append to `docs/TODO.md` under Shipped: `- [x] Theme switcher: Paper / Terminal / Studio (2026-09-17) — first "demonstrations" exhibit; spec in docs/superpowers/specs/`.
In `docs/Positioning.md`, add one line to "The AI Section" noting the switcher as the first live demonstration exhibit (agent canaries and chat surfaces planned next).

- [ ] **Step 2: Commit docs and push everything**

```bash
git add docs/TODO.md docs/Positioning.md && git commit -m "Docs: record theme switcher ship

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 3: Verify live (auto-deploy)**

```bash
for i in 1 2 3 4 5 6; do sleep 10; c=$(curl -sL https://www.robertmacnaughton.com | grep -c 'theme-chip'); [ "$c" -ge 3 ] && echo LIVE && break; done
```
Expected: `LIVE`. Then tell Robert to hard-refresh and click through the three chips.

---

## Self-review notes

- Spec coverage: behavior (T2/T3), architecture (T1–T3), Terminal spec (T4), Studio spec (T5), selector (T3), verification incl. Paper regression + reduced-motion + no-JS (T4/T6), docs (T7). Cursor blink reduced-motion guard lives in T4. Persistence test in T3/T6.
- Class-name risks flagged inline (`.t-card`, logo classes): implementer must grep before applying those specific rules and adapt selectors — the CSS blocks are the design intent; exact selectors get confirmed against the live file.
- No placeholders; all code inline. Type/name consistency: `theme-chip`, `tch-full/tch-init`, `siteTheme`, `applyTheme` used identically across tasks.
