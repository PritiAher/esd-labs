// Section 08 — Destructuring, spread, rest, computed keys

export function describeCourse({ code, title, credits = 3 }) {
  return `${code}: ${title} (${credits} cr)`;
}

export function updateField(form, name, value) {
  return {
    ...form,
    [name]: value
  };
}

export function withoutField(obj, key) {
  const { [key]: removed, ...rest } = obj;
  return rest;
}

export function firstAndRest(list) {
  const [first, ...rest] = list;
  return [first, rest];
}