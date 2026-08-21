# RobertMacNaughton.com — TODO, organized by ROI

Merged from the personal notes file and the Niamh punch list (2026-04-15 co-working call, reconciled 2026-08-09). Ordered by return on effort: visual fixes first per current priority, then copy work, then items gated on upstream decisions, then post-publish.

---

## Tier 1 — Visual quick wins (high impact, low effort — Niamh's direct feedback)

- [x] **Strip the AI whitewash off every photo.** Done 2026-08-08: removed the desaturating sepia/saturate filters on hero and About portrait; cut the hero dissolve gradient from 36% to 16% (mobile fades 35% → 14%). Decision: the hero photo itself (`Headhost_2023.png`) stays — Niamh saw the original and approved it; the wash was the CSS treatment, not the file.
- [x] **"Selected Projects" → "Special Projects."** Done 2026-08-08.
- [x] **Heading typeface — resolved: Cormorant Garamond stays.** 2026-08-08: the "fat/weird" italic was a bug, not the face — the font link only loaded italic 300/400, so headings at 500/600 were being synthetically bolded. True italic 500/600 cuts now load; hero italic set to real 500. Instrument Serif and Fraunces were tried and rejected along the way. **PP Fragment declined deliberately:** it's Cosmos Institute's brand face and Robert is being considered to coach their incoming CEO — mirroring their identity is the real risk, not licensing. Final pick 2026-08-09: **DM Serif Display**, chosen via a live dev font picker (since removed from `serve.mjs`; it's in git history at commit e43c085 if ever needed again).
- [x] **Deepen black/white contrast.** Done 2026-08-08: ink scale darkened (L10/15/35/48 → L7/11/29/40). Palette and blue untouched.

## Tier 2 — Cuts (high impact, low effort, minimal new writing)

- [x] **Trim the hero subtext.** Done 2026-08-09: four stacked claims replaced with one sentence carrying phronesis — "I work with founders and executives on the judgment that doesn't come from more information."
- [x] **Cut the copy under "What I Offer."** Done 2026-08-10 as part of the triple-threat rebuild — each offering is now one tight paragraph.
- [ ] **Stat maintenance.** Live claims — 5,000+ hours, 100+ group sessions, 36+ months average relationship, 20+ years — need a source and a date per the endorsement protocol. ("376 sessions" resolved 2026-08-10: replaced on-site with the durable "hundreds of sessions.")

## Tier 3 — Hero & quadrant restructure (high impact, needs copy decisions)

Niamh's structural sequence, in her order:

- [x] **Hero = name + one big statement.** Done 2026-08-09: headline is **"Advisor for the Intelligence Age"** (Robert's call, validated by everyone he ran it by). Eyebrow now plants the triple threat: Executive Coach · Teacher · Facilitator. "When intelligence gets cheap, judgment gets expensive" placed in the AI section as its thesis line — commentator register kept out of the hero. See "The Intersection" in Positioning.md.
- [x] **Headline positioning decided** — see above. Boundary line still unused on the site, keep for offer copy: "I don't do AI consulting engagements. I work with leaders in an ongoing advisory relationship where AI is one of several strategic threads… If your challenge is *leading through this transition* — that's what I do."
- [ ] **Move "the most expensive thing in your life is the conversation you're avoiding" further down.** It scopes the work too narrowly ("It's just about conversations… the work spans beyond that").
- [ ] **Replace that slot with subtext that teaches the four quadrants** — how to read Experience / Actions / People / Systems, and that they get worked simultaneously: "most coaching or advisory will focus on one of these four quadrants, whereas I'm well versed across all of them" (the idea, not the copy).
- [ ] **Write quadrant copy for the buyer who actually walks in** — the skeptical engineering CEO. Describe the inner landscape through a lens they'd already value. The site builds trust; it doesn't disclose the scope.

## Tier 4 — Section-level copy updates (medium impact, moderate effort)

- [x] **Rewrite "How I Work With AI."** Done 2026-08-10 (revised same day): reputation assumed, human-centered stance, breadth summarized in prose — Robert's call: no project portfolio list on the site. Still unused material for future passes: ICON, Keith Martin-Smith / Integral Life episode, Walsh and Dupuy, RRwAI reference deck.
- [x] **Exec coaching section.** Done 2026-08-10 via the offer rebuild: "draft the email" gone; copy now opens with capability assessment and traction.
- [ ] **About section:** true timeline — Atlanta → Boulder → engineering → Naropa → Integral → community builder → coach.
- [ ] **Surface the NeubergGore relationships** more prominently.
- [ ] **Extend "the wolf" into the About section.** The frame is live as the What I Offer intro; Positioning.md has it under Services → The Wolf. Consider a beat in About (crisis work, "throw me in").

## Tier 5 — Structural, gated on upstream decisions

- [x] **Update docs/Positioning.md.** Done 2026-08-10: Services section restructured around the triple threat, Curated Gatherings removed, "The Wolf" frame added.
- [x] **Restructure "What I Offer" around the triple threat.** Done 2026-08-10: three full-width rows — 01 Coach / Executive Coaching (capability assessment, traction on what's stuck, "growing at least as fast as the company"), 02 Facilitator / Facilitation (art of creating a context; do:say ratio kicker from [[Facilitating Offsites]]), 03 Teacher / Trainings (first-time managers, feedback & difficult conversations, conflict & communication, RRwAI, AI enablement, bespoke). Wolf intro above the rows: "Robert is the wolf."
- [x] **Resolve Curated Gatherings.** Robert's call 2026-08-10: let it go. Removed from the site and Positioning.md.
- [ ] **IntegralCentered.com decision** — fold in, keep as event brand, or sunset. Gates how the Integral Center legacy section reads.
- [ ] **Card animations** à la [commonsstack.org](https://www.commonsstack.org/). Polish; do after structure settles.

## Tier 6 — After publish

- [ ] Menu options: How I use AI in client work · Upcoming Events · Posts/articles/Obsidian notes
- [ ] "Talk with AI about Robert's coaching" — spec exists (the AI that tells people when they're *not* a fit)

---

## Shipped ✅

- [x] Testimonials widget (Capshaw / Terchila / Champion)
- [x] Special-projects content: Antelope Recovery, Integral Center + Ken Wilber, #RightRelationshipwithAI
- [x] SLI podcast callout
