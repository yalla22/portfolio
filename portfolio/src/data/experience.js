// Career + education records. `experience` is ordered chronologically
// (oldest → newest) so the Timeline rail reads Education → Rooman → Marut.
// `icon` maps each entry to a kind glyph in the Timeline (graduation / cpu / drone).
// `kind` drives the WORK / EDU chip; "milestone" entries tie projects to a period.
export const experience = [
  {
    id: "narayana",
    kind: "education",
    icon: "graduation",
    role: "Intermediate (MPC)",
    org: "Narayana Junior College, Hyderabad",
    period: "Jun 2019 — Mar 2021",
    detail: "96%.",
  },
  {
    id: "svce",
    kind: "education",
    icon: "graduation",
    role: "B.Tech, Computer Science (AI & ML)",
    org: "Sri Venkateswara College of Engineering, Tirupati",
    period: "Dec 2021 — May 2025",
    detail: "CGPA 8.6.",
  },
  {
    id: "rooman",
    kind: "work",
    icon: "cpu",
    role: "Machine Learning Intern",
    org: "Rooman Technologies",
    period: "Jan 2025 — Mar 2025",
    detail:
      "Built ML solutions for healthcare; developed and evaluated a sleep-disorder classification model on physiological and behavioral data, achieving 98% accuracy.",
  },
  {
    id: "marut",
    kind: "work",
    icon: "drone",
    role: "Software Engineer Trainee",
    org: "Marut Drones",
    period: "Feb 2026 — Present",
    detail:
      "Software engineer on the drone AI / automation team — shipping production computer-vision detection services, geospatial backend features, and autonomous-flight tooling.",
  },
];

// Convenience alias for the Timeline component (same ordered array).
export const timeline = experience;

export const certs = [
  {
    id: "cs50p",
    title: "CS50's Introduction to Programming with Python",
    issuer: "Harvard University Online",
  },
  {
    id: "sql",
    title: "Databases: Topics in SQL",
    issuer: "Stanford Online",
  },
];
