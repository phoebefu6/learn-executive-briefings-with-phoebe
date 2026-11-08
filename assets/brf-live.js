/* brf-live.js - the skim-survival bench for learn-executive-briefings-with-phoebe
 *
 * Input: a memo as text (one of the constructed Fernhollow versions in brf-sample.js, or the
 * learner's own). The parse is COMPUTED here: title (first line), headings (#), paragraphs and
 * their sentences, bold runs (**...**), list items (- , * , 1. ) and table rows (|).
 * What is MODELLED, and labelled so on the widget: the skim reader. It reads in a fixed priority
 * order (title, headings, first sentence of each paragraph, bold runs, list items and table rows,
 * then the remaining sentences in document order) at 238 words a minute (Brysbaert 2019, silent
 * reading of non-fiction) times a skim multiplier M that is an ASSUMPTION (default 1.5).
 * Five must-survive elements are detected by stated keyword rules, or by the writer's own tags
 * ([decision] [ask] [deadline] [cost] [risk]; a tag for an element switches its rule off).
 *   anti  ANTI-LEVER: "add context up front" puts a background paragraph straight after the title.
 *   bury  BREAK BUTTON: the first ask (outside the title) moves, without bold, to the end of
 *         paragraph 4 (or the last paragraph if there are fewer than four).
 * The Python reference (materials/brf_reference.py) runs the same steps in the same order;
 * materials/compare-ladder.py checks the two by value.
 */
