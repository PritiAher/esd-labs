
// JS Lab 2 — the course browser.
// Run it:  npm run web   → open http://localhost:5500/web/
//
// The shape of the whole app, in three lines:
//   an EVENT happens  →  transition(state, event) gives the NEXT STATE  →  render() draws it.
// Nothing else changes the page. Follow sections 07–09 of the lab doc.
import { useState } from "../src/state.js";
import { initialState, transition } from "../src/s05-store.js";
import { cardView, summaryView, statusView, sgpaView, GRADE_POINTS } from "../src/s06-views.js";
import { fetchCourses } from "../src/s04-api.js";
import { createLatestOnly, debounce } from "../src/s09-latest.js";

const $ = (selector) => document.querySelector(selector);
const els = {
  search: $("#search"),
  departments: $("#departments"),
  status: $("#status"),
  retry: $("#retry"),
  courses: $("#courses"),
  summary: $("#summary"),
  planned: $("#planned"),
  sgpaForm: $("#sgpa-form"),
  sgpa: $("#sgpa"),
  network: $("#network"),
};

// ---------------------------------------------------------------------------
// GIVEN — the network switch in the header. It adds the local API's
// delay/fail options to every request, so you can see slow, out-of-order and
// failing responses on purpose.
// ---------------------------------------------------------------------------
const NETWORK = {
  normal: "",
  slow: "delay=1500",
  random: "delay=random",
  failing: "fail=1"
};

let network = "normal";

const fetchWithNetwork = (url) =>
  fetch(
    NETWORK[network]
      ? `${url}${url.includes("?") ? "&" : "?"}${NETWORK[network]}`
      : url
  );

els.network.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-network]");
  if (!button) return;

  network = button.dataset.network;

  for (const b of els.network.querySelectorAll("button")) {
    b.setAttribute("aria-pressed", String(b === button));
  }
});

// ---------------------------------------------------------------------------
// GIVEN — one function per region of the page. Each one takes the state and
// redraws ONLY its own region. (Building elements by hand was JS Lab 1.)
// ---------------------------------------------------------------------------
function renderDepartments(state) {
  const names = ["", ...state.departments];

  els.departments.replaceChildren(
    ...names.map((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.department = name;
      button.textContent = name || "All";
      button.setAttribute(
        "aria-pressed",
        String(name === state.department)
      );
      return button;
    })
  );
}

function renderStatus(state) {
  const { message, showRetry } = statusView(state);

  els.status.textContent = message;
  els.retry.hidden = !showRetry;
}

function renderCourses(state) {
  els.courses.replaceChildren(
    ...state.courses.map((course) => {
      const view = cardView(course, state.planner);

      const item = document.createElement("li");
      item.className = view.inPlanner ? "card in-planner" : "card";

      const heading = document.createElement("h3");
      heading.textContent = view.heading;

      const meta = document.createElement("p");
      meta.textContent = view.meta;

      const seats = document.createElement("p");
      seats.className = view.seats === "Full" ? "seats full" : "seats";
      seats.textContent = view.seats;

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.id = view.id;
      button.dataset.inPlanner = String(view.inPlanner);
      button.textContent = view.buttonLabel;
      button.disabled = view.disabled;

      item.append(heading, meta, seats, button);

      return item;
    })
  );
}

function renderPlanner(state) {
  const summary = summaryView(state.planner);

  els.summary.textContent = summary.overLimit
    ? `${summary.text} — over the 24-credit limit`
    : summary.text;

  els.summary.classList.toggle("over", summary.overLimit);

  if (state.planner.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Add courses from the list to grade them here.";

    els.planned.replaceChildren(empty);
    return;
  }

  els.planned.replaceChildren(
    ...state.planner.map((course) => {
      const item = document.createElement("li");

      const label = document.createElement("span");
      label.textContent = `${course.code} · ${course.credits} cr`;

      const select = document.createElement("select");
      select.dataset.id = course.id;
      select.setAttribute(
        "aria-label",
        `Expected grade for ${course.code}`
      );

      select.append(
        new Option("Grade…", ""),
        ...Object.keys(GRADE_POINTS).map(
          (grade) => new Option(grade, grade)
        )
      );

      select.value = state.grades[course.id] ?? "";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove";
      remove.dataset.remove = course.id;
      remove.setAttribute("aria-label", `Remove ${course.code}`);
      remove.textContent = "✕";

      item.append(label, select, remove);

      return item;
    })
  );
}

