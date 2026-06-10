import fs from 'fs';
import path from 'path';

const blogs = [
  { id: 'why-youre-anxiously-attached', title: "Why You're Anxiously Attached (And How to Heal)", category: 'Relationships & Love', emoji: '💞', readTime: 5, description: "Discover the root causes of anxious attachment and actionable steps to build security in your relationships." },
  { id: '10-red-flag-habits', title: "10 Red Flag Habits You Need to Break Right Now", category: 'Relationships & Love', emoji: '🚩', readTime: 6, description: "Are you unintentionally sabotaging your relationships? Learn to identify and break these common red flag habits." },
  { id: 'love-language-childhood', title: "What Your Love Language Says About Your Childhood", category: 'Relationships & Love', emoji: '💌', readTime: 4, description: "Explore the fascinating connection between how you were raised and how you give and receive love today." },
  { id: 'build-secure-relationships', title: "How to Build Secure Relationships From Scratch", category: 'Relationships & Love', emoji: '🤝', readTime: 7, description: "A step-by-step guide to fostering trust, emotional safety, and deep connection with your partner." },
  { id: 'science-behind-overthinking', title: "The Science Behind Overthinking (And How to Stop)", category: 'Self Awareness', emoji: '🧠', readTime: 5, description: "Understand what happens in your brain when you overthink, and learn proven techniques to quiet your mind." },
  { id: 'emotionally-intelligent-signs', title: "Are You Emotionally Intelligent? 5 Signs That Show It", category: 'Self Awareness', emoji: '💡', readTime: 4, description: "Emotional intelligence is key to success. Check if you possess these 5 essential traits of high EQ individuals." },
  { id: 'self-awareness-life-skill', title: "Why Self Awareness is the #1 Life Skill No One Teaches You", category: 'Self Awareness', emoji: '👁️', readTime: 6, description: "Without self-awareness, personal growth is impossible. Learn how to cultivate this crucial skill for a better life." },
  { id: 'habits-rewire-brain-positivity', title: "5 Daily Habits That Rewire Your Brain for Positivity", category: 'Mental Wellness', emoji: '🧘', readTime: 5, description: "Neuroplasticity means you can change your brain. Start these 5 habits today to naturally boost your mood." },
  { id: 'stop-people-pleasing', title: "How to Stop People Pleasing Without Feeling Guilty", category: 'Mental Wellness', emoji: '🛡️', readTime: 6, description: "Saying 'no' is a superpower. Learn how to set healthy boundaries and prioritize your own needs." },
  { id: 'train-your-brain-boost-iq', title: "Train Your Brain: 7 Exercises That Boost IQ Over Time", category: 'Productivity & Focus', emoji: '⚡', readTime: 7, description: "Intelligence isn't completely fixed. Discover 7 mental exercises proven to enhance cognitive function and logic." },
  { id: 'build-focus-distractions', title: "How to Build Focus in a World Full of Distractions", category: 'Productivity & Focus', emoji: '🎯', readTime: 5, description: "Reclaim your attention span. Practical strategies to overcome digital distractions and achieve deep work." },
  { id: 'how-to-stop-being-a-red-flag', title: "How to Stop Being a Red Flag in Relationships", category: 'Social Skills', emoji: '🌎', readTime: 6, description: "Take accountability for your toxic traits. A compassionate guide to recognizing and changing harmful relationship behaviors." }
];

const blogDir = path.join(process.cwd(), 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir);
}

const template = (blog) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blog.title} – PersonaSnap</title>
  <meta name="description" content="${blog.description}">
  <meta property="og:image" content="/assets/og-image.jpg">
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/blog.css">
</head>
<body data-blog-id="${blog.id}" data-category="${blog.category}" data-read-time="${blog.readTime}">

  <div class="reading-progress-container"><div class="reading-progress-bar" id="reading-progress"></div></div>
  <div class="floating-reading-time" id="floating-time">${blog.readTime} min left</div>

  <nav class="navbar">
    <div class="container">
      <div class="logo"><a href="/">🧠 PersonaSnap</a></div>
      <div class="nav-links"><a href="/">Home</a></div>
    </div>
  </nav>

  <div class="blog-container animate-fade-up">
    <header class="blog-header">
      <div class="blog-hero-emoji">${blog.emoji}</div>
      <div class="blog-category-tag">${blog.category}</div>
      <h1 class="blog-title">${blog.title}</h1>
      <div class="blog-meta">
        <span>⏱️ ${blog.readTime} min read</span>
        <span>✍️ PersonaSnap Team</span>
        <span>📅 June 10, 2026</span>
      </div>
    </header>

    <div class="blog-content">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      
      <h2>Understanding the Core Concept</h2>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
      
      <!-- Adsterra Banner Mid-Article -->
      <div class="ad-banner-mid">Adsterra Banner Placement</div>

      <h2>Practical Steps Forward</h2>
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
      <ul>
        <li><strong>Step 1:</strong> Identify the patterns in your daily life.</li>
        <li><strong>Step 2:</strong> Implement small, actionable changes over time.</li>
        <li><strong>Step 3:</strong> Reflect on your progress and adjust accordingly.</li>
      </ul>
      <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>
      
      <div class="key-takeaways">
        <h3>💡 Key Takeaways</h3>
        <div class="takeaway-item">1. Recognize the impact of your current habits on your well-being.</div>
        <div class="takeaway-item" style="margin-top:10px;">2. Small daily changes compound into massive personal growth.</div>
        <div class="takeaway-item" style="margin-top:10px;">3. Be patient with yourself—growth is a marathon, not a sprint.</div>
      </div>
    </div>

    <div class="blog-footer">
      <div style="margin-bottom: 2rem;">
        <button class="btn-primary" onclick="window.location.href='/#quizzes'">Take a Related Quiz 🔄</button>
      </div>
      
      <h3>Did this help you?</h3>
      <div class="feedback-section">
        <button class="btn-feedback" id="btn-thumbs-up">👍 Yes</button>
        <button class="btn-feedback" id="btn-thumbs-down">👎 No</button>
      </div>
      
      <div style="display:flex; justify-content:center; gap:10px; margin-top:2rem;">
        <button class="btn-share" onclick="window.open('https://twitter.com/intent/tweet?text=Reading this great article on PersonaSnap!', '_blank')" style="background: #1DA1F2;">Share on Twitter</button>
      </div>
    </div>

    <div class="related-articles">
      <h3 style="text-align:center; font-size: 2rem; margin-bottom: 1rem;">Read Next</h3>
      <div class="related-grid" id="related-container">
        <!-- Populated by JS -->
      </div>
    </div>
  </div>

  <script type="module" src="/js/firebase.js"></script>
  <script type="module" src="/js/blog-engine.js"></script>
</body>
</html>`;

blogs.forEach(blog => {
  fs.writeFileSync(path.join(blogDir, blog.id + '.html'), template(blog));
  console.log("Generated " + blog.id + ".html");
});
