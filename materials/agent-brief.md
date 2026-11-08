# Agent brief - shared by every fan-out page of learn-executive-briefings-with-phoebe

Filled from `~/.claude/skills/course-builder/references/agent-brief.template.md` on 2026-11-08.
Internal build document: never link it from an audience page.

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   how many options each question has (4):
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-executive-briefings-with-phoebe/courses/01-the-decision-on-top.html`
2. The source map: every verified number, its evidence tier, per-session coverage, the seams, the
   constructed memo facts and the bench canon. Use ONLY its numbers; never invent a statistic; if a
   fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-executive-briefings-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block (first 26 lines) for the palette tokens:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-executive-briefings-with-phoebe/assets/style.css`
4. For bench numbers only: `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-executive-briefings-with-phoebe/courses/04-the-skim-survival-bench.html`
   (the steps list every number the widget prints at the default; quote nothing else from the bench).

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "learn-executive-briefings-with-phoebe / Session N of 6", #toggle-all,
#zoom-toggle) · masthead (eyebrow "Learn Executive Briefings with Phoebe · Session N of 6", h1
with one `<span class="accent">`, .sub, .chip-row with the level chip (🟡 Core for sessions 2 and 3,
🟠 Deeper for sessions 5 and 6) + two .chip.audience + .chip.time "45 min", .agenda a1-a4 with flex
weights) · main.wrap · section#intro (Part 0: kicker, .lede, .legend pills as in the template,
.callout.win "★ What you walk out with tonight.") · 3 Parts, each `section.section#part-N` with
section-kicker (klabel "Part N · covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE
figure, `details.card` accordions (summary: `.mode.live` or `.mode.self`, title, `.mini`,
`.caret ▶`), at least one `.callout.example` with `span.ex-pill` "Real world" on the page ·
section#demo-1 Build-along (kicker `.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure,
`.steps > .step`, each with a `<p>` then a `.prompt-box.good` carrying a `span.label`; the worked
content is Sunniva's memo at Fernhollow, and the learner writes their own beside it) ·
section#exercise Homework (ol, 4 items) · section#quiz (3 x `.quiz-q data-answer="0-based"`,
`p.qtext`, four `button.qopt` "A · ..." to "D · ...", `p.qwhy`; one `p.quiz-score` after the last) ·
section#official, h2 EXACTLY "What this session teaches, and where it came from",
`.covered > .covered-row` (pill solid ✓ / light ◐ + name + note), then the `.mono` line EXACTLY
"Every fact on this page, and its verification tier, is recorded in the course's source map." ·
section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin this</span>", .grid-2 of six
.cheat-item) · `.callout.next` with `.nx-pill` "Next session" · footer.pagefoot ·
`<script src="../assets/app.js?v=1"></script>`.

Head: the template's social meta block with this page's own title/description/url (og:image stays
`https://phoebefu6.github.io/learn-executive-briefings-with-phoebe/assets/og-cover.png`);
`<title>Session N · <title> - learn executive briefings with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. Fernhollow numbers are constructed
  and say so. Never quote a bench number the session 4 page does not print.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
- Citations in the exact form of the map's appendix; anything marked reported says "reported";
  catalogue-only says "catalogue read"; at most ONE short quotation per source, under 15 words.
- NEVER "lottery" or "lotteries"; say the mechanism.
- Default to the English word. Any non-English term carries its English in brackets.
- No named real employers beyond the sources in the map, no salary or pay figures, no "hire me" advice.
- Running cases are FICTIONAL: label "Constructed Fernhollow Freight example" (in a figure note,
  a callout or the lede) on every page. Never Phoebe's own journey, employers or clients.
- Famous claims: never quote "executives spend N seconds on a memo", "readers read only the first
  two lines", or any goldfish attention figure. "Amazon banned PowerPoint" is narrower at source
  (the letter says Amazon does not do slide presentations; the 2004 email is reported).
- Quiz answer letters must vary across the three questions; use the order given in your outline.
- Titles, widget ids and class names must not collide with siblings. Banned titles: "Structure",
  "The written version", "The ask", "Managing up", "Decide and communicate", "Updates, reports,
  decision memos", "A system you keep", "The one-page marketing plan", "Is it worth the time?",
  "Where your week actually goes", and every h1 in learn-communication, learn-stakeholder-management,
  learn-data-pmo, learn-ai-writing, learn-decision-intelligence, learn-tech-writing,
  learn-visual-storytelling.
- Seams: say each relevant one out loud with an absolute link and do not reteach it (map section
  "Seams"). BLUF and the pyramid: one-line recap, link Communication 03. Sentence clarity:
  Communication 04. Generic update/report/memo triage: AI Writing b5. Trust evidence for numeric
  ranges against verbal hedges, and choosing between options: Decision Intelligence 04 and 06.
  Decks: Visual Storytelling. Cadence and steering slots: Data PMO a5, b6. Board pre-read and Q&A:
  the planned Presenting to a Board course, mentioned as "planned", NO link.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): ink `#2B1B1A` · muted `#66524F` · primary (oxblood)
`#7E1B1E` · deep `#5A1215` · mid `#6C171A` · soft `#E8C3C2` · tint `#FBEFEC` · faint `#D9CCC4` ·
hairline `#ECE3DA` · slate (the ONE contrast colour) `#2F5878` · slate ink `#1D3B52` · slate tint
`#E8EFF4` · paper `#FDF9F2` · `#FFFFFF` · universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a
wrong-way panel. Text colours that pass AA on white/tint/slate tint: ink, muted, primary, deep,
slate, slate ink. White text only on primary, deep, mid or slate fills.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: `e<session><letter>` (e2a, e2b, e2c, e2d;
  e3a...; e5a...; e6a...). Never reuse e1x or e4x.
