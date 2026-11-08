"""brf_reference.py - Python reference for the skim-survival bench (assets/brf-live.js).

Runs the same parse, the same modelled skim reader and the same transforms, step for step, and
prints the canon as JSON. materials/compare-ladder.py checks it against the node run BY VALUE.

    python3 materials/brf_reference.py > py.json
    node materials/brf-node.js > node.json
    python3 materials/compare-ladder.py py.json node.json

The reading model is a simplification and is labelled so on the widget:
- base rate 238 words per minute: Brysbaert (2019), silent reading of English non-fiction by adults
  (abstract read at source);
- a skim multiplier M (default 1.5) is an ASSUMPTION, not a measured value;
- the skim reader reads in a fixed priority order: title, headings, the first sentence of each
  paragraph, bold runs, list items and table rows, then the remaining sentences in document order.
"""
import json
import os
import re
import sys

BASE_WPM = 238
MULTS = [1.0, 1.25, 1.5, 1.75, 2.0]
CHECKPOINTS = [30, 90, 240]
ELEMENTS = ["decision", "ask", "deadline", "cost", "risk"]
MODES = ["plain", "anti", "bury"]

MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december"
RULES = {
    "decision": [re.compile(r"\b(recommend|recommends|recommendation|decision|decide)\b")],
    "ask": [re.compile(r"\b(i ask|we ask|ask you|asking you|please|i need you|need your|i request|we request)\b")],
    "deadline": [re.compile(r"\bdeadline\b"),
                 re.compile(r"\bby (monday|tuesday|wednesday|thursday|friday)\b"),
                 re.compile(r"\b\d{1,2} (" + MONTHS + r")\b")],
    "cost": [re.compile(r"[£$€] ?\d")],
    "risk": [re.compile(r"\b(risk|risks)\b")],
}
TAG_RE = re.compile(r"\[(decision|ask|deadline|cost|risk)\]", re.I)
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
WORD_RE = re.compile(r"[A-Za-z0-9]")
END_RE = re.compile(r"[.!?][\"')\]*]*$")
LIST_RE = re.compile(r"^(- |\* |\d+[.)] )")

ANTI_PARAGRAPH = (
    "Before turning to the proposal itself, it is worth setting out how Fernhollow Freight grew from "
    "four depots to eleven over the past decade, because each of those growth steps quietly added its "
    "own customer list, and the way those lists grew apart explains most of what follows. "
    "Sales keeps accounts in the CRM, the depots keep delivery contacts in the planning system, and "
    "billing keeps invoice addresses in the finance ledger. Several earlier attempts to reconcile the "
    "three lists were started and then paused when the people running them moved on."
)


def clean(s):
    return TAG_RE.sub("", s.replace("**", "")).strip()


def nwords(s):
    return sum(1 for t in clean(s).split() if WORD_RE.search(t))


def split_sentences(text):
    out, cur = [], []
    for tok in text.split():
        cur.append(tok)
        if END_RE.search(tok):
            out.append(" ".join(cur))
            cur = []
    if cur:
        out.append(" ".join(cur))
    return out


def detect(raw, tagged):
    """Elements found in one unit. tagged: elements the writer tagged anywhere (tags win)."""
    low = clean(raw).lower()
    tags = set(m.group(1).lower() for m in TAG_RE.finditer(raw))
    found = []
    for e in ELEMENTS:
        if e in tagged:
            if e in tags:
                found.append(e)
        elif any(r.search(low) for r in RULES[e]):
            found.append(e)
    return found


def parse(text):
    """Blocks: title, heading, list, table, para (para carries its sentences)."""
    blocks, para = [], None
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    seen_title = False
    for line in lines:
        s = line.strip()
        if not s:
            para = None
            continue
        if not seen_title:
            blocks.append({"kind": "title", "text": s.lstrip("#").strip()})
            seen_title = True
            continue
        if s.startswith("#"):
            para = None
            blocks.append({"kind": "heading", "text": s.lstrip("#").strip()})
        elif LIST_RE.match(s):
            para = None
            blocks.append({"kind": "list", "text": LIST_RE.sub("", s, count=1).strip()})
        elif "|" in s:
            para = None
            cells = [c.strip() for c in s.split("|") if c.strip()]
            if cells and not all(re.match(r"^:?-{2,}:?$", c) for c in cells):
                blocks.append({"kind": "table", "text": " ".join(cells)})
        else:
            if para is None:
                para = {"kind": "para", "text": s}
                blocks.append(para)
            else:
                para["text"] += " " + s
    for b in blocks:
        if b["kind"] == "para":
            b["sents"] = split_sentences(b["text"])
    return blocks