function renderSgpa(state) {
  els.sgpa.textContent = sgpaView(
    state.planner,
    state.grades
  ).text;
}

// ---------------------------------------------------------------------------
// Step 1 (section 07) — the state, and the ONLY way to change it.
// ---------------------------------------------------------------------------
let prevState = null;

const [getState, setState] = useState(initialState, render);

const dispatch = (event) =>
  setState((state) => transition(state, event));

// ---------------------------------------------------------------------------
// Step 2 (sections 07 and 08) — render(): draw the state.
// Selective redraw: updates a region only when its slice of state changes.
// ---------------------------------------------------------------------------
function render() {
  const state = getState();

  if (
    !prevState ||
    prevState.departments !== state.departments ||
    prevState.department !== state.department
  ) {
    renderDepartments(state);
  }

  if (
    !prevState ||
    prevState.status !== state.status ||
    prevState.courses !== state.courses ||
    prevState.error !== state.error
  ) {
    renderStatus(state);
  }

  if (
    !prevState ||
    prevState.courses !== state.courses ||
    prevState.planner !== state.planner
  ) {
    renderCourses(state);
  }

  if (
    !prevState ||
    prevState.planner !== state.planner ||
    prevState.grades !== state.grades
  ) {
    renderPlanner(state);
  }

  if (
    !prevState ||
    prevState.planner !== state.planner ||
    prevState.grades !== state.grades
  ) {
    renderSgpa(state);
  }

  prevState = state;
}

// ---------------------------------------------------------------------------
// Step 3 (sections 07 and 09) — load(): fetch the courses for the current filters.
// Section 09: createLatestOnly ensures only the latest request updates the UI.
// ---------------------------------------------------------------------------
const latestFetch = createLatestOnly();

async function load() {
  dispatch({ type: "LOAD_START" });

  const { query, department } = getState();

  try {
    const result = await latestFetch(
      fetchCourses(
        { department, q: query },
        fetchWithNetwork
      )
    );

    // Ignore an older request if a newer request has started.
    if (result.stale) return;

    // fetchCourses returns the parsed response from the API.
    dispatch({
      type: "LOAD_OK",
      courses: result.value
    });

  } catch (err) {
    dispatch({
      type: "LOAD_FAIL",
      error: err.message || "Failed to load courses"
    });
  }
}

// Debounce input searches for a smoother live typing experience.
const debouncedLoad = debounce(load, 300);

// ---------------------------------------------------------------------------
// Step 4 (section 07) — event listeners using event delegation.
// ---------------------------------------------------------------------------

// Search box input
els.search.addEventListener("input", (event) => {
  dispatch({
    type: "SET_QUERY",
    query: event.target.value
  });

  debouncedLoad();
});

// Department filter buttons
els.departments.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-department]");
  if (!button) return;

  dispatch({
    type: "SET_DEPARTMENT",
    department: button.dataset.department
  });

  load();
});

// Course list buttons (Add/Remove)
els.courses.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  const courseId = button.dataset.id;
  const state = getState();

  // Compare IDs as strings because dataset values are always strings.
  const course = state.courses.find(
    (c) => String(c.id) === courseId
  );

  if (!course) return;

  if (button.dataset.inPlanner === "true") {
    dispatch({
      type: "REMOVE",
      id: course.id
    });
  } else {
    dispatch({
      type: "ADD",
      course
    });
  }
});

// Planner grade dropdowns
els.planned.addEventListener("change", (event) => {
  const select = event.target.closest("select[data-id]");
  if (!select) return;

  const course = getState().planner.find(
    (c) => String(c.id) === select.dataset.id
  );

  if (!course) return;

  dispatch({
    type: "SET_GRADE",
    id: course.id,
    grade: select.value
  });
});

// Planner remove buttons
els.planned.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-remove]");
  if (!button) return;

  const course = getState().planner.find(
    (c) => String(c.id) === button.dataset.remove
  );

  if (!course) return;

  dispatch({
    type: "REMOVE",
    id: course.id
  });
});

// Retry button on failure
els.retry.addEventListener("click", () => {
  load();
});

// Prevent form submission on Enter
els.sgpaForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

// ---------------------------------------------------------------------------
// Start: draw once, then load initial data.
// ---------------------------------------------------------------------------
render();
load();
