import { blogs } from './blogs.js';
import { auth } from './firebase.js';
import { syncBlogRead } from './user-db.js';

document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('reading-progress');
  const floatingTime = document.getElementById('floating-time');
  const content = document.querySelector('.blog-content');
  const totalReadTimeMin = parseInt(document.body.getAttribute('data-read-time') || 5);
  
  let hasAwardedKP = false;

  // Scroll logic
  window.addEventListener('scroll', () => {
    if (!content) return;
    
    // Progress Bar
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if(progressBar) progressBar.style.width = scrolled + '%';

    // Floating Reading Time
    const contentRect = content.getBoundingClientRect();
    const contentTop = contentRect.top;
    const contentHeight = contentRect.height;
    const windowHeight = window.innerHeight;
    
    if (contentTop < windowHeight && contentTop + contentHeight > 0) {
      if(floatingTime) floatingTime.classList.add('visible');
      const percentageRead = Math.max(0, Math.min(1, -contentTop / (contentHeight - windowHeight)));
      const minutesLeft = Math.ceil(totalReadTimeMin * (1 - percentageRead));
      
      if(floatingTime) {
        if (minutesLeft <= 0 || percentageRead > 0.95) {
          floatingTime.textContent = "Finished reading! 🎉";
          awardKnowledgePoints();
        } else {
          floatingTime.textContent = `${minutesLeft} min left`;
        }
      }
    } else {
      if(floatingTime) floatingTime.classList.remove('visible');
    }

    // Key Takeaways Animation
    const takeaways = document.querySelectorAll('.takeaway-item');
    takeaways.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50) {
        setTimeout(() => {
          item.classList.add('revealed');
        }, index * 200);
      }
    });

    // Paragraph fade ins
    const paragraphs = document.querySelectorAll('.blog-content p');
    paragraphs.forEach(p => {
      if(!p.classList.contains('animate-fade-up')) {
        const rect = p.getBoundingClientRect();
        if(rect.top < window.innerHeight - 30) {
          p.classList.add('animate-fade-up');
        }
      }
    });
  });

  // Knowledge Points Logic
  function awardKnowledgePoints() {
    if (hasAwardedKP) return;
    hasAwardedKP = true;
    
    const blogId = document.body.getAttribute('data-blog-id');
    const readBlogs = JSON.parse(localStorage.getItem('readBlogs') || '[]');
    
    if (!readBlogs.includes(blogId)) {
      readBlogs.push(blogId);
      localStorage.setItem('readBlogs', JSON.stringify(readBlogs));
      
      let kp = parseInt(localStorage.getItem('knowledgePoints') || 0);
      kp += 50;
      localStorage.setItem('knowledgePoints', kp);

      // Simple streak logic for reading
      const lastReadDate = localStorage.getItem('lastReadDate');
      const today = new Date().toISOString().split('T')[0];
      let streak = parseInt(localStorage.getItem('readingStreak') || 0);
      
      if (lastReadDate !== today) {
        if (lastReadDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
          streak++;
        } else {
          streak = 1; // reset or start
        }
        localStorage.setItem('readingStreak', streak);
        localStorage.setItem('lastReadDate', today);
      }
      
      if (auth.currentUser) {
        syncBlogRead(auth.currentUser.uid, blogId, kp, streak).catch(e => console.error("Firebase sync error", e));
      }
      
      console.log(`Awarded 50 KP! Total KP: ${kp}`);
    }
  }

  // Feedback Buttons
  const btnUp = document.getElementById('btn-thumbs-up');
  const btnDown = document.getElementById('btn-thumbs-down');
  
  if (btnUp && btnDown) {
    btnUp.addEventListener('click', () => {
      btnUp.classList.add('active');
      btnDown.classList.remove('active');
      btnUp.innerHTML = '👍 Thanks for the feedback!';
    });
    btnDown.addEventListener('click', () => {
      btnDown.classList.add('active');
      btnUp.classList.remove('active');
      btnDown.innerHTML = '👎 Noted!';
    });
  }

  // Populate Related Articles
  const relatedContainer = document.getElementById('related-container');
  if (relatedContainer && blogs) {
    const currentCategory = document.body.getAttribute('data-category');
    const currentId = document.body.getAttribute('data-blog-id');
    
    const related = blogs.filter(b => b.category === currentCategory && b.id !== currentId).slice(0, 3);
    
    // Fallback if not enough in category
    if (related.length < 3) {
      const others = blogs.filter(b => b.id !== currentId && !related.find(r => r.id === b.id));
      related.push(...others.slice(0, 3 - related.length));
    }

    related.forEach(blog => {
      const card = document.createElement('a');
      card.href = blog.url;
      card.className = 'related-card';
      card.innerHTML = `
        <div class="emoji">${blog.emoji}</div>
        <h4>${blog.title}</h4>
        <div class="meta">${blog.readTime} min read &bull; ${blog.category}</div>
      `;
      relatedContainer.appendChild(card);
    });
  }
});
