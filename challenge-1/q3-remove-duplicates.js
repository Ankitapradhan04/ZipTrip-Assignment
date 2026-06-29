/**
 * Question 3 — Remove duplicates from an array, keep unique values
 * --------------------------------------------------
 * input:  [1, 2, 3, 6, 4, 3, 7, 4, 2, 6, 8, 2, 5, 9, 0, 1]
 * output: [1, 2, 3, 6, 4, 7, 8, 5, 9, 0]
 *         (first-seen order is preserved — that's what the expected
 *          output shows, so every approach below preserves order)
 *
 * Run:  node q3-remove-duplicates.js
 */

const input = [1, 2, 3, 6, 4, 3, 7, 4, 2, 6, 8, 2, 5, 9, 0, 1];

// ---------------------------------------------------------------
// Approach 1 (MOST OPTIMAL): Set + spread
// A Set can only hold unique values, and it preserves insertion order,
// so this is a one-liner that's also the best time complexity here:
// O(n) time, O(n) space. This is what I'd actually ship.
// ---------------------------------------------------------------
function uniqueWithSet(arr) {
  return [...new Set(arr)];
}

// ---------------------------------------------------------------
// Approach 2: filter + indexOf
// Simple and very readable, but O(n^2) because indexOf rescans the
// array for every element. Fine for small arrays, not for large ones.
// ---------------------------------------------------------------
function uniqueWithFilterIndexOf(arr) {
  return arr.filter((value, index) => arr.indexOf(value) === index);
}

// ---------------------------------------------------------------
// Approach 3: reduce + accumulator.includes()
// Same O(n^2) trade-off as approach 2, shown as a different style
// (functional accumulation instead of filtering in place).
// ---------------------------------------------------------------
function uniqueWithReduce(arr) {
  return arr.reduce((unique, value) => {
    if (!unique.includes(value)) unique.push(value);
    return unique;
  }, []);
}

// ---------------------------------------------------------------
// Approach 4: Manual loop + a Map/object as a seen-tracker
// O(n) time, O(n) space — same complexity class as the Set approach,
// just spelled out manually (useful if you need to also know *how many
// times* each value repeated, since the Map already gives you that).
// ---------------------------------------------------------------
function uniqueWithSeenMap(arr) {
  const seen = new Map();
  const result = [];
  for (const value of arr) {
    if (!seen.has(value)) {
      seen.set(value, true);
      result.push(value);
    }
  }
  return result;
}

// ---------------------------------------------------------------
// Demo
// ---------------------------------------------------------------
console.log('Input:', input);
console.log('Approach 1 (Set + spread):       ', uniqueWithSet(input));
console.log('Approach 2 (filter + indexOf):   ', uniqueWithFilterIndexOf(input));
console.log('Approach 3 (reduce + includes):  ', uniqueWithReduce(input));
console.log('Approach 4 (manual loop + Map):  ', uniqueWithSeenMap(input));

module.exports = {
  uniqueWithSet,
  uniqueWithFilterIndexOf,
  uniqueWithReduce,
  uniqueWithSeenMap,
};
