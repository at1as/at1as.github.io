import { defaultGroup, loadCorpus, roundSize, selectRound, selectRankingRound } from './corpus.mjs?v=2';
import { createRankList } from './rank-list.mjs?v=2';

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
const pairChoices = card.querySelector('.quiz-choices');
const modes = document.getElementById('quiz-modes');
const rankingPanel = document.getElementById('quiz-ranking');
const checkOrder = document.getElementById('rank-check');
const rankOffer = document.getElementById('rank-offer');
const rankOfferButton = document.getElementById('rank-offer-button');
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
const historyKey = 'model-names:shown-ladders:v1';
let shownLadders = new Set();
try {
  const saved = JSON.parse(sessionStorage.getItem(historyKey));
  if (Array.isArray(saved)) shownLadders = new Set(saved.filter(id => typeof id === 'string'));
} catch { /* Keep history in memory when browser storage is unavailable. */ }
let corpus;
let group = defaultGroup;
let mode = new URLSearchParams(location.search).get('mode') === 'ranking' ? 'ranking' : 'pairs';
const roundNumbers = { pairs: 0, ranking: 0 };
let activeQuestions = [];
let answers = [];
let drafts = [];
let index = 0;
let score = 0;
let advance;
const renderRanking = createRankList(document.getElementById('rank-list'), document.getElementById('rank-row'), (order, update) => {
  drafts[index] = order;
  announcement.textContent = update;
});

function saveLadders() {
  try { sessionStorage.setItem(historyKey, JSON.stringify([...shownLadders])); } catch { /* In-memory fallback. */ }
}

function setNext(label, action, ready = true) {
  next.textContent = label;
  next.hidden = !action || !ready;
  next.parentElement.hidden = back.hidden && next.hidden;
  advance = action;
}

function showProgress(label) {
  progress.hidden = false;
  count.textContent = label;
  track.replaceChildren(...activeQuestions.map((_, position) => {
    const tick = document.createElement('span');
    if (answers[position] !== undefined) {
      tick.className = answers[position].correct ? 'right' : 'wrong';
    } else if (position === index) {
      tick.className = 'current';
    }
    return tick;
  }));
}