def anti(blocks):
    """Anti-lever: a background paragraph goes in straight after the title."""
    out = [b for b in blocks]
    p = {"kind": "para", "text": ANTI_PARAGRAPH, "sents": split_sentences(ANTI_PARAGRAPH)}
    return out[:1] + [p] + out[1:]


def tagged_set(blocks):
    t = set()
    for b in blocks:
        raws = b["sents"] if b["kind"] == "para" else [b["text"]]
        for r in raws:
            t |= set(m.group(1).lower() for m in TAG_RE.finditer(r))
    return t


def bury(blocks):
    """Break button: the first ask (outside the title) moves, plain, to the end of paragraph 4."""
    tagged = tagged_set(blocks)
    blocks = [dict(b, sents=list(b["sents"])) if b["kind"] == "para" else dict(b) for b in blocks]
    moved = None
    for bi, b in enumerate(blocks):
        if b["kind"] == "title":
            continue
        if b["kind"] == "para":
            for si, s in enumerate(b["sents"]):
                if "ask" in detect(s, tagged):
                    moved = s
                    del b["sents"][si]
                    break
            if moved is not None:
                if not b["sents"]:
                    del blocks[bi]
                break
        elif "ask" in detect(b["text"], tagged):
            moved = b["text"]
            if not END_RE.search(moved):
                moved += "."
            del blocks[bi]
            break
    if moved is None:
        return blocks, False
    moved = moved.replace("**", "")
    paras = [b for b in blocks if b["kind"] == "para"]
    if not paras:
        blocks.append({"kind": "para", "text": moved, "sents": [moved]})
    else:
        target = paras[3] if len(paras) >= 4 else paras[-1]
        target["sents"].append(moved)
    return blocks, True


def units(blocks):
    """Doc-order units plus the skim order. Each unit: phase, words, elements, doc (bool)."""
    tagged = tagged_set(blocks)
    doc, bolds = [], []
    for b in blocks:
        if b["kind"] == "para":
            for si, s in enumerate(b["sents"]):
                u = {"phase": 3 if si == 0 else 6, "raw": s, "words": nwords(s), "els": detect(s, tagged)}
                if si > 0:
                    bw = 0
                    for m in BOLD_RE.finditer(s):
                        bt = m.group(1)
                        bu = {"phase": 4, "raw": bt, "words": nwords(bt), "els": detect(bt, tagged)}
                        bw += bu["words"]
                        bolds.append(bu)
                    u["read"] = u["words"] - bw
                doc.append(u)
        else:
            phase = {"title": 1, "heading": 2, "list": 5, "table": 5}[b["kind"]]
            doc.append({"phase": phase, "raw": b["text"], "words": nwords(b["text"]), "els": detect(b["text"], tagged)})
    order = [u for u in doc if u["phase"] == 1] + [u for u in doc if u["phase"] == 2] + \
        [u for u in doc if u["phase"] == 3] + bolds + [u for u in doc if u["phase"] == 5] + \
        [u for u in doc if u["phase"] == 6]
    return doc, order


def run(blocks, mult):
    doc, order = units(blocks)
    wps = BASE_WPM * mult / 60.0
    reach = {e: None for e in ELEMENTS}
    cum = 0
    for u in order:
        cum += u.get("read", u["words"])
        t = cum / wps
        for e in u["els"]:
            if reach[e] is None:
                reach[e] = t
    total = sum(u["words"] for u in doc)
    wba = None
    acc = 0
    for u in doc:
        if "ask" in u["els"]:
            wba = acc
            break
        acc += u["words"]
    surv = {}
    for c in CHECKPOINTS:
        surv[str(c)] = [e for e in ELEMENTS if reach[e] is not None and reach[e] <= c]
    return {"words": total, "units": len(order), "wba": wba, "reach": reach,
            "survive": surv, "skimSeconds": cum / wps}


def evaluate(text, mode, mult):
    blocks = parse(text)
    moved = None
    if mode == "anti":
        blocks = anti(blocks)
    elif mode == "bury":
        blocks, moved = bury(blocks)
    r = run(blocks, mult)
    if mode == "bury":
        r["moved"] = moved
    return r


def canon(sample):
    out = {"baseWpm": BASE_WPM, "mults": MULTS, "checkpoints": CHECKPOINTS, "memos": {}}
    for m in sample["memos"]:
        per = {}
        for mode in MODES:
            per[mode] = {"%.2f" % k: evaluate(m["text"], mode, k) for k in MULTS}
        out["memos"][m["id"]] = per
    return out


def load_sample(repo):
    src = open(os.path.join(repo, "assets", "brf-sample.js"), encoding="utf-8").read()
    js = src[src.index("{"):src.rstrip().rstrip(";").rindex("}") + 1]
    return json.loads(js)


if __name__ == "__main__":
    repo = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    print(json.dumps(canon(load_sample(repo))))
