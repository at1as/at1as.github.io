import { loadCorpus, roundSize, selectRound } from './corpus.mjs';

const card = document.getElementById('the-test');
const group = document.getElementById('quiz-category');
const progress = document.getElementById('quiz-progress');
const count = document.getElementById('quiz-count');
const track = document.getElementById('quiz-track');
const runningScore = document.getElementById('quiz-running-score');
const runningValue = document.getElementById('quiz-running-value');
const main = document.getElementById('quiz-main');
const heading = document.getElementById('quiz-question');
const choices = [...card.querySelectorAll('.quiz-choice')];
const result = document.getElementById('quiz-result');
const summary = document.getElementById('quiz-summary');
const scoreHeading = document.getElementById('quiz-score-heading');
const scoreValue = document.getElementById('quiz-score');
const scoreTotal = document.getElementById('quiz-total');
const message = document.getElementById('quiz-message');
const announcement = document.getElementById('quiz-announcement');
const back = document.getElementById('quiz-prev');
const next = document.getElementById('quiz-next');

const seen = new Set();
let corpus;
let roundNumber = 0;
let activeQuestions = [];
let answers = [];
let index = 0;
let score = 0;
let advance;

function setNext(label, action, disabled = false) {
  next.textContent = label;
  next.disabled = disabled;
  next.hidden = !action;
  next.parentElement.hidden = back.hidden && next.hidden;
  advance = action;
}

function showProgress(label, completed) {
  progress.hidden = false;
  count.textContent = label;
  track.replaceChildren(...activeQuestions.map((_, position) => {
    const tick = document.createElement('span');
    tick.classList.toggle('active', position < completed);
    return tick;
  }));
}

function showQuestion(moveFocus = false) {
  const question = activeQuestions[index];
  const answered = answers[index] !== undefined;
  seen.add(question.id);
  card.dataset.questionId = question.id;
  message.textContent = '';
  summary.hidden = true;
  main.hidden = false;
  runningScore.hidden = false;
  runningValue.textContent = `${score} / ${activeQuestions.length}`;
  showProgress(`${index + 1} / ${activeQuestions.length} · ${question.company}`, index + 1);
  heading.textContent = question.ask;
  result.classList.remove('incorrect');
  result.replaceChildren();
  choices.forEach((button, position) => {
    button.querySelector('.choice-label').textContent = position === 0 ? 'OPTION A' : 'OPTION B';
    button.querySelector('strong').textContent = question.options[position];
    button.classList.remove('chosen', 'correct');
    button.removeAttribute('aria-disabled');
    button.removeAttribute('tabindex');
  });
  if (answered) showAnswer(question, answers[index]);

  back.hidden = index === 0;
  const last = index === activeQuestions.length - 1;
  setNext(last ? 'See your score' : 'Next question', () => {
    if (last) done();
    else {
      index++;
      showQuestion(true);
    }
  }, !answered);
  if (moveFocus) heading.focus();
}

function showAnswer(question, position) {
  const correct = question.options[position] === question.answer;
  choices.forEach((button, i) => {
    const chosen = i === position;
    const isCorrect = question.options[i] === question.answer;
    button.setAttribute('aria-disabled', 'true');
    button.tabIndex = -1;
    button.classList.toggle('chosen', chosen);
    button.classList.toggle('correct', isCorrect);
    if (chosen || isCorrect) {
      button.querySelector('.choice-label').textContent = isCorrect ? '✓ Correct' : '× Incorrect';
    }
  });
  const verdict = document.createElement('strong');
  verdict.textContent = correct ? 'Correct.' : `Incorrect. The correct answer is ${question.answer}.`;
  result.classList.toggle('incorrect', !correct);
  const source = document.createElement('a');
  source.href = question.source;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = 'Source';
  const scoreUpdate = document.createElement('span');
  scoreUpdate.className = 'sr-only';
  scoreUpdate.textContent = ` Score ${score} of ${activeQuestions.length}. `;
  result.replaceChildren(verdict, ` ${question.why} `, scoreUpdate, source);
}

function selectAnswer(position) {
  if (answers[index] !== undefined || main.hidden) return;
  answers[index] = position;
  const question = activeQuestions[index];
  if (question.options[position] === question.answer) score++;
  runningValue.textContent = `${score} / ${activeQuestions.length}`;
  showAnswer(question, position);
  next.disabled = false;
}

function setReplay() {
  const upcoming = selectRound(corpus, group.value, seen, roundNumber);
  if (upcoming.length) {
    const label = upcoming.length === roundSize ? 'Play another six' : `Play ${upcoming.length} more`;
    setNext(label, () => startRound(true));
  } else if (seen.size === corpus.all.length) {
    message.textContent = 'You’ve seen every question.';
    setNext('Start a new session', () => {
      seen.clear();
      roundNumber = 0;
      group.value = '';
      startRound(true);
    });
  } else {
    message.textContent = 'You’ve seen every question in this category. Choose another category to keep playing.';
    setNext('', null);
  }
}

function done() {
  delete card.dataset.questionId;
  main.hidden = true;
  runningScore.hidden = true;
  showProgress('Round complete', activeQuestions.length);
  scoreValue.textContent = score;
  scoreTotal.textContent = ` / ${activeQuestions.length}`;
  summary.hidden = false;
  back.hidden = false;
  setReplay();
  scoreHeading.focus();
}

function startRound(moveFocus = false) {
  activeQuestions = selectRound(corpus, group.value, seen, roundNumber++);
  answers = [];
  index = 0;
  score = 0;
  message.textContent = '';
  announcement.textContent = '';
  summary.hidden = true;
  if (activeQuestions.length) {
    showQuestion(moveFocus);
    if (!moveFocus) announcement.textContent = `Question 1 of ${activeQuestions.length}. ${heading.textContent}`;
  } else {
    delete card.dataset.questionId;
    main.hidden = true;
    runningScore.hidden = true;
    progress.hidden = true;
    back.hidden = true;
    setReplay();
  }
}

async function initialize(moveFocus = false) {
  setNext('', null);
  message.textContent = 'Loading questions…';
  try {
    corpus = await loadCorpus();
  } catch (error) {
    console.error(error);
    message.textContent = 'The questions couldn’t load.';
    setNext('Try again', () => initialize(true));
    if (moveFocus) next.focus();
    return;
  }
  for (const name of corpus.groups) group.add(new Option(name, name));
  group.disabled = false;
  startRound(moveFocus);
}

choices.forEach((button, i) => button.addEventListener('click', () => selectAnswer(i)));
back.addEventListener('click', () => {
  if (summary.hidden) index--;
  showQuestion(true);
});
next.addEventListener('click', () => advance?.());
group.addEventListener('change', () => startRound());
initialize();
