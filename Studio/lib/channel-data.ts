export interface Channel {
  id: number
  title: string
  description: string
  status: "published" | "draft"
  studentsEnrolled: number
  updatedAt: string
  stats: {
    sections: number
    lessons: number
    units: number
    quizzes: number
  }
}

// Mock data for channels
export const channels: Channel[] = [
  {
    id: 1,
    title: "Web Development Fundamentals",
    description: "Learn the basics of HTML, CSS, and JavaScript",
    status: "published",
    studentsEnrolled: 342,
    updatedAt: "2023-10-20",
    stats: {
      sections: 4,
      lessons: 24,
      units: 6,
      quizzes: 8,
    },
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    description: "Master advanced React concepts and patterns",
    status: "published",
    studentsEnrolled: 215,
    updatedAt: "2023-11-15",
    stats: {
      sections: 6,
      lessons: 32,
      units: 8,
      quizzes: 12,
    },
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    description: "Build scalable backend services with Node.js",
    status: "draft",
    studentsEnrolled: 0,
    updatedAt: "2023-12-05",
    stats: {
      sections: 5,
      lessons: 28,
      units: 7,
      quizzes: 10,
    },
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    description: "Create beautiful and functional user interfaces",
    status: "published",
    studentsEnrolled: 178,
    updatedAt: "2024-01-10",
    stats: {
      sections: 3,
      lessons: 18,
      units: 5,
      quizzes: 6,
    },
  },
  {
    id: 5,
    title: "Data Science with Python",
    description: "Learn data analysis, visualization, and machine learning",
    status: "published",
    studentsEnrolled: 423,
    updatedAt: "2024-02-15",
    stats: {
      sections: 7,
      lessons: 42,
      units: 9,
      quizzes: 14,
    },
  },
  {
    id: 6,
    title: "Mobile App Development with Flutter",
    description: "Build cross-platform mobile apps with Flutter and Dart",
    status: "published",
    studentsEnrolled: 287,
    updatedAt: "2024-01-28",
    stats: {
      sections: 6,
      lessons: 36,
      units: 8,
      quizzes: 12,
    },
  },
  {
    id: 7,
    title: "DevOps and CI/CD Pipelines",
    description: "Master continuous integration and deployment workflows",
    status: "draft",
    studentsEnrolled: 0,
    updatedAt: "2024-03-05",
    stats: {
      sections: 5,
      lessons: 30,
      units: 7,
      quizzes: 9,
    },
  },
  {
    id: 8,
    title: "Blockchain Development",
    description: "Learn to build decentralized applications and smart contracts",
    status: "published",
    studentsEnrolled: 156,
    updatedAt: "2024-02-10",
    stats: {
      sections: 4,
      lessons: 26,
      units: 6,
      quizzes: 8,
    },
  },
]
