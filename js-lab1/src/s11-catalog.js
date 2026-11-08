import { toCardView } from "./s04-functions.js";
import { byField } from "./s05-higher-order.js";

export function byDepartment(courses, department) {
  return courses.filter(
    c => c.department.toLowerCase() === department.toLowerCase()
  );
}

export function openOnly(courses) {
  return courses.filter(c => c.seatsLeft > 0);
}

export function searchCourses(courses, query) {
  const q = query.trim().toLowerCase();

  if (q === "") return courses;

  return courses.filter(c =>
    c.code.toLowerCase().includes(q) ||
    c.title.toLowerCase().includes(q)
  );
}

export function findByCode(courses, code) {
  return courses.find(
    c => c.code.toLowerCase() === code.toLowerCase()
  );
}

export function totalCredits(courses) {
  return courses.reduce((sum, c) => sum + c.credits, 0);
}

export function countByDepartment(courses) {
  return courses.reduce((acc, c) => {
    acc[c.department] = (acc[c.department] || 0) + 1;
    return acc;
  }, {});
}

export function departments(courses) {
  return [...new Set(courses.map(c => c.department))].sort();
}

export function sortedBy(courses, field) {
  return [...courses].sort(byField(field));
}

export function anyFull(courses) {
  return courses.some(c => c.seatsLeft <= 0);
}

export function allHaveSeats(courses, n = 1) {
  return courses.every(c => c.seatsLeft >= n);
}

export function courseCards(courses, department) {
  return courses
    .filter(c =>
      c.department.toLowerCase() === department.toLowerCase()
    )
    .filter(c => c.seatsLeft > 0)
    .sort(byField("code"))
    .map(toCardView);
}

export function plannerCourses(planner, courses) {
  return planner
    .map(id => courses.find(c => c.id === id))
    .filter(c => c !== undefined);
}

export function plannerCredits(planner, courses) {
  return totalCredits(plannerCourses(planner, courses));
}

export function canAdd(planner, courses, courseId, limit = 24) {
  const course = courses.find(c => c.id === courseId);

  if (!course) return false;
  if (course.seatsLeft <= 0) return false;
  if (planner.includes(courseId)) return false;

  return plannerCredits(planner, courses) + course.credits <= limit;
}