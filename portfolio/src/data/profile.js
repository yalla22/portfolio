export const profile = {
  name: "Janadri Yalla Yashwanth",
  shortName: "JYY",
  role: "Software Engineer Trainee @ Marut Drones",
  heroRole: "Software Engineer — Full-Stack · AI/ML",
  tagline:
    "I build production AI systems for drones & geospatial analysis — computer vision, autonomous flight, FastAPI backends.",
  subline:
    "Software Engineer Trainee @ Marut Drones · B.Tech CSE (AI & ML), CGPA 8.6 · open to roles, immediate joiner.",
  location: "Hyderabad, India",
  coords: { lat: "17.3850° N", lng: "78.4867° E", label: "HYDERABAD, IN" },
  email: "yallayashwanth99@gmail.com",
  phone: "+91 8790819924",
  github: "https://github.com/yalla22",
  linkedin:
    "https://www.linkedin.com/in/janadri-yalla-yashwanth-9579b5306/",
  resume: "/resume.pdf", // TODO: drop the real PDF into public/resume.pdf
  photo: "/profile.jpg", // TODO: drop the real photo into public/profile.jpg
  availability: "Open to roles · Immediate joiner",
  bio: [
    "I'm a software engineer trainee at Marut Drones working on the AI and automation team, where I ship production computer-vision detection services, geospatial backend features, and autonomous-flight tooling. My focus is turning raw drone and aerial imagery into measurable geospatial insight — building footprints, tree crowns, stockpile volumes, and elevation-aware analysis.",
    "I graduated with a B.Tech in Computer Science (AI & ML) from Sri Venkateswara College of Engineering, Tirupati, with a CGPA of 8.6. I'm equally at home writing a from-scratch binary log parser, deploying GPU/CPU workers behind a FastAPI backend, or putting a Raspberry Pi companion computer on a drone to land it on an AprilTag. Calm engineering, shipped systems.",
  ],
};

export const socials = [
  { id: "github", label: "GitHub", href: profile.github, icon: "github" },
  { id: "linkedin", label: "LinkedIn", href: profile.linkedin, icon: "linkedin" },
  { id: "mail", label: "Email", href: `mailto:${profile.email}`, icon: "mail" },
];

export const navSections = [
  { id: "work", index: "01", label: "Work" },
  { id: "showcase", index: "02", label: "Showcase" },
  { id: "stack", index: "03", label: "Stack" },
  { id: "path", index: "04", label: "Path" },
  { id: "about", index: "05", label: "About" },
  { id: "contact", index: "06", label: "Contact" },
];

// Hero stat tiles — folded in from the deleted Snapshot section.
// Tile 1 count-ups the number; tiles 2–4 are label-only with an icon kicker.
export const heroStats = [
  {
    id: "shipped",
    value: 5,
    suffix: "",
    count: true,
    decimals: 0,
    label: "Drone & AI Systems Built",
    icon: null,
  },
  {
    id: "cv",
    value: null,
    count: false,
    label: "Computer Vision & GeoAI",
    icon: "cpu",
  },
  {
    id: "be",
    value: null,
    count: false,
    label: "FastAPI Backend Engineer",
    icon: "layers",
  },
  {
    id: "flight",
    value: null,
    count: false,
    label: "Autonomous Flight Systems",
    icon: "drone",
  },
];
