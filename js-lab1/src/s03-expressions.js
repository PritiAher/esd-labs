// Section 03 — Values, truthiness and expressions

// "Full", "1 seat left", or "12 seats left".
export function seatLabel(course) {
  const seat = course.seatsLeft
  const label = seat === 0 ? "Full" : seat>1 ?`${seat} seats left`: `${seat} seat left`;
  return label;
}

// The course's description, or "No description yet." ONLY when it is
// null or undefined. An empty string "" is a real value and is kept.
export function descriptionOrDefault(course) {
  const descp = course.description;
  return descp??"No description yet."
}

// "3 in planner" for a positive count, and null (not 0, not "") for zero.
export function plannerBadge(count) {
  const label = count>0 ?`${count} in planner`: null;
  return label
}
