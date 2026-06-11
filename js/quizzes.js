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
  },
  {
    id: 'math-word-problems',
    title: "Math Word Problems 🧮",
    category: 'Math Blitz',
    emoji: '🧮',
    xp: 300,
    timer: true,
    timerDuration: 1800,
    timerText: "30 mins",
    questions: [
      { text: "A farm has 40 animals consisting of pigs (4 legs) and chickens (2 legs). Together, they have 112 legs. How many pigs are on the farm?", options: ["16", "20", "24", "12"], answer: 0 },
      { text: "An entomologist is studying a box of 20 insects containing spiders (8 legs) and beetles (6 legs). She counts a total of 136 legs. How many spiders are there?", options: ["10", "8", "12", "6"], answer: 1 },
      { text: "During a basketball game, a player made 30 shots consisting of 2-pointers and 3-pointers, scoring a total of 72 points. How many 2-pointers did they make?", options: ["12", "15", "18", "20"], answer: 2 },
      { text: "A theater sold 50 tickets for a play. Adult tickets cost 10 dollars and child tickets cost 5 dollars. If total revenue was 350 dollars, how many child tickets were sold?", options: ["20", "25", "15", "30"], answer: 3 },
      { text: "A jar contains 20 coins, all dimes (10 cents) and quarters (25 cents), totaling 335 cents. How many quarters are in the jar?", options: ["11", "9", "10", "8"], answer: 1 },
      { text: "A geometry student draws 15 shapes on a page, using only triangles (3 sides) and squares (4 sides). If there are 53 sides in total, how many triangles did they draw?", options: ["8", "5", "7", "10"], answer: 2 },
      { text: "A cashier has 40 bills, consisting only of 5-dollar and 10-dollar bills. The total value is 280 dollars. How many 5-dollar bills are there?", options: ["24", "16", "20", "28"], answer: 0 },
      { text: "A parking lot contains 25 vehicles: cars (4 wheels) and motorcycles (2 wheels). There are 80 wheels in total. How many cars are parked?", options: ["10", "12", "20", "15"], answer: 3 },
      { text: "A test has 20 questions. You earn 4 points for a correct answer and lose 1 point for an incorrect one. If a student scores 60 points answering all questions, how many did they get correct?", options: ["15", "16", "14", "18"], answer: 1 },
      { text: "You buy 30 stamps in a mix of 50-cent and 80-cent denominations. The total cost is 1920 cents. How many 80-cent stamps did you buy?", options: ["16", "12", "14", "15"], answer: 2 },
      { text: "A store sells 18 items consisting of bicycles (2 wheels) and tricycles (3 wheels). There are 41 wheels total. How many bicycles are there?", options: ["13", "5", "9", "10"], answer: 0 },
      { text: "A scout troop sets up 12 tents. Some hold 2 people, others hold 4 people. Exactly 34 people are sleeping in the tents. How many 4-person tents are there?", options: ["7", "5", "6", "4"], answer: 1 },
      { text: "In a 25-question trivia game, you gain 5 points for every correct answer and lose 2 points for every wrong answer. If you score 83 points, how many questions did you get right?", options: ["17", "20", "19", "21"], answer: 2 },
      { text: "A delivery truck carries 20 boxes. The small boxes weigh 5 kg and the large boxes weigh 12 kg. If the total weight is 163 kg, how many large boxes are there?", options: ["11", "10", "8", "9"], answer: 3 },
      { text: "A cafe has 22 tables. Some have 3 legs and some have 4 legs. If there are 79 table legs in total, how many 3-legged tables are there?", options: ["9", "13", "11", "10"], answer: 0 },
      { text: "A baker sells 15 muffins. Plain muffins cost 2 dollars and blueberry muffins cost 5 dollars. The total sales are 51 dollars. How many plain muffins were sold?", options: ["7", "6", "8", "9"], answer: 2 },
      { text: "A pet store has 35 animals (cats and birds). If you count 94 legs among them, how many cats are in the store?", options: ["23", "12", "15", "10"], answer: 1 },
      { text: "A college student is taking 10 courses, which are a mix of 3-credit and 4-credit classes. If they are taking 34 credits total, how many 4-credit classes do they have?", options: ["6", "5", "3", "4"], answer: 3 },
      { text: "You buy 14 pieces of fruit. Apples cost 2 dollars and oranges cost 3 dollars. If you spend 36 dollars, how many apples did you buy?", options: ["6", "8", "7", "5"], answer: 0 },
      { text: "A motel has 40 rooms. Some are single rooms (1 bed) and some are double rooms (2 beds). There are 65 beds in total. How many double rooms are there?", options: ["15", "20", "25", "30"], answer: 2 },
      { text: "You buy 20 writing tools. Pens cost 1.50 dollars and pencils cost 0.50 dollars. You spend 17 dollars. How many pens did you buy?", options: ["13", "7", "10", "8"], answer: 1 },
      { text: "A rental dock has 15 boats. Some fit 2 people and some fit 4 people. They can carry 46 people at max capacity. How many 4-person boats are there?", options: ["7", "9", "6", "8"], answer: 3 },
      { text: "A party orders 12 pizzas. Some are large (8 slices) and some are medium (6 slices). There are 86 slices total. How many large pizzas were ordered?", options: ["7", "5", "6", "8"], answer: 0 },
      { text: "A library buys 25 books. Hardcovers cost 20 dollars and paperbacks cost 10 dollars. The total bill is 330 dollars. How many paperbacks were bought?", options: ["8", "15", "17", "12"], answer: 2 },
      { text: "In a video game, you complete 16 tasks. Minor tasks give 10 points and major tasks give 50 points. You earn 360 points. How many minor tasks did you finish?", options: ["5", "11", "10", "12"], answer: 1 },
      { text: "A florist arranges 10 vases. Small vases hold 5 flowers, large vases hold 8 flowers. Exactly 62 flowers are used. How many large vases are there?", options: ["6", "5", "3", "4"], answer: 3 },
      { text: "A group buys 30 meals. Adult meals are 12 dollars, student meals are 8 dollars. They spend 312 dollars. How many adult meals did they buy?", options: ["18", "12", "15", "20"], answer: 0 },
      { text: "A car wash serves 40 cars. Standard washes are 5 dollars, premium washes are 15 dollars. They collect 340 dollars. How many premium washes were sold?", options: ["26", "10", "14", "15"], answer: 2 },
      { text: "A science lab uses 20 weights. Some are 2-gram weights, some are 5-gram weights. The total mass is 61 grams. How many 2-gram weights are there?", options: ["7", "13", "12", "14"], answer: 1 },
      { text: "A coffee shop sells 50 coffees. Regular coffees cost 4 dollars, large coffees cost 7 dollars. Total sales are 260 dollars. How many large coffees were sold?", options: ["30", "25", "15", "20"], answer: 3 }
    ]
  }
];
