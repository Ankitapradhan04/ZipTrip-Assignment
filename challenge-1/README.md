# Challenge 1 — Answers

Runnable code for Q1–Q3 lives in this folder as standalone `.js` files:

```bash
node q1-pattern.js
node q2-reverse-string.js
node q3-remove-duplicates.js
```

Each file implements the question in **multiple different ways**, as asked, and logs every approach's output to the console so you can diff them against the expected output. Short rationale for each approach (readability vs. performance) is in the code comments. Q4 and Q5 are selector/CSS reasoning questions, answered below — Q5 also has a runnable live demo at `q5-flexbox-demo.html` (open it directly in a browser).

---

## Question 1 — Number pattern

See `q1-pattern.js`. Rule extracted from the worked examples (`1`, `21`, `321`, `4321`): row `i` is the digits `i, i-1, ..., 1` written next to each other, so row `n` has `n` digits. Implemented 4 ways: nested loops, a functional `Array.from`/`map`/`join` pipeline, string-slicing a pre-built descending string, and plain recursion.

## Question 2 — Reverse a string

See `q2-reverse-string.js`. 6 approaches: `split/reverse/join`, spread + reverse, a manual backwards loop, `reduce`, recursion, and an in-place two-pointer swap. `split('').reverse().join('')` is the one I'd actually use in production code — it's the most idiomatic and there's no meaningful perf difference at realistic string sizes.

## Question 3 — Remove duplicates from an array

See `q3-remove-duplicates.js`. **Most optimal:** `[...new Set(arr)]` — O(n) time, preserves first-seen order, one line. Also included: `filter + indexOf` and `reduce + includes` (both O(n²), shown for completeness/different styles), and a manual loop with a `Map` as a seen-tracker (O(n), same complexity as the `Set` approach, but useful if you also need duplicate counts).

---

## Question 4 — CSS selectors

Reference markup:

```html
01 <div id="container">
02   <div class="box"></div>
03
04   <div class="box2"></div>
05   <div>
06     <div class="box"></div>
07   </div>
08 </div>
09
10 <div class="box"></div>
```

Note: the div on **line 10 is a sibling of `#container`**, not nested inside it (it appears after `#container`'s closing tag on line 8) — that placement is what makes several of these selectors interesting.

| Selector | Lines selected | Why it matches | Why it skips the rest |
|---|---|---|---|
| `.box` | **2, 6, 10** | Matches *any* element carrying the class `box`, anywhere in the document, regardless of tag or nesting depth. | Line 4 has class `box2` — a different class name, not `box` with an extra token. Line 5 has no class at all. |
| `div .box` | **2, 6** | Descendant combinator: selects `.box` elements that have *some* `div` ancestor. Line 2's ancestor is the `div#container`; line 6's ancestors are the plain `div` (line 5) and `div#container`. | Line 10 is **not** selected: it has no ancestor `div` — it sits as a sibling after `#container` closes, so there's nothing wrapping it. (Line 4 isn't `.box` to begin with.) |
| `div.box` | **2, 6, 10** | Compound selector (no space) — one single element that is simultaneously a `div` **and** has class `box`. All three lines are `<div class="box">`, so all three qualify on their own, independent of ancestry. | Line 4 is a `div` but its class is `box2`, not `box`. |
| `[class]` | **2, 4, 6, 10** | Attribute-presence selector — matches any element that has a `class` attribute set at all, no matter the value. | Line 1's `div` has an `id`, not a `class`. Line 5's `div` has neither attribute. |
| `#container .box` | **2, 6** | Same descendant logic as `div .box`, but anchored specifically to the element with `id="container"` rather than to "any div." Both line 2 and line 6 are nested somewhere inside `#container` (lines 1–8). | Line 10 is outside `#container` entirely (it comes after `#container` closes on line 8), so it can't be a descendant of it. |
| `#container > .box` | **2** | Child combinator — only matches `.box` elements that are a **direct** child of `#container`, i.e. exactly one level deep. Line 2 sits directly inside `#container`. | Line 6 *is* inside `#container`, but it's a grandchild — its direct parent is the plain `div` on line 5, not `#container` itself, so the direct-child requirement fails. Line 10 fails for the same reason as above (not inside `#container` at all). |

