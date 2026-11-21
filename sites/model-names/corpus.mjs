export const roundSize = 6;

export async function loadCorpus() {
  const files = ['questions', 'featured_questions', 'starter_round', 'ladders'];
  const [questions, featured, starter, ladders] = await Promise.all(files.map(async file => {
    const response = await fetch(new URL(`data/${file}.json`, import.meta.url));
    if (!response.ok) throw new Error(`Could not load ${file}`);
    return response.json();
  }));
  return prepareCorpus(questions, featured, starter, ladders);
}

function requireData(valid, message) {
  if (!valid) throw new Error(`Invalid quiz corpus: ${message}`);
}

const hasText = value => typeof value === 'string' && value.trim().length > 0;

export function prepareCorpus(questions, featured, starter, ladders) {
  const categories = ladders.meta.categories;
  const categoryById = new Map(categories.map(category => [category.id, category]));
  const ladderById = new Map(ladders.ladders.map(ladder => [ladder.id, ladder]));
  requireData(categoryById.size === categories.length && categories.every(category =>
    [category.id, category.name, category.group].every(hasText)), 'categories');
  requireData(ladderById.size === ladders.ladders.length, 'duplicate ladder IDs');

  const all = questions.questions.map(question => {
    const category = categoryById.get(question.category);
    const ladder = ladderById.get(question.ladder_id);
    requireData(category && ladder?.status === 'ready' && question.review_status === 'editorially_curated' &&
      question.brand === ladder.brand && question.category === ladder.category &&
      question.metric === ladder.ranking_metric && question.scope === ladder.scope, question.id);

    const { options, answer, higher_than: lower } = question;
    requireData([question.id, question.brand, question.question, question.explanation].every(hasText) &&
      Array.isArray(options) && options.length === 2 && options.every(hasText) &&
      answer !== lower && options.includes(answer) && options.includes(lower), question.id);
    const higherIndex = ladder.low_to_high.findIndex(tier => tier.label === answer);
    const lowerIndex = ladder.low_to_high.findIndex(tier => tier.label === lower);
    requireData(lowerIndex >= 0 && higherIndex > lowerIndex &&
      ladder.low_to_high[higherIndex].id === question.answer_node_id, question.id);

    const source = question.source_urls?.[0];
    requireData(hasText(source) && source === ladder.source_urls?.[0], question.id);
    const url = new URL(source);
    requireData(url.protocol === 'https:' && !url.username && !url.password, question.id);
    requireData(typeof question.featured === 'boolean' && [question.difficulty, question.surprise]
      .every(value => Number.isInteger(value) && value >= 1 && value <= 5), question.id);

    return {
      id: question.id,
      ladderId: ladder.id,
      brand: question.brand,
      category: category.id,
      group: category.group,
      company: `${question.brand} · ${category.name}`,
      ask: question.question,
      options,
      answer,
      why: question.explanation,
      source,
      featured: question.featured,
      difficulty: question.difficulty,
      surprise: question.surprise
    };
  });

  const byId = new Map(all.map(question => [question.id, question]));
  requireData(byId.size === all.length, 'duplicate question IDs');
  const featuredIds = new Set(featured.questions.map(question => question.id));
  requireData(featuredIds.size === featured.questions.length &&
    [...featuredIds].every(id => byId.get(id)?.featured) &&
    featuredIds.size === all.filter(question => question.featured).length, 'featured IDs');
  const starterIds = new Set(starter.question_ids);
  const starterLadders = new Set([...starterIds].map(id => byId.get(id)?.ladderId));
  requireData(starterIds.size === starter.question_ids.length &&
    [...starterIds].every(id => featuredIds.has(id)) && starterLadders.size >= roundSize, 'starter IDs');
  return { all, featuredIds, starterIds, groups: [...new Set(categories.map(category => category.group))] };
}

// Stable tie-breaker so the same sequence of rounds can be reproduced.
function seededRank(seed, id) {
  let hash = 2166136261;
  for (const character of `${seed}:${id}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return hash >>> 0;
}

export function selectRound(corpus, group, seen, roundNumber) {
  const initial = !group && roundNumber === 0;
  const preferred = roundNumber % 2 === 1 ? corpus.featuredIds : null;
  const candidates = corpus.all.filter(question => !seen.has(question.id) &&
    (!group || question.group === group) && (!initial || corpus.starterIds.has(question.id)));
  const seed = `model-names-v1:${group}:${roundNumber}`;
  const priority = initial
    ? new Map([...corpus.starterIds].map((id, position) => [id, position]))
    : new Map(candidates.map(question => [question.id, seededRank(seed, question.id)]));
  const round = [];
  const usedLadders = new Set();
  const count = (field, question) => round.filter(picked => picked[field] === question[field]).length;
  const variety = (field, a, b) => count(field, a) - count(field, b);
  const quality = question => initial ? 0 : Number(question.surprise >= 4) + Number(question.difficulty >= 3);

  while (round.length < roundSize) {
    const available = candidates.filter(question => !usedLadders.has(question.ladderId));
    if (!available.length) break;
    available.sort((a, b) => variety('group', a, b) || variety('category', a, b) || variety('brand', a, b) ||
      (preferred ? Number(preferred.has(b.id)) - Number(preferred.has(a.id)) : 0) ||
      quality(b) - quality(a) || priority.get(a.id) - priority.get(b.id));
    const question = available[0];
    round.push(question);
    usedLadders.add(question.ladderId);
  }
  // Shuffle which side wins independently of the order in which the editor wrote the pairs.
  const byAnswerSide = [...round].sort((a, b) =>
    seededRank(seed + ':side', a.id) - seededRank(seed + ':side', b.id));
  const leftCount = Math.floor((round.length + roundNumber % 2) / 2);
  const leftAnswers = new Set(byAnswerSide.slice(0, leftCount).map(question => question.id));
  return round.map(question => {
    const correctIsLeft = question.options[0] === question.answer;
    const options = correctIsLeft === leftAnswers.has(question.id)
      ? question.options : [...question.options].reverse();
    return { ...question, options };
  });
}
