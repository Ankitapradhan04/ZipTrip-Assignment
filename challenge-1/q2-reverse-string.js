/**
 * Question 2 — Reverse the characters in a string
 * --------------------------------------------------
 * input:  "Bhaskara"
 * output: "araksahB"
 *
 * Run:  node q2-reverse-string.js
 */

const input = 'Bhaskara';

// ---------------------------------------------------------------
// Approach 1: split -> reverse -> join
// The shortest, most idiomatic, and the one I'd actually use day to day.
// O(n) time, O(n) extra space.
// ---------------------------------------------------------------
function reverseSplitJoin(str) {
  return str.split('').reverse().join('');
}

// ---------------------------------------------------------------
// Approach 2: Spread operator instead of split (same idea, ES6 style,
// also correctly handles multi-byte/surrogate-pair characters better
// than split('') in some edge cases since spread iterates by code point)
// ---------------------------------------------------------------
function reverseSpread(str) {
  return [...str].reverse().join('');
}

// ---------------------------------------------------------------
// Approach 3: Manual loop, building the result from the end backwards.
// No built-ins doing the heavy lifting — good if an interviewer wants
// to see you can do it without Array.prototype.reverse.
// ---------------------------------------------------------------
function reverseManualLoop(str) {
  let result = '';
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

// ---------------------------------------------------------------
// Approach 4: reduce
// ---------------------------------------------------------------
function reverseReduce(str) {
  return str.split('').reduce((reversed, char) => char + reversed, '');
}

// ---------------------------------------------------------------
// Approach 5: Recursion
// ---------------------------------------------------------------
function reverseRecursive(str) {
  if (str.length <= 1) return str;
  return reverseRecursive(str.slice(1)) + str[0];
}

// ---------------------------------------------------------------
// Approach 6: In-place two-pointer swap on a character array
// (closest to how you'd do it in a lower-level language; most
// "optimal" in the sense of avoiding repeated string concatenation —
// swaps happen on an array, single allocation, O(n) time / O(n) space
// for the array, O(1) *extra* space beyond that array)
// ---------------------------------------------------------------
function reverseTwoPointer(str) {
  const chars = str.split('');
  let left = 0;
  let right = chars.length - 1;
  while (left < right) {
    [chars[left], chars[right]] = [chars[right], chars[left]];
    left++;
    right--;
  }
  return chars.join('');
}

// ---------------------------------------------------------------
// Demo
// ---------------------------------------------------------------
console.log('Input:', input);
console.log('Approach 1 (split/reverse/join):', reverseSplitJoin(input));
console.log('Approach 2 (spread):            ', reverseSpread(input));
console.log('Approach 3 (manual loop):       ', reverseManualLoop(input));
console.log('Approach 4 (reduce):            ', reverseReduce(input));
console.log('Approach 5 (recursion):         ', reverseRecursive(input));
console.log('Approach 6 (two-pointer swap):  ', reverseTwoPointer(input));

module.exports = {
  reverseSplitJoin,
  reverseSpread,
  reverseManualLoop,
  reverseReduce,
  reverseRecursive,
  reverseTwoPointer,
};
