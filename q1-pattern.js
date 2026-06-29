/**
 * Question 1 — Number pattern printer
 * --------------------------------------------------
 * For input n, print:
 *   1
 *   21
 *   321
 *   4321
 *   ...
 *   n(n-1)(n-2)...1   <- row n has n digits, counting down from n to 1
 *
 * (The rows given in the brief — 1, 21, 321, 4321 — are what fixes the
 * pattern: row i is the digits i, i-1, ..., 1 written next to each other.
 * That's the rule every approach below implements.)
 *
 * Run:  node q1-pattern.js
 */

const n = 5;

// ---------------------------------------------------------------
// Approach 1: Nested loops (classic, most explicit, O(n^2) but n is tiny
// so this is the most readable choice and the one I'd ship for clarity)
// ---------------------------------------------------------------
function printPatternNestedLoops(n) {
  let output = '';
  for (let row = 1; row <= n; row++) {
    let line = '';
    for (let col = row; col >= 1; col--) {
      line += col;
    }
    output += line + '\n';
  }
  console.log(output.trimEnd());
}

// ---------------------------------------------------------------
// Approach 2: Functional style with Array.from + map + join
// (no manual index bookkeeping, easy to read as a data pipeline)
// ---------------------------------------------------------------
function printPatternFunctional(n) {
  const lines = Array.from({ length: n }, (_, i) => {
    const row = i + 1;
    return Array.from({ length: row }, (_, j) => row - j).join('');
  });
  console.log(lines.join('\n'));
}

// ---------------------------------------------------------------
// Approach 3: Single loop using string padding / repetition tricks
// (builds each row by slicing a pre-built descending string)
// ---------------------------------------------------------------
function printPatternSlicing(n) {
  // descending = "n...321" e.g. for n=5 -> "54321"
  const descending = Array.from({ length: n }, (_, i) => n - i).join('');
  let output = '';
  for (let row = 1; row <= n; row++) {
    // last `row` characters of the full descending string, e.g. row=3 -> "321"
    output += descending.slice(n - row) + '\n';
  }
  console.log(output.trimEnd());
}

// ---------------------------------------------------------------
// Approach 4: Recursion (no loops at all)
// ---------------------------------------------------------------
function printPatternRecursive(n, row = 1) {
  if (row > n) return;
  let line = '';
  for (let col = row; col >= 1; col--) line += col;
  console.log(line);
  printPatternRecursive(n, row + 1);
}

// ---------------------------------------------------------------
// Demo all four approaches
// ---------------------------------------------------------------
console.log('--- Approach 1: nested loops ---');
printPatternNestedLoops(n);

console.log('\n--- Approach 2: functional (Array.from/map/join) ---');
printPatternFunctional(n);

console.log('\n--- Approach 3: string slicing ---');
printPatternSlicing(n);

console.log('\n--- Approach 4: recursion ---');
printPatternRecursive(n);

module.exports = {
  printPatternNestedLoops,
  printPatternFunctional,
  printPatternSlicing,
  printPatternRecursive,
};
