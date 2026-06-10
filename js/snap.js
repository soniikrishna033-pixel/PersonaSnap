/**
 * Snap Mascot Engine — PersonaSnap 2.0
 * Pure CSS + JS animated brain character with chat, sounds, and page-aware behavior.
 */

class SnapMascot {
  constructor(config = {}) {
    this.page = config.page || 'home';
    this.size = config.size || 80;
    this.muted = localStorage.getItem('snapMuted') === 'true';
    this.audioCtx = null;
    this.chatOpen = false;
    this.idleTimer = null;
    this.bubbleTimer = null;
    this.bubbleRotation = null;
    this.currentExpression = '';
    this.container = null;
    this.body = null;
    this.bubble = null;
    this.chatPanel = null;
    this.homeMessages = null;
    this.homeMsgIndex = 0;

    // Set join date if first time
    if (!localStorage.getItem('snapJoinDate')) {
      localStorage.setItem('snapJoinDate', new Date().toISOString());
    }

    this.init();
  }

  // ─── UTILS ──────────────────────────────────────────────────

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatText(text) {
    return this.escapeHtml(text).replace(/\n/g, '<br>');
  }

  // ─── DOM CREATION ───────────────────────────────────────────

  init() {
    this.createDOM();
    this.createChatPanel();
    this.updateCrown();
    this.startIdleTimer();

    // Page-specific init
    switch (this.page) {
      case 'home': this.initHome(); break;
      case 'quiz': this.initQuiz(); break;
      case 'result': this.initResult(); break;
      case 'blog': this.initBlog(); break;
      case 'dashboard': this.initDashboard(); break;
    }

    // Check onboarding
    if (this.page === 'home') {
      this.checkFirstVisit();
    }
  }

