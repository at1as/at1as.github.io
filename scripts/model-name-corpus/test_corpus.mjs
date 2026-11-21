import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { prepareCorpus, roundSize, selectRound } from '../../sites/model-names/corpus.mjs';

function readCorpus() {
  return ['questions', 'featured_questions', 'starter_round', 'ladders'].map(name =>
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

test('AI Model Naming has enough distinct families for a full round', () => {
  const ai = corpus.all.filter(question => question.category === 'ai');
  assert.ok(ai.length > 6);
  assert.ok(ai.every(question => question.group === 'AI Model Naming'));
  const round = selectRound(corpus, 'AI Model Naming', new Set(), 0);
  assert.equal(round.length, roundSize);
  assert.ok(round.every(question => question.category === 'ai'));
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
