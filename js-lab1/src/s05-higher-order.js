// Section 05 — Callbacks and higher-order functions

// How many items make predicate(item) return true? Write the loop yourself.
export function countWhere(list, predicate) {
  let count = 0;

  for (const item of list) {
    if (predicate(item)) count++;
  }

  return count;
}

// Returns a comparator for Array.prototype.sort that orders by one field,
// ascending. Works for strings and numbers.
export function byField(field) {
  return function (a, b) {
    if (a[field] < b[field]) return -1;
    if (a[field] > b[field]) return 1;
    return 0;
  };
}

// A setter that accepts either a new value or a function that computes
// the new value from the current one.
export function applyUpdate(current, update) {
  if (typeof update === "function") {
    return update(current);
  }

  return update;
}

// Apply a list of updates in order, each one to the result of the last.
export function applyAll(start, updates) {
  let result = start;

  for (const update of updates) {
    result = applyUpdate(result, update);
  }

  return result;
}