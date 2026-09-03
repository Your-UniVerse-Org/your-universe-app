import { FIGMA_ASSETS } from "./figma-assets";

export type OnboardingStep =
  | { kind: "intro" }
  | { kind: "grade"; progress: 1 }
  | { kind: "strengths"; progress: 2; multi: true; min: 3; max: 5 }
  | { kind: "priorities"; progress: 3; multi: true }
  | { kind: "careers"; progress: 4; multi: false }
  | { kind: "pathway"; progress: 5; multi: false }
  | { kind: "summary"; progress: 6 };

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { kind: "intro" },
  { kind: "grade", progress: 1 },
  { kind: "strengths", progress: 2, multi: true, min: 3, max: 5 },
  { kind: "priorities", progress: 3, multi: true },
  { kind: "careers", progress: 4, multi: false },
  { kind: "pathway", progress: 5, multi: false },
  { kind: "summary", progress: 6 },
];

export const GRADE_OPTIONS = [
  { id: "9", num: "9", label: "Grade 9" },
  { id: "10", num: "10", label: "Grade 10" },
  { id: "11", num: "11", label: "Grade 11" },
  { id: "12", num: "12", label: "Grade 12" },
];

export const STRENGTH_OPTIONS = [
  "Problem Solving",
  "Creativity",
  "Communication",
  "Leadership",
  "Time Management",
  "Analysis",
  "Teamwork",
  "Tech Savvy",
  "Adaptability",
];

export const PRIORITY_OPTIONS = [
  "Affordable Fees",
  "Location",
  "Reputation",
  "Course Variety",
  "Student Life",
  "Career Support",
  "Facilities",
  "Diversity",
];

export const CAREER_OPTIONS = [
  { id: "tech", title: "Technology", desc: "Software, AI, data science, and hardware engineering." },
  { id: "health", title: "Healthcare", desc: "Medicine, nursing, therapy, and public health." },
  { id: "business", title: "Business", desc: "Management, finance, marketing, and entrepreneurship." },
  { id: "arts", title: "Arts & Design", desc: "Graphic design, fine arts, writing, and multimedia." },
];

export const PATHWAY_OPTIONS = [
  { id: "university", title: "University", desc: "Degree programmes at public universities." },
  { id: "tvet", title: "TVET College", desc: "Vocational and technical qualifications." },
  { id: "private", title: "Private College", desc: "Specialised private institutions." },
];

export const INTRO_CAROUSEL = [
  {
    title: "Discover what you're capable of and start building your future.",
    image: FIGMA_ASSETS.onboarding.carousel1,
  },
  {
    title: "Your future starts with understanding where you belong.",
    image: FIGMA_ASSETS.onboarding.carousel2,
  },
  {
    title: "From dreams to acceptance your journey starts here.",
    image: FIGMA_ASSETS.onboarding.carousel3,
  },
] as const;
