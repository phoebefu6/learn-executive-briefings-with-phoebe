# Learn Executive Briefings with Phoebe

One page, the decision first, the evidence behind it: how to write for someone with four minutes.

Six 45-minute sessions for data and analytics leads, and the practitioners who write up for them, on
the decision memo, the pre-read and the briefing as artifacts. Static HTML, no build step: open
`index.html`.

1. Who reads it, and the decision on top
2. Pick the format
3. The evidence behind it
4. The skim-survival bench (computed in the browser)
5. Options, risk and confidence language
6. Send, land, follow up

## The bench

`assets/brf-live.js` parses a memo (the four constructed versions in `assets/brf-sample.js`, or the
learner's own text) and runs a stated skim-reader model: 238 words a minute (Brysbaert, 2019) times
an assumed skim multiplier, in a fixed reading order. It reports which of the decision, ask,
deadline, cost and risk are reached by 30 seconds, 90 seconds and four minutes. The Python reference
`materials/brf_reference.py` reproduces every value; `materials/compare-ladder.py` checks the two.

The running case, Fernhollow Freight, is constructed for teaching. No number about it is a
measurement.

By Phoebe Fu.