---

## Question 5 — Three-box flex layout

Reference markup:

```html
1 <div id="container">
2   <div class="left fixed box"></div>
3   <div class="middle expanding box"></div>
4   <div class="right fixed box"></div>
5 </div>
```

Requirements: all 3 boxes horizontal · `.left`/`.right` fixed at `100px` · `.middle` fills whatever space is left · container width can change · **no overlap**, ever.

A runnable side-by-side comparison of all three approaches below is in `q5-flexbox-demo.html` — open it in a browser and resize the window to see the middle box reflow live.

### Approach 1 — Flexbox (recommended / most optimal)

This is the right tool for "one row, two fixed ends, one flexible middle" — it's purpose-built for exactly this 1-dimensional distribution problem, needs no `calc()` math, and re-flows automatically when the container resizes.

```css
#container {
  display: flex;
  width: 100%;       /* container can be any width */
}

.fixed {              /* shared by .left and .right */
  flex: 0 0 100px;    /* grow:0 shrink:0 basis:100px -> never changes size */
  box-sizing: border-box;
}

.expanding {           /* the middle box */
  flex: 1 1 auto;      /* grow:1 shrink:1 -> eats all remaining space */
  min-width: 0;        /* CRITICAL: without this, flex items default to
                           min-width:auto, which lets long unbroken content
                           push the box wider than its flex-basis and
                           overlap/overflow the right box */
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}
```

Why this can't overlap: `flex: 0 0 100px` locks the left/right boxes to exactly 100px — they never grow or shrink no matter what's inside them. The middle box's `flex: 1 1 auto` makes it claim precisely "everything else," and `min-width: 0` + `overflow: hidden` stop its *content* (a long unbroken word/string) from forcing the box itself wider than that allotted space. `box-sizing: border-box` on all three means any padding/border is counted *inside* the declared widths instead of adding to them — the classic hidden cause of "fixed-width" boxes that overlap their neighbors.

### Approach 2 — CSS Grid

Same problem expressed as a column-tracks layout instead of flow distribution — arguably even more declarative since the three widths are stated explicitly in one line.

```css
#container {
  display: grid;
  grid-template-columns: 100px 1fr 100px;
  width: 100%;
}

.box {
  min-width: 0;        /* same overflow protection as the flex version */
  overflow: hidden;
  box-sizing: border-box;
}
```

`100px 1fr 100px` pins the first and third tracks at exactly 100px and tells the middle track to consume the one remaining fractional unit — i.e. everything left over. No widths need to be set on the children at all; the grid container enforces them.

### Approach 3 — Floats + `calc()` (legacy, pre-flexbox technique)

Included to show "more than one way," and because you may still meet this in older codebases.

```css
#container {
  width: 100%;
  overflow: hidden;     /* clearfix: contains the floated children */
}

.left {
  float: left;
  width: 100px;
  box-sizing: border-box;
}

.right {
  float: right;
  width: 100px;
  box-sizing: border-box;
}

.middle {
  width: calc(100% - 200px); /* 100% minus the two fixed 100px columns */
  margin-left: 100px;        /* push past the floated left box */
  box-sizing: border-box;
  overflow: hidden;
}
```

This works but is more fragile than the other two: `calc(100% - 200px)` has to be kept in sync by hand with the fixed widths (in flex/grid the browser does that subtraction for you), and floats need an explicit clearfix (`overflow: hidden` on the parent here) or the container collapses to zero height. **Flexbox (Approach 1) is the one I'd ship** — least code, no manual math, and it's the standard tool for this exact "fixed-flex-fixed row" pattern today.
