import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { defaultGroup, prepareCorpus, roundSize, selectRankingRound, selectRound } from '../../sites/model-names/corpus.mjs';

function readCorpus() {
  return ['questions', 'featured_questions', 'starter_round', 'ladders', 'rankings'].map(name =>
    JSON.parse(readFileSync(new URL(`../../sites/model-names/data/${name}.json`, import.meta.url), 'utf8')));
}

const corpus = prepareCorpus(...readCorpus());

test('the first round is a reproducible six-question sample across the starter groups', () => {
  const initial = selectRound(corpus, '', new Set(), 0);
  assert.equal(initial.length, roundSize);
  assert.equal(initial[0].id, [...corpus.starterIds][0]);
  assert.deepEqual(initial, selectRound(corpus, '', new Set(), 0));
  assert.ok(initial.every(question => corpus.starterIds.has(question.id)));
  const starterGroups = new Set(corpus.all.filter(question => corpus.starterIds.has(question.id)).map(question => question.group));
  assert.equal(new Set(initial.map(question => question.group)).size, Math.min(roundSize, starterGroups.size));
  assert.equal(new Set(initial.map(question => question.brand)).size, roundSize);
});

test('AI Model Naming opens with the curated six and has fresh questions on replay', () => {
  assert.equal(defaultGroup, 'AI Model Naming');
  assert.ok(corpus.all.every(q => q.category === 'ai' ? q.namingContext.trim() : q.namingContext === ''));
  const round = selectRound(corpus, defaultGroup, new Set(), 0);
  assert.equal(round.length, roundSize);
  assert.deepEqual(round.map(question => question.id), [...corpus.aiStarterIds]);
  assert.ok(round.every(question => question.category === 'ai'));
  const seen = new Set(round.map(question => question.id));
  const replay = selectRound(corpus, defaultGroup, seen, 1);
  assert.equal(replay.length, roundSize);
  assert.ok(replay.every(question => !seen.has(question.id)));
});

test('every group can be exhausted without repeated questions or ladders within a round', () => {
  for (const group of ['', ...corpus.groups]) {
    const expected = corpus.all.filter(question => !group || question.group === group);
    const seen = new Set();
    for (let number = 0; number < expected.length; number++) {
      const round = selectRound(corpus, group, seen, number);
      if (!round.length) break;
      assert.ok(round.length <= roundSize, group);
      const correctOnLeft = round.filter(question => question.options[0] === question.answer).length;
      assert.ok(Math.abs(correctOnLeft - (round.length - correctOnLeft)) <= 1, group);
      assert.equal(new Set(round.map(question => question.ladderId)).size, round.length, group);
      if (group === 'Institutions') assert.ok(round.length <= 3);
      for (const question of round) {
        assert.ok(!group || question.group === group);
        assert.ok(!seen.has(question.id), question.id);
        seen.add(question.id);
      }
    }
    assert.deepEqual(seen, new Set(expected.map(question => question.id)));
  }
});

test('the browser rejects duplicate IDs and questions with invalid answers or citations', () => {
  for (const corrupt of [
    questions => questions.push(questions[0]),
    questions => { questions[0].answer = questions[0].higher_than; },
    questions => { questions[0].source_urls = ['https://example.com/']; },
    questions => { questions[0].review_status = 'boundary'; }
  ]) {
    const data = readCorpus();
    corrupt(data[0].questions);
    assert.throws(() => prepareCorpus(...data), /Invalid quiz corpus/);
  }
});

test('ranking invites use only unseen lineups, even after a mixed or abandoned round', () => {
  const opening = selectRound(corpus, defaultGroup, new Set(), 0);
  const shown = new Set(opening.map(q => q.ladderId));
  const first = selectRankingRound(corpus, defaultGroup, shown, 0);
  assert.ok(first.length > 0);
  assert.deepEqual(first, selectRankingRound(corpus, defaultGroup, shown, 0));
  assert.ok(first.every(q => q.group === defaultGroup && !shown.has(q.ladderId)));
  // Only the displayed ranking counts as seen when a player switches categories.
  shown.add(first[0].ladderId);
  const remaining = new Set(corpus.rankings.filter(q => !shown.has(q.ladderId)).map(q => q.ladderId));
  for (let round = 1; remaining.size; round++) {
    const fresh = selectRankingRound(corpus, '', shown, round);
    assert.ok(fresh.length > 0 && fresh.length <= roundSize);
    for (const q of fresh) {
      assert.ok(remaining.delete(q.ladderId), q.id);
      shown.add(q.ladderId);
      assert.equal(q.options.length, 3);
      assert.deepEqual(new Set(q.options), new Set(q.order));
      assert.notDeepEqual(q.options, q.order);
    }
  }
  assert.deepEqual(selectRankingRound(corpus, '', shown, 12), []);
});

test('every ranking has three distinct tiers in documented order and a reviewed source', () => {
  const data = readCorpus();
  for (const q of corpus.rankings) {
    const ladder = data[3].ladders.find(l => l.id === q.ladderId);
    assert.deepEqual(q.order, ladder.low_to_high.map(n => n.label).reverse().filter(n => q.order.includes(n)));
    assert.equal(q.source, ladder.source_urls[0]);
    assert.equal(new Set(q.order).size, 3);
  }
  assert.ok(corpus.groups.every(group => corpus.rankings.some(q => q.group === group)));
  for (const invalid of [{names:['x','y','z']}, {names:['x','x','x']}, {ladder:'nonexistent'}, {ask:''}]) {
    const edited = structuredClone(data);
    Object.assign(edited[4][0], invalid);
    assert.throws(() => prepareCorpus(...edited), /Invalid quiz corpus/);
  }
});
