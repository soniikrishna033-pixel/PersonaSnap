export const quizzes = [
  {
    id: 'attachment-style',
    title: "What's Your Attachment Style?",
    category: 'Personality',
    emoji: '💚',
    xp: 150,
    timer: false,
    questions: [
      { text: "When a partner asks for space, how do you react?", options: ["I give it to them", "I get anxious and clingy", "I push them away first", "I don't care"], answer: 0 },
      { text: "How do you handle conflict?", options: ["Talk it out calmly", "Cry and blame myself", "Shut down and ignore", "Yell"], answer: 0 }
    ],
    results: {
      0: { title: "Secure Attachment", desc: "You are emotionally balanced and comfortable with love.", trait: "Balanced" }
    }
  },
  {
    id: 'red-flag',
    title: "Are You a Red Flag? 🚩",
    category: 'Personality',
    emoji: '🚩',
    xp: 100,
    timer: false,
    questions: [
      { text: "Do you text your ex?", options: ["Never", "Sometimes", "Only on birthdays", "We are besties"], answer: 0 }
    ]
  },
  {
    id: 'overthinker',
    title: "What Type of Overthinker Are You?",
    category: 'Personality',
    emoji: '🌀',
    xp: 100,
    timer: false,
    questions: [
      { text: "When someone says 'we need to talk'...", options: ["I assume I'm fired", "I think they are breaking up", "I wonder what it's about", "I mentally prepare to argue"], answer: 0 }
    ]
  },
  {
    id: 'us-city',
    title: "Which US City Should You Live In?",
    category: 'Personality',
    emoji: '🏙️',
    xp: 120,
    timer: false,
    questions: [
      { text: "Pick a weather preference:", options: ["Sunny always", "Four seasons", "Rainy and moody", "Snowy"], answer: 0 }
    ]
  },
  {
    id: 'love-language',
    title: "What's Your Love Language?",
    category: 'Personality',
    emoji: '💌',
    xp: 120,
    timer: false,
    questions: [
      { text: "The best gift is...", options: ["A hug", "A handmade card", "Help with chores", "Quality time"], answer: 0 }
    ]
  },
  {
    id: 'iq-estimator',
    title: "IQ Estimator Test",
    category: 'IQ & Logic',
    emoji: '🧠',
    xp: 200,
    timer: true,
    timerDuration: 180, // 3 minutes total
    timerText: "3 mins",
    questions: [
      { text: "Which number comes next? 2, 4, 8, 16...", options: ["24", "32", "64", "18"], answer: 1 },
      { text: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops Lazzies?", options: ["Yes", "No", "Cannot be determined", "Sometimes"], answer: 0 }
    ]
  },
  {
    id: '5th-grader',
    title: "Are You Smarter Than a 5th Grader?",
    category: 'IQ & Logic',
    emoji: '🎒',
    xp: 150,
    timer: true,
    timerDuration: 180,
    timerText: "3 mins",
    questions: [
      { text: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2 }
    ]
  },
  {
    id: 'speed-math',
    title: "Speed Math Blitz ⚡",
    category: 'Math Blitz',
    emoji: '🔢',
    xp: 180,
    timer: true,
    timerPerQuestion: 10,
    timerText: "10s / Q",
    questions: [
      { text: "15 × 4 = ?", options: ["45", "60", "55", "70"], answer: 1 },
      { text: "144 ÷ 12 = ?", options: ["10", "11", "12", "14"], answer: 2 }
    ]
  },
  {
    id: 'spell-bee',
    title: "Can You Spell These 10 Words?",
    category: 'Spell Bee',
    emoji: '🐝',
    xp: 120,
    timer: true,
    timerPerQuestion: 15,
    timerText: "15s / Q",
    questions: [
      { text: "Which spelling is correct?", options: ["Definately", "Definitely", "Definitly", "Definately"], answer: 1 }
    ]
  },
  {
    id: 'logic-puzzle',
    title: "Logic Puzzle Master 🧩",
    category: 'Puzzle',
    emoji: '🧩',
    xp: 250,
    timer: true,
    timerDuration: 240,
    timerText: "4 mins",
    questions: [
      { text: "A man is looking at a photograph of someone. His friend asks who it is. The man replies, “Brothers and sisters, I have none. But that man’s father is my father’s son.” Who is in the photograph?", options: ["His son", "Himself", "His father", "His uncle"], answer: 0 }
    ]
  }
];
