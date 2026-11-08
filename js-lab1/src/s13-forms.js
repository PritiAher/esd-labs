// Section 13 — the pure half of the form exercise

// values: { code, title, department, credits }
// Complete when every field has non-blank text and credits is a whole number 1–6.
export function isComplete(values) {
  const { code, title, department, credits } = values;

  if (
    !code.trim() ||
    !title.trim() ||
    !department.trim() ||
    !credits.trim()
  ) {
    return false;
  }

  const creditNumber = Number(credits);

  return (
    Number.isInteger(creditNumber) &&
    creditNumber >= 1 &&
    creditNumber <= 6
  );
}

// Convert form values into a course object.
export function toCourse(values, nextId) {
  return {
    id: nextId(),
    code: values.code.trim().toUpperCase(),
    title: values.title.trim(),
    department: values.department.trim(),
    credits: Number(values.credits),
    description: null,
    capacity: 60,
    seatsLeft: 60
  };
}