import type { Channel, Student } from "./types"

// Helper function to create a date in the past
const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// Helper function to create a date with specific hours ago
const hoursAgo = (hours: number) => {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date
}

// Helper function to create a date with specific minutes ago
const minutesAgo = (minutes: number) => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - minutes)
  return date
}

// Mock channels data
export const mockChannels: Channel[] = [
  {
    id: "channel-1",
    name: "Web Development Fundamentals",
    avatar: "/abstract-geometric-shapes.png",
    description: "Learn the basics of HTML, CSS, and JavaScript",
    unreadCount: 3,
    messages: [
      {
        id: "msg-1",
        content:
          "Welcome to the Web Development Fundamentals channel! This is where we'll discuss all course-related topics.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(5),
        status: "read",
      },
      {
        id: "msg-2",
        content: "Hi everyone! I'm excited to learn web development!",
        sender: {
          id: "student-1",
          name: "Alex Johnson",
          avatar: "/abstract-aj.png",
        },
        timestamp: daysAgo(5),
        status: "read",
      },
      {
        id: "msg-3",
        content: "Just a reminder that your first assignment is due this Friday.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(3),
        status: "read",
      },
      {
        id: "msg-4",
        content: "Professor, could you clarify the requirements for the CSS portion?",
        sender: {
          id: "student-2",
          name: "Sarah Lee",
        },
        timestamp: daysAgo(2),
        status: "read",
      },
      {
        id: "msg-5",
        content:
          "Sure, Sarah! For the CSS portion, you need to style the HTML page using external CSS. Make sure to use at least 3 different selectors and demonstrate responsive design with media queries.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(2),
        status: "read",
      },
      {
        id: "msg-6",
        content: "I'm having trouble with the JavaScript part. Can anyone help?",
        sender: {
          id: "student-3",
          name: "David Kim",
        },
        timestamp: hoursAgo(5),
        status: "read",
      },
      {
        id: "msg-7",
        content: "What specific issue are you having with JavaScript, David?",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: hoursAgo(4),
        status: "read",
      },
      {
        id: "msg-8",
        content: "I can't get my event listeners to work properly.",
        sender: {
          id: "student-3",
          name: "David Kim",
        },
        timestamp: hoursAgo(3),
        status: "read",
      },
      {
        id: "msg-9",
        content:
          "Make sure you're adding the event listeners after the DOM has loaded. Try using DOMContentLoaded or placing your script at the end of the body.",
        sender: {
          id: "student-1",
          name: "Alex Johnson",
          avatar: "/abstract-aj.png",
        },
        timestamp: hoursAgo(2),
        status: "read",
      },
      {
        id: "msg-10",
        content:
          "That's correct, Alex! David, also check that you're using the correct selector to find your elements.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: minutesAgo(45),
        status: "delivered",
      },
    ],
    lastMessage: {
      id: "msg-10",
      content: "That's correct, Alex! David, also check that you're using the correct selector to find your elements.",
      sender: {
        id: "instructor",
        name: "Instructor",
        avatar: "/diverse-classroom-instructor.png",
      },
      timestamp: minutesAgo(45),
      status: "delivered",
    },
  },
  {
    id: "channel-2",
    name: "Advanced React Patterns",
    avatar: "/abstract-geometric-dk.png",
    description: "Master advanced React concepts and patterns",
    unreadCount: 0,
    messages: [
      {
        id: "msg-1",
        content: "Welcome to the Advanced React Patterns channel! Here we'll dive deep into React's advanced features.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(10),
        status: "read",
      },
      {
        id: "msg-2",
        content:
          "I've been studying the render props pattern, but I'm still confused about when to use it versus hooks.",
        sender: {
          id: "student-4",
          name: "Emily Chen",
        },
        timestamp: daysAgo(9),
        status: "read",
      },
      {
        id: "msg-3",
        content:
          "Great question, Emily! Render props are useful when you need to share behavior between components, while hooks are generally simpler for reusing stateful logic. We'll cover this in detail in tomorrow's lecture.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(9),
        status: "read",
      },
      {
        id: "msg-4",
        content: "Has anyone implemented the context API exercise yet? I'm getting a strange error.",
        sender: {
          id: "student-5",
          name: "Michael Brown",
        },
        timestamp: daysAgo(3),
        status: "read",
      },
    ],
    lastMessage: {
      id: "msg-4",
      content: "Has anyone implemented the context API exercise yet? I'm getting a strange error.",
      sender: {
        id: "student-5",
        name: "Michael Brown",
      },
      timestamp: daysAgo(3),
      status: "read",
    },
  },
  {
    id: "channel-3",
    name: "Node.js Backend Development",
    avatar: "/abstract-southwest.png",
    description: "Build scalable backend services with Node.js",
    unreadCount: 5,
    messages: [
      {
        id: "msg-1",
        content: "Welcome to the Node.js Backend Development channel!",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(7),
        status: "read",
      },
      {
        id: "msg-2",
        content: "I'm having trouble setting up MongoDB with my Node.js application. Any tips?",
        sender: {
          id: "student-6",
          name: "James Wilson",
        },
        timestamp: hoursAgo(12),
        status: "read",
      },
      {
        id: "msg-3",
        content:
          "Make sure you have the correct connection string and that MongoDB is running. Check if you've installed mongoose correctly.",
        sender: {
          id: "student-7",
          name: "Olivia Martinez",
        },
        timestamp: hoursAgo(11),
        status: "read",
      },
      {
        id: "msg-4",
        content:
          "Also, don't forget to handle connection errors properly. Here's a snippet that might help: ```js\nmongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })\n  .then(() => console.log('Connected to MongoDB'))\n  .catch(err => console.error('Could not connect to MongoDB', err));\n```",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: hoursAgo(10),
        status: "read",
      },
      {
        id: "msg-5",
        content: "Thanks! That fixed my issue.",
        sender: {
          id: "student-6",
          name: "James Wilson",
        },
        timestamp: hoursAgo(9),
        status: "read",
      },
    ],
    lastMessage: {
      id: "msg-5",
      content: "Thanks! That fixed my issue.",
      sender: {
        id: "student-6",
        name: "James Wilson",
      },
      timestamp: hoursAgo(9),
      status: "read",
    },
  },
]

