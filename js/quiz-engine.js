import { quizzes } from './quizzes.js';
import { auth } from './firebase.js';
import { syncQuizResult } from './user-db.js';

const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');
const quiz = quizzes.find(q => q.id === quizId);

if (!quiz) {
  window.location.href = '/';
}

let currentQuestionIndex = 0;
let score = 0;
let timeRemaining = 0;
let globalTimer = null;
let questionTimer = null;
let isAnswered = false;
let userAnswers = [];

const UI = {
  title: document.getElementById('quiz-title'),
  xp: document.getElementById('quiz-xp'),
  timer: document.getElementById('quiz-timer'),
  progressCount: document.getElementById('progress-count'),
  progressFill: document.getElementById('progress-fill'),
  badge: document.getElementById('question-badge'),
  text: document.getElementById('question-text'),
  optionsGrid: document.getElementById('options-grid'),
  overlay: document.getElementById('transition-overlay')
};

function initQuiz() {
  UI.title.textContent = quiz.title;
  UI.xp.textContent = `+${quiz.xp} XP`;
  
  if (quiz.timer) {
    UI.timer.style.display = 'block';
    if (quiz.timerDuration) {
      timeRemaining = quiz.timerDuration;
      startGlobalTimer();
    }
  }

  loadQuestion();
}

function startGlobalTimer() {
  updateTimerUI();
  globalTimer = setInterval(() => {
    timeRemaining--;
    updateTimerUI();
    // Dispatch tick event for Snap
    document.dispatchEvent(new CustomEvent('personasnap:timerTick', {
      detail: { timeRemaining }
    }));
    if (timeRemaining <= 0) {
      clearInterval(globalTimer);
      finishQuiz();
    }
  }, 1000);
}

function startQuestionTimer() {
  if (quiz.timerPerQuestion) {
    timeRemaining = quiz.timerPerQuestion;
    updateTimerUI();
    questionTimer = setInterval(() => {
      timeRemaining--;
      updateTimerUI();
      // Dispatch tick event for Snap
      document.dispatchEvent(new CustomEvent('personasnap:timerTick', {
        detail: { timeRemaining }
      }));
      if (timeRemaining <= 0) {
        clearInterval(questionTimer);
        handleAnswer(-1, null); // Time's up
      }
    }, 1000);
  }
}

function updateTimerUI() {
  const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
  const s = (timeRemaining % 60).toString().padStart(2, '0');
  UI.timer.textContent = `${m}:${s}`;
  if (timeRemaining <= 10) {
    UI.timer.classList.add('danger');
  } else {
    UI.timer.classList.remove('danger');
  }
}

function loadQuestion() {
  isAnswered = false;
  const q = quiz.questions[currentQuestionIndex];
  
  UI.progressCount.textContent = `Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`;
  UI.progressFill.style.width = `${((currentQuestionIndex) / quiz.questions.length) * 100}%`;
  
  UI.badge.textContent = `Q${currentQuestionIndex + 1}`;
  UI.text.textContent = q.text;
  
  UI.optionsGrid.innerHTML = '';
  q.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = (e) => handleAnswer(index, e.target);
    UI.optionsGrid.appendChild(btn);
  });

  if (quiz.timerPerQuestion) {
    startQuestionTimer();
  }
}

function handleAnswer(selectedIndex, btnElement) {
  if (isAnswered) return;
  isAnswered = true;
  
  if (questionTimer) clearInterval(questionTimer);

  const q = quiz.questions[currentQuestionIndex];
  const buttons = UI.optionsGrid.querySelectorAll('.option-btn');
  
  userAnswers.push(selectedIndex);

  const isLast = currentQuestionIndex === quiz.questions.length - 1;

  if (quiz.scoringType === 'points') {
    const points = q.points ? q.points[selectedIndex] : 0;
    score += points;
    if(btnElement) {
      btnElement.style.background = 'rgba(124, 58, 237, 0.2)';
      btnElement.style.borderColor = 'var(--primary)';
    }
    // Dispatch event for Snap (personality quizzes — always neutral)
    document.dispatchEvent(new CustomEvent('personasnap:answer', {
      detail: { correct: true, isLast, timeRemaining }
    }));
  } else {
    const isCorrect = selectedIndex === q.answer;
    if (isCorrect) {
      if(btnElement) btnElement.classList.add('correct');
      score++;
      showFloatingXP(btnElement, "+20 XP");
    } else {
      if(btnElement) btnElement.classList.add('wrong');
      // show correct answer
      if(q.answer !== undefined && buttons[q.answer]) {
        buttons[q.answer].classList.add('correct');
      }
    }
    // Dispatch event for Snap
    document.dispatchEvent(new CustomEvent('personasnap:answer', {
      detail: { correct: isCorrect, isLast, timeRemaining }
    }));
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quiz.questions.length) {
      showTransition();
    } else {
      finishQuiz();
    }
  }, 1000);
}

function showFloatingXP(target, text) {
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const xp = document.createElement('div');
  xp.className = 'xp-popup';
  xp.textContent = text;
  xp.style.left = `${rect.left + rect.width / 2}px`;
  xp.style.top = `${rect.top}px`;
  document.body.appendChild(xp);
  setTimeout(() => xp.remove(), 1000);
}

function showTransition() {
  UI.overlay.classList.add('active');
  setTimeout(() => {
    loadQuestion();
    UI.overlay.classList.remove('active');
  }, 600);
}

async function finishQuiz() {
  if(globalTimer) clearInterval(globalTimer);
  if(questionTimer) clearInterval(questionTimer);
  
  let baseXP = 0;
  let totalForMath = quiz.questions.length;

  if (quiz.scoringType === 'points') {
    totalForMath = quiz.maxPoints || 90;
    baseXP = quiz.xp; // Fixed XP for completing personality quiz
  } else {
    baseXP = Math.floor((score / quiz.questions.length) * quiz.xp);
  }
  
  const resultData = {
    quizId: quiz.id,
    score: score,
    total: totalForMath,
    xpEarned: baseXP,
    answers: userAnswers,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('lastResult', JSON.stringify(resultData));
  
  const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
  history.push(resultData);
  localStorage.setItem('quizHistory', JSON.stringify(history));

  // Quiz streak tracking
  const today = new Date().toISOString().split('T')[0];
  const lastQuizDate = localStorage.getItem('lastQuizDate');
  let streak = parseInt(localStorage.getItem('quizStreak') || '0');

  if (lastQuizDate) {
    const lastDate = new Date(lastQuizDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      streak = 1;
    }
    // If diffDays === 0, same day — keep streak
  } else {
    streak = 1;
  }

  localStorage.setItem('quizStreak', streak.toString());
  localStorage.setItem('lastQuizDate', today);
  
  const currentXp = parseInt(localStorage.getItem('mockXp') || 0) + baseXP;
  localStorage.setItem('mockXp', currentXp);
  
  if (auth.currentUser) {
    try {
      await syncQuizResult(auth.currentUser.uid, resultData, currentXp, streak);
    } catch (e) {
      console.error("Failed to sync quiz result to Firebase", e);
    }
  }

  window.location.href = '/result.html';
}

initQuiz();