- `<defs>` holds three things with the figure prefix P: a wobble filter `id="PSk"`
  (`feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` +
  `feDisplacementMap scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%"
  width="106%" height="106%"`), a hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one
  `#7E1B1E` line, opacity .5) when used, an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill
  none, ink stroke 1.6). ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none"
  stroke="#2B1B1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`; rects carry
  a tiny rotation (-4 to 4 degrees for hand-placed items, under 1 for panels). Fills: white, tint,
  the hachure for "the pile" or "the detail", and slate tint with a slate stroke ONLY for the one
  thing the figure is about. One doodle anchor per figure, simple strokes, never a mascot. Text
  classes: `.PH` 800 12px ink heading · `.PL` 600 12px ink label · `.PS` 400 11px muted · `.PB` 800
  11px slate ink · `.PV` 800 16-20px deep value · `.PW` 800 12px white on a fill · `.PA` 700 11px
  primary axis caption · `.PN` 400 12px muted note. Hand-stacked items must not overlap as painted rects.
- ALL `<text>` outside any filtered group, sans stack, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110
  chars; 40px between neighbouring point labels; bottom note 22px below the last row, H clears it
  by 8px. No line, arrow or curve may pass through a label (the gate fails it); a label must sit
  wholly inside its box or wholly outside it, never across an edge; a numbered badge is a filled
  circle with its number inside. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along. Draw the MECHANISM (where the decision
  sits on the page, what the reader passes before the ask, where detail moves to), never a
  metaphor literally, never decoration.

## Voice and honesty

Every Part gets a story: the Fernhollow case (constructed) or a source from the map. Health: pressure
here is workload and planning, never medical or clinical advice (already said on the landing page and
session 1; do not give clinical advice anywhere).

## Cast and memo facts (constructed Fernhollow Freight; use exactly these)

Sunniva Holm, head of data, reports to Kenji Arai (CIO, the sponsor, must never be surprised).
Marguerite Vance, CEO, the decider: she signs, and asks Halvard Lind (CFO, checks the numbers) and
Odile Mercer (COO, the depots) before she does. Rafe Okoro, commercial director, owns the CRM account
lists. Bram Tully, depot planning manager, 19 years, asked first on anything touching the depots.
Marguerite is measured on growth, margin and board confidence and fears another IT programme the
board asks about. The memo facts (constructed, identical in every version): 2,140 accounts ordered in
the last year; the three lists agree on name, address and contact for fewer than half; about 310
credit notes last quarter for wrong-address deliveries; five of six account managers keep a private
spreadsheet; planners re-key exceptions roughly twenty minutes per planner per day; €1.4 million over
two years (platform and build €900,000 then €200,000; depot and sales time €180,000 then €120,000);
executive meeting 14 November; build starts January; first depot live in Q3; main risk: the CRM
account lists not opened up early so the platform launches empty; second risk: depot staff time
during the cut-over; rejected options: a one-off clean (drifts back within a year) and making the CRM
the master (suits sales, leaves the depots entering data into a system built for account management).
Retention on key accounts is plausible but NOT measured, and the rewrite says so.

## Cross-links (absolute URLs)

- Communication: https://phoebefu6.github.io/learn-communication-with-phoebe/courses/01-the-ask.html ,
  .../03-structure.html , .../04-the-written-version.html , .../06-bad-news-and-disagreement.html
- Stakeholder Management: https://phoebefu6.github.io/learn-stakeholder-management-with-phoebe/courses/01-who-actually-decides.html ,
  .../02-measured-on-and-afraid-of.html , .../03-managing-up.html , .../05-coalitions-and-pre-wiring.html
- Data PMO: https://phoebefu6.github.io/learn-data-pmo-with-phoebe/courses/a5-stakeholders-and-steering.html ,
  .../b6-stakeholder-management.html
- AI Writing: https://phoebefu6.github.io/learn-ai-writing-with-phoebe/courses/b5-updates-and-memos.html
- Decision Intelligence: https://phoebefu6.github.io/learn-decision-intelligence-with-phoebe/courses/04-uncertainty-you-can-promise.html ,
  .../06-decide-and-communicate.html
- Tech Writing: https://phoebefu6.github.io/learn-tech-writing-with-phoebe/courses/03-structure-readers-scan.html
- Visual Storytelling: https://phoebefu6.github.io/learn-visual-storytelling-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain and session titles

Footer left: "Session N of 6 · learn-executive-briefings-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "<a href="PREV">← Prev: <title></a> &nbsp;·&nbsp; <a href="NEXT">Next: <title> →</a>" (last page: "← Prev" and "<a href="../index.html">Course home</a>").

Session titles (exact, sentence case, one accent span in h1):
1. Who reads it, and the decision on top · `01-the-decision-on-top.html`
2. Pick the format · `02-pick-the-format.html`
3. The evidence behind it · `03-the-evidence-behind-it.html`
4. The skim-survival bench · `04-the-skim-survival-bench.html`
5. Options, risk and confidence language · `05-options-risk-and-confidence.html`
6. Send, land, follow up · `06-send-land-follow-up.html`
