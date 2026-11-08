// Section 06 — Scope and closures

// Each call returns a NEW generator with its own counter:
// const next = createIdGenerator("ORD"); next() → "ORD-1", next() → "ORD-2"
export function createIdGenerator(prefix) {
  let count = 0;

  return function () {
    count++;
    return `${prefix}-${count}`;
  };
}

// A function factory: returns a check that "remembers" the limit.
export function makeCreditCheck(limit) {
  return function (amount) {
    return amount <= limit;
  };
}

// A value only a function can change.
// Returns [get, set]. The value lives in the closure; nothing else can reach it.
export function createBox(initial) {
  let value = initial;

  function get() {
    return value;
  }

  function set(newValue) {
    value = newValue;
  }

  return [get, set];
}