  createDOM() {
    // Container
    this.container = document.createElement('div');
    this.container.id = 'snap-container';
    this.container.className = 'snap-container-' + this.page;

    // Mute button
    const muteBtn = document.createElement('div');
    muteBtn.className = 'snap-mute-btn';
    muteBtn.textContent = this.muted ? '🔇' : '🔊';
    muteBtn.title = 'Toggle sound';
    muteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      this.toggleMute();
      muteBtn.textContent = this.muted ? '🔇' : '🔊';
    }.bind(this));

    // Body
    this.body = document.createElement('div');
    this.body.className = 'snap-body';

    // Eyes
    const eyes = document.createElement('div');
    eyes.className = 'snap-eyes';
    var eye1 = document.createElement('div');
    eye1.className = 'snap-eye';
    var eye2 = document.createElement('div');
    eye2.className = 'snap-eye';
    eyes.appendChild(eye1);
    eyes.appendChild(eye2);
    this.body.appendChild(eyes);

    // Crown placeholder
    this.crownEl = document.createElement('div');
    this.crownEl.className = 'snap-crown';
    this.crownEl.style.display = 'none';
    this.body.appendChild(this.crownEl);

    // Speech bubble
    this.bubble = document.createElement('div');
    this.bubble.className = 'snap-bubble';

    // Click handler — single unified handler
    this.body.addEventListener('click', function() {
      this.initAudio();
      this.playPop();
      this.resetIdleTimer();
      this.handleSnapClick();
    }.bind(this));

    // Hover interaction
    this.body.addEventListener('mouseenter', function() {
      this.resetIdleTimer();
    }.bind(this));

    this.container.appendChild(muteBtn);
    this.container.appendChild(this.bubble);
    this.container.appendChild(this.body);
    document.body.appendChild(this.container);
  }

  handleSnapClick() {
    // Blog: show KP bubble on first click, chat on second
    if (this.page === 'blog' && !this.chatOpen && !this._blogBubbleShown) {
      this._blogBubbleShown = true;
      this.showBubble("Great choice reading this! +50 Knowledge Points after 🧠", 5000);
      return;
    }
    this.toggleChat();
  }

  // ─── EXPRESSIONS ────────────────────────────────────────────

  setExpression(name) {
    if (this.currentExpression === name) return;
    var expressions = ['snap-happy', 'snap-thinking', 'snap-excited', 'snap-sad',
      'snap-sleeping', 'snap-celebrating', 'snap-reading'];
    for (var i = 0; i < expressions.length; i++) {
      this.body.classList.remove(expressions[i]);
    }
    if (name) {
      this.body.classList.add('snap-' + name);
    }
    this.currentExpression = name;
  }

  showBubble(text, duration) {
    if (duration === undefined) duration = 6000;
    this.bubble.innerHTML = this.formatText(text);
    this.bubble.classList.add('visible');
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    var self = this;
    this.bubbleTimer = setTimeout(function() { self.hideBubble(); }, duration);
  }

  hideBubble() {
    this.bubble.classList.remove('visible');
    if (this.bubbleTimer) {
      clearTimeout(this.bubbleTimer);
      this.bubbleTimer = null;
    }
  }

  // ─── CROWN SYSTEM ──────────────────────────────────────────

  updateCrown() {
    var xp = parseInt(localStorage.getItem('mockXp') || '0');
    var level = this.getLevel(xp);

    this.crownEl.style.display = 'none';
    this.crownEl.className = 'snap-crown';

    if (level.name === 'Silver') {
      this.crownEl.textContent = '✦';
      this.crownEl.style.display = 'block';
      this.crownEl.style.color = '#C0C0C0';
    } else if (level.name === 'Gold') {
      this.crownEl.textContent = '⭐';
      this.crownEl.style.display = 'block';
    } else if (level.name === 'Diamond') {
      this.crownEl.textContent = '💎';
      this.crownEl.style.display = 'block';
    } else if (level.name === 'Legendary') {
      this.crownEl.textContent = '👑';
      this.crownEl.style.display = 'block';
      this.crownEl.classList.add('snap-crown-glow');
    }
  }

  getLevel(xp) {
    if (xp >= 7000) return { name: 'Legendary', emoji: '👑', min: 7000, next: null };
    if (xp >= 3500) return { name: 'Diamond', emoji: '💎', min: 3500, next: 7000 };
    if (xp >= 1500) return { name: 'Gold', emoji: '🥇', min: 1500, next: 3500 };
    if (xp >= 500) return { name: 'Silver', emoji: '🥈', min: 500, next: 1500 };
    return { name: 'Bronze', emoji: '🥉', min: 0, next: 500 };
  }

  // ─── IDLE / SLEEPING ───────────────────────────────────────

  startIdleTimer() {
    var self = this;
    this.idleTimer = setTimeout(function() {
      self.setExpression('sleeping');
    }, 30000);
  }

  resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.currentExpression === 'sleeping') {
      this.setExpression('');
    }
    this.startIdleTimer();
  }

  // ─── CHAT SYSTEM ───────────────────────────────────────────

  createChatPanel() {
    this.chatPanel = document.createElement('div');
    this.chatPanel.id = 'snap-chat-panel';

    // Build chat panel DOM manually for reliability
    var header = document.createElement('div');
    header.className = 'chat-header';

    var headerTitle = document.createElement('span');
    headerTitle.textContent = '💬 Chat with Snap';
    header.appendChild(headerTitle);

    var closeBtn = document.createElement('span');
    closeBtn.className = 'chat-close';
    closeBtn.textContent = '✕';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', this.toggleChat.bind(this));
    header.appendChild(closeBtn);

    var chatBody = document.createElement('div');
    chatBody.className = 'chat-body';
    chatBody.id = 'snap-chat-body';

    var inputArea = document.createElement('div');
    inputArea.className = 'chat-input-area';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'chat-input';
    input.id = 'snap-chat-input';
    input.placeholder = 'Ask me anything...';
    input.maxLength = 200;
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') this.handleChatSend();
    }.bind(this));

    var sendBtn = document.createElement('button');
    sendBtn.className = 'chat-send';
    sendBtn.textContent = '→';
    sendBtn.addEventListener('click', this.handleChatSend.bind(this));

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);

    this.chatPanel.appendChild(header);
    this.chatPanel.appendChild(chatBody);
    this.chatPanel.appendChild(inputArea);

    document.body.appendChild(this.chatPanel);
  }

  toggleChat() {
    this.chatOpen = !this.chatOpen;
    var self = this;

    if (this.chatOpen) {
      // Stop bubble rotation while chat is open
      if (this.bubbleRotation) {
        clearInterval(this.bubbleRotation);
        this.bubbleRotation = null;
      }
      this.hideBubble();

      this.chatPanel.classList.add('active');

      // Welcome message if chat body is empty
      var body = document.getElementById('snap-chat-body');
      if (body && body.children.length === 0) {
        this.addMessage("Hey! 👋 I'm Snap, your PersonaSnap buddy! Type 'help' to see what I can do!", 'snap');
      }
      setTimeout(function() {
        var inp = document.getElementById('snap-chat-input');
        if (inp) inp.focus();
      }, 300);
    } else {
      this.chatPanel.classList.remove('active');

      // Restart bubble rotation on home page
      if (this.page === 'home' && this.homeMessages) {
        this.startHomeMessages();
      }
    }
  }

  addMessage(text, sender, actionBtn) {
    if (!sender) sender = 'snap';
    var body = document.getElementById('snap-chat-body');
    if (!body) return;

    var msg = document.createElement('div');
    msg.className = 'chat-msg ' + sender;
    msg.innerHTML = this.formatText(text);
    body.appendChild(msg);

    if (actionBtn) {
      var btn = document.createElement('button');
      btn.className = 'btn-primary';
      btn.style.cssText = 'margin-top:8px;padding:8px 16px;font-size:0.85rem;display:block;border-radius:8px;';
      btn.textContent = actionBtn.label;
      btn.addEventListener('click', actionBtn.action);
      var wrapper = document.createElement('div');
      wrapper.className = 'chat-msg snap';
      wrapper.appendChild(btn);
      body.appendChild(wrapper);
    }

    body.scrollTop = body.scrollHeight;
  }

  handleChatSend() {
    var input = document.getElementById('snap-chat-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    this.addMessage(text, 'user');
    input.value = '';
    this.resetIdleTimer();

    // Simulate typing delay
    var self = this;
    setTimeout(function() {
      self.processInput(text);
    }, 500);
  }

  processInput(text) {
    var lower = text.toLowerCase();

    if (lower.includes('quiz') || lower.includes('test')) {
      this.addMessage(
        "I'd recommend the Attachment Style quiz first! It reveals SO much about you 💞 Want me to take you there?",
        'snap',
        { label: 'Take me →', action: function() { window.location.href = '/quiz.html?id=attachment-style'; } }
      );
    } else if (lower.includes('result') || lower.includes('score')) {
      var last = null;
      try { last = JSON.parse(localStorage.getItem('lastResult')); } catch(e) {}
      if (last) {
        var pct = Math.round((last.score / last.total) * 100);
        this.addMessage('Your last quiz score was ' + pct + '%! You earned +' + last.xpEarned + ' XP 🔥 You were amazing! Want to beat your score?', 'snap');
      } else {
        this.addMessage("You haven't taken any quizzes yet! Let's change that 🎮", 'snap',
          { label: 'Start a Quiz →', action: function() { window.location.href = '/#quizzes'; } });
      }
    } else if (lower.includes('streak') || lower.includes('points')) {
      var xp = localStorage.getItem('mockXp') || '0';
      var streak = localStorage.getItem('quizStreak') || '0';
      var level = this.getLevel(parseInt(xp));
      this.addMessage(
        "📊 Your stats:\n🔥 Streak: " + streak + " days\n⚡ XP: " + xp + "\n🏅 Level: " + level.name + " " + level.emoji + "\n\nKeep going! 💪", 'snap');
    } else if (lower.includes('help')) {
      this.addMessage(
        "Here's what I can do:\n📊 Check your stats\n🎮 Suggest a quiz\n📖 Recommend an article\n💪 Give you motivation\n📜 Tell your story\n🧠 Share a psychology fact\n\nWhat do you need?", 'snap');
    } else if (lower.includes('motivat')) {
      var motivations = [
        "Your brain is literally rewiring itself every time you learn 🧠✨",
        "The fact you're here means you care about growing. That's rare 💎",
        "Every quiz you take is a step toward knowing yourself better 🚀",
        "You're not behind. You're exactly where you need to be right now 🌱"
      ];
      this.addMessage(motivations[Math.floor(Math.random() * motivations.length)], 'snap');
    } else if (lower.includes('story')) {
      this.tellStory();
    } else if (lower.includes('fact') || lower.includes('psychology')) {
      var facts = [
        "Your brain generates about 70,000 thoughts per day 🤯",
        "People with secure attachment have 40% fewer relationship conflicts on average",
        "Reading for just 6 minutes reduces stress by 68% — so keep reading! 📖",
        "Your personality type can actually change over time with effort 🌱"
      ];
      this.addMessage(facts[Math.floor(Math.random() * facts.length)], 'snap');
    } else if (lower.includes('article') || lower.includes('read') || lower.includes('blog')) {
      this.addMessage("I'd recommend reading about self-awareness — it's the #1 life skill! 📖",
        'snap',
        { label: 'Read it →', action: function() { window.location.href = '/blog/self-awareness-life-skill.html'; } });
    } else {
      // Default responses
      var defaults = [
        "Hmm, I'm not sure about that! Try typing 'help' to see what I can do 💡",
        "Interesting! I'd love to chat more. Try asking about quizzes, stats, or psychology facts! 🧠",
        "I'm still learning! Ask me about your results, streaks, or type 'motivate' for a boost ✨"
      ];
      this.addMessage(defaults[Math.floor(Math.random() * defaults.length)], 'snap');
    }
  }

  tellStory() {
    var joinDate = localStorage.getItem('snapJoinDate');
    var history = [];
    try { history = JSON.parse(localStorage.getItem('quizHistory')) || []; } catch(e) {}
    var readBlogs = [];
    try { readBlogs = JSON.parse(localStorage.getItem('readBlogs')) || []; } catch(e) {}
    var xp = parseInt(localStorage.getItem('mockXp') || '0');
    var level = this.getLevel(xp);
    var last = null;
    try { last = JSON.parse(localStorage.getItem('lastResult')); } catch(e) {}

    var daysAgo = 1;
    if (joinDate) {
      daysAgo = Math.max(1, Math.floor((Date.now() - new Date(joinDate).getTime()) / 86400000));
    }

    var lastResultText = '';
    if (last && last.score !== undefined) {
      var pct = Math.round((last.score / last.total) * 100);
      lastResultText = ' Your last score was ' + pct + '%.';
    }

    var nextLevel = level.next
      ? " You're " + (level.next - xp) + ' XP away from the next level.'
      : " You've reached the top!";

    this.addMessage(
      'Let me tell you your PersonaSnap story so far... 📖\n\n' +
      'You joined ' + daysAgo + ' day' + (daysAgo > 1 ? 's' : '') + ' ago. ' +
      "You've taken " + history.length + ' quiz' + (history.length !== 1 ? 'zes' : '') + ' and ' +
      'read ' + readBlogs.length + ' article' + (readBlogs.length !== 1 ? 's' : '') + '.' + lastResultText + ' ' +
      "You've earned " + xp + ' XP and you\'re a ' + level.name + ' ' + level.emoji + '.' + nextLevel + ' ' +
      'Keep going! 🌟',
      'snap'
    );
  }

  // ─── SOUND EFFECTS (Web Audio API) ─────────────────────────

  initAudio() {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      // Web Audio not supported
    }
  }

  playTone(freq, duration, type, volume) {
    if (!type) type = 'sine';
    if (!volume) volume = 0.15;
    if (this.muted) return;
    if (!this.audioCtx) {
      this.initAudio();
      if (!this.audioCtx) return;
    }
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      var osc = this.audioCtx.createOscillator();
      var gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) { /* silent fail */ }
  }

  playDing() {
    var self = this;
    this.playTone(880, 0.3, 'sine', 0.12);
    setTimeout(function() { self.playTone(1108, 0.2, 'sine', 0.08); }, 100);
  }

  playWhomp() {
    var self = this;
    this.playTone(300, 0.4, 'triangle', 0.15);
    setTimeout(function() { self.playTone(200, 0.3, 'triangle', 0.1); }, 100);
  }

  playCelebration() {
    var self = this;
    var notes = [523, 659, 784, 1047];
    for (var i = 0; i < notes.length; i++) {
      (function(n, delay) {
        setTimeout(function() { self.playTone(n, 0.2, 'sine', 0.1); }, delay);
      })(notes[i], i * 120);
    }
  }

  playPop() {
    this.playTone(600, 0.08, 'sine', 0.1);
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('snapMuted', String(this.muted));
  }

  // ─── ONBOARDING ────────────────────────────────────────────

  checkFirstVisit() {
    if (localStorage.getItem('snapOnboarded')) return;
    var self = this;
    setTimeout(function() { self.startOnboarding(); }, 2000);
  }

  startOnboarding() {
    var self = this;
    var steps = [
      {
        text: "Hey! I'm Snap 👋 I live here on PersonaSnap! Let me show you around real quick",
        target: null
      },
      {
        text: "These are your quizzes 🎮 Each one reveals something new about YOU",
        target: '#quizzes'
      },
      {
        text: "After each quiz I'll show you articles to help you GROW 📖 Not just play — actually improve",
        target: '#growth-hub'
      },
      {
        text: "Your progress is saved here 📈 Watch yourself grow over time. Ready to start?",
        target: null,
        finalBtn: true
      }
    ];

    var currentStep = 0;

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'snap-onboarding-overlay';

    // Build overlay content manually
    var card = document.createElement('div');
    card.className = 'snap-onboarding-card';

    var faceContainer = document.createElement('div');
    faceContainer.className = 'snap-onboarding-face';
    var miniSnap = document.createElement('div');
    miniSnap.className = 'snap-body';
    miniSnap.style.cssText = 'width:60px;height:60px;animation:floatSnap 2s ease-in-out infinite;margin:0 auto 15px;pointer-events:none;';
    var miniEyes = document.createElement('div');
    miniEyes.className = 'snap-eyes';
    var miniEye1 = document.createElement('div');
    miniEye1.className = 'snap-eye';
    var miniEye2 = document.createElement('div');
    miniEye2.className = 'snap-eye';
    miniEyes.appendChild(miniEye1);
    miniEyes.appendChild(miniEye2);
    miniSnap.appendChild(miniEyes);
    faceContainer.appendChild(miniSnap);
    card.appendChild(faceContainer);

    var textEl = document.createElement('p');
    textEl.className = 'snap-onboarding-text';
    card.appendChild(textEl);

    var btnEl = document.createElement('button');
    btnEl.className = 'btn-primary snap-onboarding-btn';
    btnEl.textContent = 'Next →';
    card.appendChild(btnEl);

    var spotlightEl = document.createElement('div');
    spotlightEl.className = 'snap-spotlight';

    overlay.appendChild(card);
    overlay.appendChild(spotlightEl);
    document.body.appendChild(overlay);

    function showStep() {
      var step = steps[currentStep];
      textEl.textContent = step.text;

      if (step.finalBtn) {
        btnEl.textContent = "Let's Go! 🚀";
      } else {
        btnEl.textContent = 'Next →';
      }

      // Spotlight
      if (step.target) {
        var el = document.querySelector(step.target);
        if (el) {
          var rect = el.getBoundingClientRect();
          spotlightEl.style.top = (rect.top + window.scrollY - 10) + 'px';
          spotlightEl.style.left = (rect.left - 10) + 'px';
          spotlightEl.style.width = (rect.width + 20) + 'px';
          spotlightEl.style.height = Math.min(rect.height + 20, 400) + 'px';
          spotlightEl.style.display = 'block';
          card.style.position = 'fixed';
          card.style.bottom = '20%';
          card.style.left = '50%';
          card.style.transform = 'translateX(-50%)';
          card.style.top = 'auto';
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        spotlightEl.style.display = 'none';
        card.style.position = '';
        card.style.bottom = '';
        card.style.left = '';
        card.style.transform = '';
        card.style.top = '';
      }
    }

    btnEl.addEventListener('click', function() {
      currentStep++;
      if (currentStep >= steps.length) {
        overlay.remove();
        localStorage.setItem('snapOnboarded', 'true');
        self.setExpression('excited');
        setTimeout(function() { self.setExpression(''); }, 2000);
      } else {
        showStep();
      }
    });

    showStep();
  }

  // ─── SPARKLE BURST ─────────────────────────────────────────

  burstSparkles() {
    for (var i = 0; i < 8; i++) {
      var sparkle = document.createElement('div');
      sparkle.className = 'snap-sparkle';
      sparkle.textContent = '✨';
      var angle = (i / 8) * Math.PI * 2;
      sparkle.style.setProperty('--sx', Math.cos(angle) * 60 + 'px');
      sparkle.style.setProperty('--sy', Math.sin(angle) * 60 + 'px');
      this.body.appendChild(sparkle);
      (function(el) {
        setTimeout(function() { if (el.parentNode) el.remove(); }, 800);
      })(sparkle);
    }
  }

  // ─── PAGE: HOME ────────────────────────────────────────────

  initHome() {
    this.homeMessages = [
      "Hey! Ready to discover yourself? 🧠",
      "2 million people already know their personality type. Do you?",
      "Take a quiz. It takes 2 minutes!",
      "Your mind is more powerful than you think ✨"
    ];
    this.homeMsgIndex = 0;
    this.showBubble(this.homeMessages[0], 7500);
    this.startHomeMessages();
  }

  startHomeMessages() {
    if (this.bubbleRotation) {
      clearInterval(this.bubbleRotation);
    }
    var self = this;
    this.bubbleRotation = setInterval(function() {
      if (self.chatOpen) return; // Don't show bubble while chat is open
      self.homeMsgIndex = (self.homeMsgIndex + 1) % self.homeMessages.length;
      self.showBubble(self.homeMessages[self.homeMsgIndex], 7500);
    }, 8000);
  }

  // ─── PAGE: QUIZ ────────────────────────────────────────────

  initQuiz() {
    var self = this;

    // Listen for quiz events
    document.addEventListener('personasnap:answer', function(e) {
      self.resetIdleTimer();
      var detail = e.detail || {};
      var correct = detail.correct;
      var isLast = detail.isLast;

      if (isLast) {
        self.setExpression('thinking');
        self.showBubble("Last question... you've got this! 🤔", 3000);
      } else if (correct) {
        self.setExpression('excited');
        self.playDing();
        self.showBubble("Yes! 🎉", 2000);
        setTimeout(function() { self.setExpression(''); }, 2000);
      } else {
        self.setExpression('sad');
        self.playWhomp();
        self.showBubble("Aww... next one! 💪", 2000);
        setTimeout(function() { self.setExpression(''); }, 2000);
      }
    });

    document.addEventListener('personasnap:timerTick', function(e) {
      var detail = e.detail || {};
      var timeRemaining = detail.timeRemaining;
      if (timeRemaining <= 10 && timeRemaining > 0) {
        self.setExpression('excited');
        if (timeRemaining === 10) {
          self.showBubble("Hurry! ⏰", 3000);
        }
      }
    });
  }

  // ─── PAGE: RESULT ──────────────────────────────────────────

  initResult() {
    var self = this;

    // Make snap larger on result page
    this.body.style.width = '100px';
    this.body.style.height = '100px';

    // Read result
    var last = null;
    try { last = JSON.parse(localStorage.getItem('lastResult')); } catch(e) {}
    if (!last) return;

    var pct = Math.round((last.score / last.total) * 100);

    setTimeout(function() {
      if (pct >= 70) {
        self.setExpression('celebrating');
        self.burstSparkles();
        self.playCelebration();
        setTimeout(function() { self.setExpression('happy'); }, 3000);
      } else {
        self.setExpression('sad');
        setTimeout(function() {
          self.showBubble("Don't worry! Read the guide and try again 💪", 8000);
          self.setExpression('');
        }, 2000);
      }
    }, 1000);

    // Listen for level up
    document.addEventListener('personasnap:levelup', function() {
      self.setExpression('celebrating');
      self.burstSparkles();
      self.playCelebration();
    });
  }

  // ─── PAGE: BLOG ────────────────────────────────────────────

  initBlog() {
    this._blogBubbleShown = false;
    this.setExpression('reading');
  }

  // ─── PAGE: DASHBOARD ──────────────────────────────────────

  initDashboard() {
    // Near username — position inline
    var profileName = document.getElementById('profile-name');
    if (profileName && profileName.parentNode) {
      // Make snap smaller for inline display
      this.container.style.position = 'relative';
      this.container.style.display = 'inline-block';
      this.container.style.verticalAlign = 'middle';
      this.container.style.marginLeft = '10px';
      this.body.style.width = '50px';
      this.body.style.height = '50px';
      // Move from body into profile card
      profileName.parentNode.insertBefore(this.container, profileName.nextSibling);
    }

    // Streak-based expression
    var streak = parseInt(localStorage.getItem('quizStreak') || '0');

    if (streak > 7) {
      this.setExpression('happy');
      // Fire crown override
      this.crownEl.textContent = '🔥';
      this.crownEl.style.display = 'block';
      this.crownEl.classList.add('snap-fire-crown');
    } else if (streak > 0) {
      this.setExpression('happy');
      this.showBubble(streak + ' day streak! Keep it up! 🔥', 5000);
    } else {
      this.setExpression('sad');
      this.showBubble("You broke your streak 😢 Come back tomorrow!", 6000);
    }
  }
}

// ─── AUTO-INIT ON DOM READY ──────────────────────────────────

(function() {
  function initSnap() {
    // Determine current page
    var path = window.location.pathname;
    var page = 'home';

    if (path.indexOf('quiz.html') !== -1) {
      page = 'quiz';
    } else if (path.indexOf('result.html') !== -1) {
      page = 'result';
    } else if (path.indexOf('/blog/') !== -1 || path.indexOf('blog.html') !== -1) {
      page = 'blog';
    } else if (path.indexOf('dashboard.html') !== -1) {
      page = 'dashboard';
    }

    // Mobile adjustments
    var isMobile = window.innerWidth <= 768;
    var size = isMobile ? 50 : 80;

    // Create Snap
    window.snap = new SnapMascot({ page: page, size: size });
  }

  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnap);
  } else {
    initSnap();
  }
})();