function showQuestion(moveFocus = false) {
  const question = activeQuestions[index];
  const answered = answers[index] !== undefined;
  if (mode === 'pairs') seen.add(question.id);
  if (!shownLadders.has(question.ladderId)) {
    shownLadders.add(question.ladderId);
    saveLadders();
  }
  card.dataset.questionId = question.id;
  message.textContent = '';
  announcement.textContent = '';
  summary.hidden = true;
  main.hidden = false;
  runningScore.hidden = false;
  runningValue.textContent = `${score} / ${activeQuestions.length}`;
  showProgress(`Question ${index + 1} of ${activeQuestions.length} · ${question.brand}`);
  heading.textContent = question.ask;
  const ranking = mode === 'ranking';
  context.textContent = ranking ? 'Drag the grips or use the arrows. One point for all three in order.' : question.namingContext;
  context.hidden = !context.textContent || (ranking && answered);
  if (!context.hidden) heading.setAttribute('aria-describedby', context.id);
  else heading.removeAttribute('aria-describedby');
  result.classList.remove('incorrect');
  result.replaceChildren();
  pairChoices.hidden = ranking;
  rankingPanel.hidden = !ranking;
  if (ranking) {
    renderRanking(drafts[index], answered ? question.order : undefined);
    checkOrder.hidden = answered;
  } else {
    choices.forEach((button, position) => {
      button.querySelector('.choice-label').textContent = '';
      button.querySelector('strong').textContent = question.options[position];
      button.classList.remove('chosen', 'correct');
      button.removeAttribute('aria-disabled');
      button.removeAttribute('tabindex');
    });
  }
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

function markPair(question, position) {
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
}

function showAnswer(question, { selection, correct }) {
  let correction = '';
  if (mode === 'pairs') {
    markPair(question, selection);
  } else if (!correct) {
    const matches = selection.filter((name, i) => name === question.order[i]).length;
    correction = ` ${matches} of 3 in place. The order is ${question.order.join(' → ')}.`;
  }
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
  const answerReadout = !correct && mode === 'pairs' ? ` The correct answer is ${question.answer}.` : '';
  scoreUpdate.textContent = `${answerReadout} Score ${score} of ${activeQuestions.length}. `;
  result.replaceChildren(verdict, `${correction} ${question.why} `, scoreUpdate, source);
}

function selectAnswer(selection) {
  if (answers[index] !== undefined || main.hidden) return;
  const question = activeQuestions[index];
  const correct = mode === 'ranking'
    ? question.order.every((name, i) => name === selection[i])
    : question.options[selection] === question.answer;
  answers[index] = { selection, correct };
  if (correct) score++;
  showQuestion();
  if (mode === 'ranking') next.focus();
}

function pickRound(category, gameMode) {
  return gameMode === 'ranking'
    ? selectRankingRound(corpus, category, shownLadders, roundNumbers.ranking)
    : selectRound(corpus, category, seen, roundNumbers.pairs);
}

function hasFreshRanking(category) {
  return corpus.rankings.some(q => (!category || q.group === category) && !shownLadders.has(q.ladderId));
}

function setReplay() {
  const upcoming = pickRound(group, mode);
  if (upcoming.length) {
    const label = mode === 'ranking' ? `Rank ${upcoming.length} more` :
      upcoming.length === roundSize ? 'Play another six' : `Play ${upcoming.length} more`;
    setNext(label, () => startRound(true));
  } else if (mode === 'ranking') {
    if (hasFreshRanking('')) {
      message.textContent = 'You’ve seen all the ranking lineups in this category.';
      setNext('Rank across categories', () => startRound(true, '', 'ranking'));
    } else {
      message.textContent = 'You’ve seen every lineup available for ranking.';
      setNext('Return to Pick One', () => startRound(true, group, 'pairs'));
    }
  } else if (seen.size === corpus.all.length) {
    message.textContent = 'You’ve seen every question.';
    setNext('Start a new session', () => {
      seen.clear();
      shownLadders.clear();
      saveLadders();
      roundNumbers.pairs = 0;
      roundNumbers.ranking = 0;
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
  rankOffer.hidden = mode !== 'pairs' || !hasFreshRanking('');
  if (!rankOffer.hidden) {
    const offerGroup = hasFreshRanking(group) ? group : '';
    rankOfferButton.value = offerGroup;
    rankOffer.querySelector('p').textContent = !offerGroup && group
      ? 'Rank three names from a fresh lineup in another category.' : 'Rank three names from a lineup you haven’t seen yet.';
  }
  const nextGroupIndex = corpus.groups.indexOf(group) + 1;
  const orderedGroups = corpus.groups.slice(nextGroupIndex).concat(corpus.groups.slice(0, nextGroupIndex));
  const other = orderedGroups.find(name => name !== group && (mode === 'ranking'
    ? hasFreshRanking(name) : corpus.all.some(question => question.group === name && !seen.has(question.id))));
  otherCategory.hidden = !other;
  if (other) {
    suggested.value = other;
    suggested.textContent = `Play ${other}`;
  }
  setReplay();
  scoreHeading.focus();
}

function startRound(moveFocus = false, category = group, gameMode = mode) {
  group = category;
  mode = gameMode;
  for (const button of modes.children) button.setAttribute('aria-pressed', String(button.value === mode));
  groupName.textContent = group || 'All categories';
  for (const button of categoryList.children) {
    button.setAttribute('aria-pressed', String(button.value === group));
  }
  activeQuestions = pickRound(group, mode);
  if (activeQuestions.length) roundNumbers[mode]++;
  answers = [];
  drafts = mode === 'ranking' ? activeQuestions.map(q => [...q.options]) : [];
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
  modes.hidden = false;
  startRound(moveFocus);
}

for (const button of modes.children) {
  button.addEventListener('click', () => {
    if (mode !== button.value) startRound(true, group, button.value);
  });
}
choices.forEach((button, i) => button.addEventListener('click', () => selectAnswer(i)));
checkOrder.addEventListener('click', () => selectAnswer([...drafts[index]]));
rankOfferButton.addEventListener('click', () => startRound(true, rankOfferButton.value, 'ranking'));
copyScore.addEventListener('click', async () => {
  const marks = answers.map(answer => answer.correct ? '✓' : '×');
  const category = group ? ` (${group})` : '';
  const url = new URL(document.querySelector('link[rel="canonical"]').href);
  if (mode === 'ranking') url.searchParams.set('mode', 'ranking');
  const game = mode === 'ranking' ? ' · Put Them in Order' : '';
  const text = `${score}/${activeQuestions.length} on What’s Bigger Than Max?${game}${category}\n${marks.join(' ')}\n${url}`;
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