(function (root) {
  "use strict";

  var BASE_WPM = 238;
  var MULTS = [1.0, 1.25, 1.5, 1.75, 2.0];
  var CHECKPOINTS = [30, 90, 240];
  var ELEMENTS = ["decision", "ask", "deadline", "cost", "risk"];
  var MODES = ["plain", "anti", "bury"];
  var MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december";
  var RULES = {
    decision: [/\b(recommend|recommends|recommendation|decision|decide)\b/],
    ask: [/\b(i ask|we ask|ask you|asking you|please|i need you|need your|i request|we request)\b/],
    deadline: [/\bdeadline\b/, /\bby (monday|tuesday|wednesday|thursday|friday)\b/, new RegExp("\\b\\d{1,2} (" + MONTHS + ")\\b")],
    cost: [/[£$€] ?\d/],
    risk: [/\b(risk|risks)\b/]
  };
  var TAG_SRC = "\\[(decision|ask|deadline|cost|risk)\\]";
  var WORD_RE = /[A-Za-z0-9]/;
  var END_RE = /[.!?]["')\]*]*$/;
  var LIST_RE = /^(- |\* |\d+[.)] )/;
  var SEP_RE = /^:?-{2,}:?$/;

  var ANTI_PARAGRAPH =
    "Before turning to the proposal itself, it is worth setting out how Fernhollow Freight grew from " +
    "four depots to eleven over the past decade, because each of those growth steps quietly added its " +
    "own customer list, and the way those lists grew apart explains most of what follows. " +
    "Sales keeps accounts in the CRM, the depots keep delivery contacts in the planning system, and " +
    "billing keeps invoice addresses in the finance ledger. Several earlier attempts to reconcile the " +
    "three lists were started and then paused when the people running them moved on.";

  /* ---------- engine (mirrors the Python reference, step for step) ---------- */
  function words(s) { return s.split(/\s+/).filter(function (t) { return t.length > 0; }); }
  function clean(s) { return s.split("**").join("").replace(new RegExp(TAG_SRC, "gi"), "").trim(); }
  function nwords(s) { return words(clean(s)).filter(function (t) { return WORD_RE.test(t); }).length; }
  function tagsIn(s) {
    var re = new RegExp(TAG_SRC, "gi"), m, out = [];
    while ((m = re.exec(s)) !== null) out.push(m[1].toLowerCase());
    return out;
  }

  function splitSentences(text) {
    var out = [], cur = [];
    words(text).forEach(function (tok) {
      cur.push(tok);
      if (END_RE.test(tok)) { out.push(cur.join(" ")); cur = []; }
    });
    if (cur.length) out.push(cur.join(" "));
    return out;
  }

  function detect(raw, tagged) {
    var low = clean(raw).toLowerCase(), tags = tagsIn(raw), found = [];
    ELEMENTS.forEach(function (e) {
      if (tagged[e]) { if (tags.indexOf(e) >= 0) found.push(e); }
      else if (RULES[e].some(function (r) { return r.test(low); })) found.push(e);
    });
    return found;
  }

  function stripHashes(s) { return s.replace(/^#+/, "").trim(); }

  function parse(text) {
    var blocks = [], para = null, seenTitle = false;
    text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").forEach(function (line) {
      var s = line.trim();
      if (!s) { para = null; return; }
      if (!seenTitle) { blocks.push({ kind: "title", text: stripHashes(s) }); seenTitle = true; return; }
      if (s.charAt(0) === "#") { para = null; blocks.push({ kind: "heading", text: stripHashes(s) }); }
      else if (LIST_RE.test(s)) { para = null; blocks.push({ kind: "list", text: s.replace(LIST_RE, "").trim() }); }
      else if (s.indexOf("|") >= 0) {
        para = null;
        var cells = s.split("|").map(function (c) { return c.trim(); }).filter(function (c) { return c.length > 0; });
        if (cells.length && !cells.every(function (c) { return SEP_RE.test(c); })) blocks.push({ kind: "table", text: cells.join(" ") });
      } else {
        if (para === null) { para = { kind: "para", text: s }; blocks.push(para); }
        else para.text += " " + s;
      }
    });
    blocks.forEach(function (b) { if (b.kind === "para") b.sents = splitSentences(b.text); });
    return blocks;
  }

  function anti(blocks) {
    var p = { kind: "para", text: ANTI_PARAGRAPH, sents: splitSentences(ANTI_PARAGRAPH) };
    return blocks.slice(0, 1).concat([p], blocks.slice(1));
  }

  function taggedSet(blocks) {
    var t = {};
    blocks.forEach(function (b) {
      var raws = b.kind === "para" ? b.sents : [b.text];
      raws.forEach(function (r) { tagsIn(r).forEach(function (x) { t[x] = true; }); });
    });
    return t;
  }

  function bury(blocks) {
    var tagged = taggedSet(blocks), moved = null, bi, si;
    blocks = blocks.map(function (b) {
      var c = { kind: b.kind, text: b.text };
      if (b.kind === "para") c.sents = b.sents.slice();
      return c;
    });
    for (bi = 0; bi < blocks.length; bi++) {
      var b = blocks[bi];
      if (b.kind === "title") continue;
      if (b.kind === "para") {
        for (si = 0; si < b.sents.length; si++) {
          if (detect(b.sents[si], tagged).indexOf("ask") >= 0) { moved = b.sents[si]; b.sents.splice(si, 1); break; }
        }
        if (moved !== null) { if (!b.sents.length) blocks.splice(bi, 1); break; }
      } else if (detect(b.text, tagged).indexOf("ask") >= 0) {
        moved = b.text;
        if (!END_RE.test(moved)) moved += ".";
        blocks.splice(bi, 1);
        break;
      }
    }
    if (moved === null) return { blocks: blocks, moved: false };
    moved = moved.split("**").join("");
    var paras = blocks.filter(function (x) { return x.kind === "para"; });
    if (!paras.length) blocks.push({ kind: "para", text: moved, sents: [moved] });
    else (paras.length >= 4 ? paras[3] : paras[paras.length - 1]).sents.push(moved);
    return { blocks: blocks, moved: true };
  }

  var PHASE = { title: 1, heading: 2, list: 5, table: 5 };
  function units(blocks) {
    var tagged = taggedSet(blocks), doc = [], bolds = [];
    blocks.forEach(function (b) {
      if (b.kind === "para") {
        b.sents.forEach(function (s, si) {
          var u = { phase: si === 0 ? 3 : 6, raw: s, words: nwords(s), els: detect(s, tagged) };
          if (si > 0) {
            var bw = 0, re = /\*\*(.+?)\*\*/g, m;
            while ((m = re.exec(s)) !== null) {
              var bu = { phase: 4, raw: m[1], words: nwords(m[1]), els: detect(m[1], tagged) };
              bw += bu.words;
              bolds.push(bu);
            }
            u.read = u.words - bw;
          }
          doc.push(u);
        });
      } else {
        doc.push({ phase: PHASE[b.kind], raw: b.text, words: nwords(b.text), els: detect(b.text, tagged) });
      }
    });
    function ph(p) { return doc.filter(function (u) { return u.phase === p; }); }
    var order = ph(1).concat(ph(2), ph(3), bolds, ph(5), ph(6));
    return { doc: doc, order: order };
  }

  function run(blocks, mult, keepUnits) {
    var uu = units(blocks), wps = BASE_WPM * mult / 60.0, reach = {}, cum = 0, trace = [];
    ELEMENTS.forEach(function (e) { reach[e] = null; });
    uu.order.forEach(function (u) {
      var start = cum;
      cum += (u.read !== undefined ? u.read : u.words);
      var t = cum / wps;
      u.els.forEach(function (e) { if (reach[e] === null) reach[e] = t; });
      if (keepUnits) trace.push({ phase: u.phase, t0: start / wps, t1: t, els: u.els, raw: u.raw });
    });
    var total = 0, wba = null, acc = 0, found = false;
    uu.doc.forEach(function (u) { total += u.words; });
    for (var i = 0; i < uu.doc.length && !found; i++) {
      if (uu.doc[i].els.indexOf("ask") >= 0) { wba = acc; found = true; }
      else acc += uu.doc[i].words;
    }
    var surv = {};
    CHECKPOINTS.forEach(function (c) {
      surv[String(c)] = ELEMENTS.filter(function (e) { return reach[e] !== null && reach[e] <= c; });
    });
    var r = { words: total, units: uu.order.length, wba: wba, reach: reach, survive: surv, skimSeconds: cum / wps };
    if (keepUnits) r.trace = trace;
    return r;
  }

  function evaluate(text, mode, mult, keepUnits) {
    var blocks = parse(text), moved = null;
    if (mode === "anti") blocks = anti(blocks);
    else if (mode === "bury") { var bb = bury(blocks); blocks = bb.blocks; moved = bb.moved; }
    var r = run(blocks, mult, keepUnits);
    if (mode === "bury") r.moved = moved;
    return r;
  }

  function canon(sample) {
    var out = { baseWpm: BASE_WPM, mults: MULTS, checkpoints: CHECKPOINTS, memos: {} };
    sample.memos.forEach(function (m) {
      var per = {};
      MODES.forEach(function (mode) {
        per[mode] = {};
        MULTS.forEach(function (k) { per[mode][k.toFixed(2)] = evaluate(m.text, mode, k); });
      });
      out.memos[m.id] = per;
    });
    return out;
  }

  /* ---------- widget ---------- */
  var rootEl, data, els = {};
  var state = { memo: "draft", mode: "plain", mult: 1.5, own: "" };
  var EL_UI = { decision: "Decision", ask: "Ask", deadline: "Deadline", cost: "Cost", risk: "Risk" };
  var CP_UI = { "30": "30 s", "90": "90 s", "240": "4 min" };
  var PH_UI = { 1: "title", 2: "headings", 3: "first sentences", 4: "bold", 5: "lists and tables", 6: "the rest" };
  var OWN_HINT = "# Your title: say the decision\n\n## The decision\nPaste or type your memo here. One line per paragraph is fine; a blank line starts a new paragraph. " +
    "Start headings with #, list items with - and table rows with |. Mark **bold** with two stars.\n";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function f1(x) { return x === null ? "never" : x.toFixed(1) + " s"; }
  function memoText() {
    if (state.memo === "own") return state.own;
    for (var i = 0; i < data.memos.length; i++) if (data.memos[i].id === state.memo) return data.memos[i].text;
    return "";
  }
  function wpm() { return Math.round(BASE_WPM * state.mult); }

  function stripSvg(r) {
    var W = 860, H = 128, x0 = 20, x1 = 840, T = Math.max(240, r.skimSeconds);
    var sx = function (t) { return x0 + (x1 - x0) * t / T; };
    var fills = { 1: "var(--indigo)", 2: "var(--indigo-mid)", 3: "var(--indigo-soft)", 4: "var(--amber)", 5: "var(--amber-50)", 6: "var(--hairline)" };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The skim order as a timeline: each block is one unit the modelled reader reads, in order, with lines at 30 seconds, 90 seconds and 4 minutes.">';
    r.trace.forEach(function (u) {
      var a = sx(u.t0), b = Math.max(sx(u.t1), a + 0.6);
      s += '<rect class="brf-u" x="' + a.toFixed(1) + '" y="34" width="' + (b - a).toFixed(1) + '" height="30" style="fill:' + fills[u.phase] + '"><title>' + esc(PH_UI[u.phase] + ": " + clean(u.raw).slice(0, 90)) + "</title></rect>";
    });
    CHECKPOINTS.forEach(function (c) {
      var x = sx(c).toFixed(1);
      s += '<line class="brf-cp" x1="' + x + '" y1="26" x2="' + x + '" y2="72"/><text class="brf-cpt" x="' + x + '" y="20" text-anchor="middle">' + CP_UI[String(c)] + "</text>";
    });
    var row = 0;
    ELEMENTS.forEach(function (e) {
      var t = r.reach[e];
      if (t === null) return;
      var x = sx(t);
      s += '<circle class="brf-dot" cx="' + x.toFixed(1) + '" cy="' + (86 + row * 9) + '" r="3.5"/>';
      row = (row + 1) % 2;
    });
    s += '<text class="brf-cpt" x="' + x0 + '" y="120">0 s</text><text class="brf-cpt" x="' + x1 + '" y="120" text-anchor="end">' + Math.round(T) + " s</text>";
    return s + "</svg>";
  }

  function render() {
    Object.keys(els.memoBtns).forEach(function (id) {
      els.memoBtns[id].classList.toggle("is-on", id === state.memo);
      els.memoBtns[id].querySelector("input").checked = id === state.memo;
    });
    els.anti.classList.toggle("is-on", state.mode === "anti");
    els.anti.querySelector("input").checked = state.mode === "anti";
    els.bury.classList.toggle("is-on", state.mode === "bury");
    els.bury.querySelector("input").checked = state.mode === "bury";
    els.multOut.textContent = state.mult.toFixed(2) + "x = " + wpm() + " wpm";
    els.edit.style.display = state.memo === "own" ? "" : "none";

    var text = memoText();
    var r = evaluate(text, state.mode, state.mult, true);
    var plain = state.mode === "plain" ? r : evaluate(text, "plain", state.mult, false);
    var n30 = r.survive["30"].length, n90 = r.survive["90"].length, n240 = r.survive["240"].length;
    var v = "Modelled skim reader at " + wpm() + " words a minute: " + n30 + " of 5 must-survive elements read by 30 s, " +
      n90 + " by 90 s, " + n240 + " by 4 min. The ask arrives at " + f1(r.reach.ask) +
      (r.wba === null ? "; no ask was found." : "; " + r.wba + " words come before it in a straight read.");
    var cls = n30 === 5 ? "is-good" : (n90 === 5 ? "is-ok" : "is-bad");
    if (state.mode !== "plain") {
      var p30 = plain.survive["30"].length, p90 = plain.survive["90"].length, p240 = plain.survive["240"].length;
      var lost = [];
      CHECKPOINTS.forEach(function (c) {
        var gone = plain.survive[String(c)].filter(function (e) { return r.survive[String(c)].indexOf(e) < 0; });
        if (gone.length) lost.push(CP_UI[String(c)] + " loses " + gone.map(function (e) { return EL_UI[e].toLowerCase(); }).join(", "));
      });
      v = (state.mode === "anti" ? "Anti-lever, context up front. " : (r.moved ? "Broken on purpose, the ask buried in paragraph 4. " : "Broken on purpose, but no ask was found to bury. ")) +
        "Read by 30 s / 90 s / 4 min: " + p30 + "/" + p90 + "/" + p240 + " before, " + n30 + "/" + n90 + "/" + n240 + " now" +
        (lost.length ? " (" + lost.join("; ") + ")." : ", no checkpoint changes.") +
        " The ask: " + f1(plain.reach.ask) + " before, " + f1(r.reach.ask) + " now. Words before the ask: " +
        (plain.wba === null ? "none found" : plain.wba) + " before, " + (r.wba === null ? "none found" : r.wba) + " now.";
      cls = (n30 < p30 || n90 < p90 || n240 < p240) ? "is-bad" : "is-ok";
    }
    els.verdict.className = "mb-verdict " + cls;
    els.verdict.textContent = v;

    function metric(label, val, unit, kind) {
      return '<div class="mb-metric"><span class="mb-mkind ' + (kind === "measured" ? "is-measured" : "is-heuristic") + '">' + esc(kind) + "</span>" +
        '<span class="mb-mlabel">' + esc(label) + '</span><span class="mb-mvalue">' + esc(val) + '</span><span class="mb-munit">' + esc(unit) + "</span></div>";
    }
    var m = "";
    m += metric("Read by 30 s", n30 + " of 5", "must-survive elements", "modelled");
    m += metric("Read by 90 s", n90 + " of 5", "must-survive elements", "modelled");
    m += metric("Read by 4 min", n240 + " of 5", "must-survive elements", "modelled");
    m += metric("The ask arrives", r.reach.ask === null ? "never" : r.reach.ask.toFixed(1) + " s", "in the skim order", "modelled");
    m += metric("Words before the ask", r.wba === null ? "no ask" : String(r.wba), "straight read, top to bottom", "measured");
    m += metric("Words in the memo", String(r.words), "counted, tags and markup removed", "measured");
    els.metrics.innerHTML = m;

    var t = '<table class="dt-table brf-el"><thead><tr><th>Element</th><th>Reached at</th>';
    CHECKPOINTS.forEach(function (c) { t += "<th>" + CP_UI[String(c)] + "</th>"; });
    t += "</tr></thead><tbody>";
    ELEMENTS.forEach(function (e) {
      t += "<tr><th>" + EL_UI[e] + "</th><td>" + f1(r.reach[e]) + "</td>";
      CHECKPOINTS.forEach(function (c) {
        var ok = r.survive[String(c)].indexOf(e) >= 0;
        t += '<td class="' + (ok ? "brf-yes" : "brf-no") + '">' + (ok ? "read" : "missed") + "</td>";
      });
      t += "</tr>";
    });
    els.table.innerHTML = t + "</tbody></table>";

    var c = '<table class="dt-table brf-cmp"><thead><tr><th>Version</th><th>As written</th><th>Context up front</th><th>Ask buried</th></tr></thead><tbody>';
    data.memos.forEach(function (mm) {
      c += "<tr" + (mm.id === state.memo ? ' class="is-cur"' : "") + "><th>" + esc(mm.label) + "</th>";
      MODES.forEach(function (md) {
        var x = evaluate(mm.text, md, state.mult, false);
        c += "<td>" + x.survive["30"].length + " / " + x.survive["90"].length + " / " + x.survive["240"].length +
          "<em>ask " + f1(x.reach.ask) + "</em></td>";
      });
      c += "</tr>";
    });
    els.cmp.innerHTML = c + "</tbody></table>";
    els.strip.innerHTML = stripSvg(r);
  }

  function buildUI() {
    rootEl.innerHTML = "";
    var panel = document.createElement("div"); panel.className = "mb-presets";
    els.memoBtns = {};
    data.memos.concat([{ id: "own", label: "Your own memo", note: "Paste your own text below; tags like [ask] override the keyword rules." }]).forEach(function (p) {
      var l = document.createElement("label"); l.className = "mb-preset";
      l.innerHTML = '<input type="radio" name="brf-memo" value="' + p.id + '"><span class="mb-pname">' + esc(p.label) + '</span><span class="mb-pnote">' + esc(p.note) + "</span>";
      l.querySelector("input").addEventListener("change", function () { state.memo = p.id; render(); });
      panel.appendChild(l); els.memoBtns[p.id] = l;
    });
    rootEl.appendChild(panel);

    var tog = document.createElement("div"); tog.className = "mb-presets";
    function toggle(mode, name, tagWord, note) {
      var l = document.createElement("label"); l.className = "mb-preset is-anti";
      l.innerHTML = '<input type="checkbox" name="brf-' + mode + '"><span class="mb-pname">' + esc(name) + ' <em class="mb-anti">' + tagWord + '</em></span><span class="mb-pnote">' + esc(note) + "</span>";
      l.querySelector("input").addEventListener("change", function (e) { state.mode = e.target.checked ? mode : "plain"; render(); });
      tog.appendChild(l); return l;
    }
    els.anti = toggle("anti", "Add context up front", "anti-lever", "A background paragraph goes in straight after the title, the way most first drafts open.");
    els.bury = toggle("bury", "Bury the ask", "break", "The first ask moves, without bold, to the end of paragraph 4.");
    rootEl.appendChild(tog);

    var mRow = document.createElement("div"); mRow.className = "ab-caprow";
    mRow.innerHTML = '<label for="brf-mult">Skim multiplier on 238 words a minute <span class="mb-mkind is-heuristic">assumption</span></label>' +
      '<input type="range" id="brf-mult" min="1" max="2" step="0.25" value="1.5"><output id="brf-multout">1.50x</output>';
    mRow.querySelector("input").addEventListener("input", function (e) { state.mult = +e.target.value; render(); });
    rootEl.appendChild(mRow); els.multOut = mRow.querySelector("output");

    var ed = document.createElement("div"); ed.className = "mb-edit";
    ed.innerHTML = '<label for="brf-own">Your memo (stays in this browser; nothing is sent anywhere)</label><textarea id="brf-own" rows="12" spellcheck="false"></textarea>' +
      '<p class="mb-hint">Rules: decision = recommend, decision or decide; ask = please, ask you, need your, request; deadline = a date like 14 November, by Friday, or deadline; cost = a currency sign before a number; risk = risk. Tag a sentence with [ask], [decision], [deadline], [cost] or [risk] and that element uses only your tags.</p>';
    var ta = ed.querySelector("textarea"); ta.value = OWN_HINT; state.own = OWN_HINT;
    ta.addEventListener("input", function () { state.own = ta.value; render(); });
    rootEl.appendChild(ed); els.edit = ed;

    els.verdict = document.createElement("p"); rootEl.appendChild(els.verdict);
    els.metrics = document.createElement("div"); els.metrics.className = "mb-metrics"; rootEl.appendChild(els.metrics);

    var c1 = document.createElement("div"); c1.className = "ab-card";
    c1.innerHTML = '<h4>The skim, in reading order <span class="mb-mkind is-heuristic">modelled</span></h4>' +
      '<p class="mb-hint brf-key"><span class="brf-k brf-k1"></span>title <span class="brf-k brf-k2"></span>headings <span class="brf-k brf-k3"></span>first sentences ' +
      '<span class="brf-k brf-k4"></span>bold <span class="brf-k brf-k5"></span>lists and tables <span class="brf-k brf-k6"></span>the rest · dots: an element reached</p>';
    els.strip = document.createElement("div"); els.strip.className = "brf-stage"; c1.appendChild(els.strip);
    rootEl.appendChild(c1);

    var c2 = document.createElement("div"); c2.className = "ab-card";
    c2.innerHTML = '<h4>The five must-survive elements <span class="mb-mkind is-heuristic">modelled</span></h4>';
    els.table = document.createElement("div"); els.table.className = "dt-tablewrap"; c2.appendChild(els.table);
    var c3 = document.createElement("div"); c3.className = "ab-card";
    c3.innerHTML = "<h4>Every version at this multiplier: read by 30 s / 90 s / 4 min</h4>";
    els.cmp = document.createElement("div"); els.cmp.className = "dt-tablewrap"; c3.appendChild(els.cmp);
    rootEl.appendChild(c2); rootEl.appendChild(c3);

    var hint = document.createElement("p"); hint.className = "mb-hint";
    hint.textContent = "Constructed Fernhollow Freight example: four versions of one memo, invented for teaching. " +
      "Computed: the parse, word counts and words before the ask. Modelled: the skim reader. 238 words a minute is Brysbaert's (2019) average " +
      "for adults reading English non-fiction silently; the skim multiplier is an assumption, and the fixed reading order is a simplification " +
      "no real executive follows exactly. Read the ORDER of the versions and what moves when you pull a lever, not the exact seconds.";
    rootEl.appendChild(hint);
    render();
  }

  function init() {
    rootEl = document.getElementById("brf-bench");
    if (!rootEl || !root.BRF_SAMPLE) return;
    data = root.BRF_SAMPLE;
    buildUI();
    root.BRF_BENCH = {
      set: function (o) {
        o = o || {};
        ["memo", "mode", "mult", "own"].forEach(function (k) { if (o[k] !== undefined && o[k] !== null) state[k] = o[k]; });
        var mi = document.getElementById("brf-mult"); if (mi) mi.value = state.mult;
        var ta = document.getElementById("brf-own"); if (ta && o.own !== undefined) ta.value = state.own;
        render();
        return els.verdict.textContent;
      },
      state: state,
      evaluate: evaluate
    };
  }

  var api = { evaluate: evaluate, parse: parse, canon: canon, ANTI_PARAGRAPH: ANTI_PARAGRAPH };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : this);