// Mock students data
export const mockStudents: Student[] = [
  {
    id: "student-1",
    name: "Alex Johnson",
    avatar: "/abstract-aj.png",
    email: "alex.johnson@example.com",
    status: "online",
    unreadCount: 0,
    messages: [
      {
        id: "msg-1",
        content: "Hi Alex, I noticed you did really well on the last assignment. Great job!",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(2),
        status: "read",
      },
      {
        id: "msg-2",
        content: "Thank you! I've been putting in extra time to understand the concepts.",
        sender: {
          id: "student-1",
          name: "Alex Johnson",
          avatar: "/abstract-aj.png",
        },
        timestamp: daysAgo(2),
        status: "read",
      },
      {
        id: "msg-3",
        content: "It shows! Do you have any questions about the upcoming project?",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(1),
        status: "read",
      },
      {
        id: "msg-4",
        content: "Actually, yes. I was wondering if we could use external libraries for the data visualization part?",
        sender: {
          id: "student-1",
          name: "Alex Johnson",
          avatar: "/abstract-aj.png",
        },
        timestamp: hoursAgo(23),
        status: "read",
      },
      {
        id: "msg-5",
        content:
          "Yes, you can use D3.js or Chart.js for the visualization. Just make sure to document which libraries you're using and why.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: hoursAgo(22),
        status: "read",
      },
    ],
    lastMessage: {
      id: "msg-5",
      content:
        "Yes, you can use D3.js or Chart.js for the visualization. Just make sure to document which libraries you're using and why.",
      sender: {
        id: "instructor",
        name: "Instructor",
        avatar: "/diverse-classroom-instructor.png",
      },
      timestamp: hoursAgo(22),
      status: "read",
    },
  },
  {
    id: "student-2",
    name: "Sarah Lee",
    email: "sarah.lee@example.com",
    status: "offline",
    unreadCount: 1,
    messages: [
      {
        id: "msg-1",
        content: "Hi Sarah, I noticed you missed the last class. Is everything okay?",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(3),
        status: "read",
      },
      {
        id: "msg-2",
        content: "Hi Professor, I had a doctor's appointment. I'll catch up on the material this weekend.",
        sender: {
          id: "student-2",
          name: "Sarah Lee",
        },
        timestamp: daysAgo(3),
        status: "read",
      },
      {
        id: "msg-3",
        content: "No problem, Sarah. Let me know if you need any help with the material we covered.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(3),
        status: "read",
      },
      {
        id: "msg-4",
        content:
          "I've uploaded the lecture notes and slides to the course portal. You can find them in the Week 5 folder.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: minutesAgo(30),
        status: "delivered",
      },
    ],
    lastMessage: {
      id: "msg-4",
      content:
        "I've uploaded the lecture notes and slides to the course portal. You can find them in the Week 5 folder.",
      sender: {
        id: "instructor",
        name: "Instructor",
        avatar: "/diverse-classroom-instructor.png",
      },
      timestamp: minutesAgo(30),
      status: "delivered",
    },
  },
  {
    id: "student-3",
    name: "David Kim",
    email: "david.kim@example.com",
    status: "away",
    unreadCount: 2,
    messages: [
      {
        id: "msg-1",
        content: "David, I wanted to discuss your midterm project proposal.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(5),
        status: "read",
      },
      {
        id: "msg-2",
        content: "Sure, what would you like to discuss?",
        sender: {
          id: "student-3",
          name: "David Kim",
        },
        timestamp: daysAgo(5),
        status: "read",
      },
      {
        id: "msg-3",
        content:
          "I think your idea has potential, but the scope might be too large for the timeframe. Could you narrow it down a bit?",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(4),
        status: "read",
      },
      {
        id: "msg-4",
        content: "I see your point. I'll revise the proposal and focus on the core features.",
        sender: {
          id: "student-3",
          name: "David Kim",
        },
        timestamp: daysAgo(4),
        status: "read",
      },
      {
        id: "msg-5",
        content: "Just checking in - have you had a chance to revise your proposal?",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: hoursAgo(5),
        status: "delivered",
      },
      {
        id: "msg-6",
        content: "Also, don't forget that the final version is due this Friday.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: hoursAgo(1),
        status: "sent",
      },
    ],
    lastMessage: {
      id: "msg-6",
      content: "Also, don't forget that the final version is due this Friday.",
      sender: {
        id: "instructor",
        name: "Instructor",
        avatar: "/diverse-classroom-instructor.png",
      },
      timestamp: hoursAgo(1),
      status: "sent",
    },
  },
  {
    id: "student-4",
    name: "Emily Chen",
    email: "emily.chen@example.com",
    status: "online",
    unreadCount: 0,
    messages: [
      {
        id: "msg-1",
        content:
          "Emily, I was impressed by your presentation yesterday. You explained the complex concepts very clearly.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(1),
        status: "read",
      },
      {
        id: "msg-2",
        content: "Thank you! I spent a lot of time preparing for it.",
        sender: {
          id: "student-4",
          name: "Emily Chen",
        },
        timestamp: daysAgo(1),
        status: "read",
      },
      {
        id: "msg-3",
        content: "It showed. Have you considered applying for the teaching assistant position next semester?",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: daysAgo(1),
        status: "read",
      },
      {
        id: "msg-4",
        content: "I hadn't thought about it, but I'd definitely be interested!",
        sender: {
          id: "student-4",
          name: "Emily Chen",
        },
        timestamp: hoursAgo(20),
        status: "read",
      },
      {
        id: "msg-5",
        content: "Great! I'll send you the application details later today.",
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: hoursAgo(19),
        status: "read",
      },
    ],
    lastMessage: {
      id: "msg-5",
      content: "Great! I'll send you the application details later today.",
      sender: {
        id: "instructor",
        name: "Instructor",
        avatar: "/diverse-classroom-instructor.png",
      },
      timestamp: hoursAgo(19),
      status: "read",
    },
  },
]
