// Section 10 — Immutable updates (the planner)

// Add an id. If it is already there, return the SAME array.
export function addToPlanner(planner, courseId) {
  if (planner.includes(courseId)) {
    return planner;
  }

  return [...planner, courseId];
}

// Remove an id. If it is not there, return the SAME array.
export function removeFromPlanner(planner, courseId) {
  if (!planner.includes(courseId)) {
    return planner;
  }

  return planner.filter(id => id !== courseId);
}

// Return a new course object with some fields changed.
export function updateCourse(course, changes) {
  return {
    ...course,
    ...changes
  };
}

// Return a new list where the matching course has one fewer seat.
export function takeSeat(courses, courseId) {
  const course = courses.find(c => c.id === courseId);

  // Course doesn't exist or has no seats left
  if (!course || course.seatsLeft <= 0) {
    return courses;
  }

  // Create a new array and a new object only for the matching course
  return courses.map(c =>
    c.id === courseId
      ? { ...c, seatsLeft: c.seatsLeft - 1 }
      : c
  );
}