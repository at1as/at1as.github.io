import { defaultGroup, loadCorpus, roundSize, selectRound } from './corpus.mjs';

const card = document.getElementById('the-test');
const categoryList = document.getElementById('category-list');
const groupName = document.getElementById('quiz-group');
const otherCategory = document.getElementById('quiz-other');
const suggested = document.getElementById('quiz-suggested');
const progress = document.getElementById('quiz-progress');
const count = document.getElementById('quiz-count');
const track = document.getElementById('quiz-track');
const runningScore = document.getElementById('quiz-running-score');
const runningValue = document.getElementById('quiz-running-value');
const main = document.getElementById('quiz-main');
const heading = document.getElementById('quiz-question');
const context = document.getElementById('quiz-context');
const choices = [...card.querySelectorAll('.quiz-choice')];
const result = document.getElementById('quiz-result');
const summary = document.getElementById('quiz-summary');
const scoreHeading = document.getElementById('quiz-score-heading');
const scoreValue = document.getElementById('quiz-score');
const scoreTotal = document.getElementById('quiz-total');
const copyScore = document.getElementById('quiz-copy');
const shareText = document.getElementById('quiz-share-text');
const message = document.getElementById('quiz-message');
const announcement = document.getElementById('quiz-announcement');
const back = document.getElementById('quiz-prev');
const next = document.getElementById('quiz-next');

const seen = new Set();
let corpus;
let group = defaultGroup;
let roundNumber = 0;
let activeQuestions = [];
let answers = [];
let index = 0;
let score = 0;
let advance;

function setNext(label, action, ready = true) {
  next.textContent = label;
  next.hidden = !action || !ready;
  next.parentElement.hidden = back.hidden && next.hidden;
  advance = action;
}

function showProgress(label) {
  progress.hidden = false;
  count.textContent = label;
  track.replaceChildren(...activeQuestions.map((question, position) => {
    const tick = document.createElement('span');
    if (answers[position] !== undefined) {
      tick.className = question.options[answers[position]] === question.answer ? 'right' : 'wrong';
    } else if (position === index) {
      tick.className = 'current';
    }
    return tick;
  }));
}

function showQuestion(moveFocus = false) {
  const question = activeQuestions[index];
  const answered = answers[index] !== undefined;
  seen.add(question.id);
  card.dataset.questionId = question.id;
  message.textContent = '';
  announcement.textContent = '';
  summary.hidden = true;
  main.hidden = false;
  runningScore.hidden = false;
  runningValue.textContent = `${score} / ${activeQuestions.length}`;
  showProgress(`Question ${index + 1} of ${activeQuestions.length} · ${question.brand}`);
  heading.textContent = question.ask;
  context.textContent = question.namingContext;
  context.hidden = !question.namingContext;
  if (question.namingContext) heading.setAttribute('aria-describedby', context.id);
  else heading.removeAttribute('aria-describedby');
  result.classList.remove('incorrect');
  result.replaceChildren();
  choices.forEach((button, position) => {
    button.querySelector('.choice-label').textContent = '';
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
  }, answered);
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
  verdict.textContent = correct ? 'Correct.' : 'Incorrect.';
  result.classList.toggle('incorrect', !correct);
  const source = document.createElement('a');
  source.href = question.source;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = 'Source';
  const scoreUpdate = document.createElement('span');
  scoreUpdate.className = 'sr-only';
  const answerReadout = correct ? '' : ` The correct answer is ${question.answer}.`;
  scoreUpdate.textContent = `${answerReadout} Score ${score} of ${activeQuestions.length}. `;
  result.replaceChildren(verdict, ` ${question.why} `, scoreUpdate, source);
}

function selectAnswer(position) {
  if (answers[index] !== undefined || main.hidden) return;
  answers[index] = position;
  const question = activeQuestions[index];
  if (question.options[position] === question.answer) score++;
  showQuestion();
}

function setReplay() {
  const upcoming = selectRound(corpus, group, seen, roundNumber);
  if (upcoming.length) {
    const label = upcoming.length === roundSize ? 'Play another six' : `Play ${upcoming.length} more`;
    setNext(label, () => startRound(true));
  } else if (seen.size === corpus.all.length) {
    message.textContent = 'You’ve seen every question.';
    setNext('Start a new session', () => {
      seen.clear();
      roundNumber = 0;
      startRound(true, defaultGroup);
    });
  } else {
    message.textContent = 'You’ve seen every question in this category.';
    setNext('', null);
  }
}

function done() {
  delete card.dataset.questionId;
  main.hidden = true;
  runningScore.hidden = true;
  showProgress('Round complete');
  scoreValue.textContent = score;
  scoreTotal.textContent = ` / ${activeQuestions.length}`;
  copyScore.textContent = 'Copy score';
  shareText.hidden = true;
  summary.hidden = false;
  back.hidden = false;
  const nextGroupIndex = corpus.groups.indexOf(group) + 1;
  const orderedGroups = corpus.groups.slice(nextGroupIndex).concat(corpus.groups.slice(0, nextGroupIndex));
  const other = orderedGroups.find(name => name !== group &&
    corpus.all.some(question => question.group === name && !seen.has(question.id)));
  otherCategory.hidden = !other;
  if (other) {
    suggested.value = other;
    suggested.textContent = `Play ${other}`;
  }
  setReplay();
  scoreHeading.focus();
}

function startRound(moveFocus = false, category = group) {
  group = category;
  groupName.textContent = group || 'All categories';
  for (const button of categoryList.children) {
    button.setAttribute('aria-pressed', String(button.value === group));
  }
  activeQuestions = selectRound(corpus, group, seen, roundNumber++);
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
    if (moveFocus) {
      const target = next.hidden ? categoryList.querySelector('[aria-pressed="true"]') : next;
      target.focus();
    }
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
  for (const name of [...corpus.groups, '']) {
    const button = document.createElement('button');
    button.type = 'button';
    button.value = name;
    button.textContent = name || 'All categories';
    button.addEventListener('click', () => {
      if (group !== name) startRound(true, name);
    });
    categoryList.append(button);
  }
  document.getElementById('quiz-categories').hidden = false;
  startRound(moveFocus);
}

choices.forEach((button, i) => button.addEventListener('click', () => selectAnswer(i)));
copyScore.addEventListener('click', async () => {
  const marks = activeQuestions.map((question, i) =>
    question.options[answers[i]] === question.answer ? '✓' : '×');
  const category = group ? ` (${group})` : '';
  const url = document.querySelector('link[rel="canonical"]').href;
  const text = `${score}/${activeQuestions.length} on What’s Bigger Than Max?${category}\n${marks.join(' ')}\n${url}`;
  try {
    await navigator.clipboard.writeText(text);
    copyScore.textContent = 'Score copied';
  } catch {
    shareText.value = text;
    shareText.hidden = false;
    shareText.focus();
    shareText.select();
  }
});
back.addEventListener('click', () => {
  if (summary.hidden) index--;
  showQuestion(true);
});
next.addEventListener('click', () => advance?.());
suggested.addEventListener('click', () => startRound(true, suggested.value));
initialize();
