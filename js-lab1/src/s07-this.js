// Section 07 — this

export class PlannerList {
  constructor(owner) {
    this.owner = owner;
    this.ids = [];

    // Bind add() to the current object
    this.add = this.add.bind(this);
  }

  add(id) {
    this.ids.push(id);
  }

  describe() {
    return `${this.owner} has ${this.ids.length} course(s) planned`;
  }
}