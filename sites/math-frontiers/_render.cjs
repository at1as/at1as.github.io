// Render the initial explorer with the same functions used for interaction.
const data = require('./data.json');
const M = require('./model.js');
const V = require('./view.js');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const problem = data.problems[0];
const list = M.milestones(problem, true);
const index = list.length - 1;
const current = list[index];
const chart = V.progressChart(problem, list, index, 'full', true, 680);
const status = M.statusText[current.status];
const ps = M.problemStatus(problem, true);
const slots = {
  COLLECTION_SUMMARY: escape(M.collectionSummary(data, true)),
  NAV: V.navigation(data, true, problem.id),
  CATEGORY: escape(problem.category),
  TITLE: escape(problem.name),
  PROBLEM_STATUS: escape(ps.label),
  PROBLEM_STATUS_CLASS: `problem-status ${ps.state}`,
  METRIC_LABEL: escape(problem.metric),
  METRIC_VALUE: V.metric(problem, current),
  STATUS_CLASS: M.reported(current) ? 'status report' : current.status === 'verified' ? 'status verified' : 'status',
  STATUS: status,
  DATE: escape(current.label),
  QUESTION: escape(problem.question),
  EXPLANATION: escape(problem.explanation),
  EVENT_DATE_CLASS: 'eyebrow' + (M.reported(current) ? ' report' : current.status === 'verified' ? ' verified' : ''),
  EVENT_DATE: escape(current.label + ' / ' + status),
  EVENT_TITLE: escape(current.title),
  EVENT_DETAIL: escape(current.detail),
  EVENT_WHO: escape(current.who),
  EVENT_URL: escape(current.url),
  EVENT_SOURCE_LABEL: escape(current.sourceLabel || 'Read the source'),
  EVENT_SUPPORT_URL: escape(current.supportUrl || ''),
  EVENT_SUPPORT_LABEL: escape(current.supportLabel || 'Supporting source'),
  EVENT_SUPPORT_HIDDEN: current.supportUrl ? '' : 'hidden',
  AI_NOTE: escape(current.ai ? 'AI contribution · ' + current.ai : 'No AI contribution is documented for this milestone in this collection.'),
  INTERPRETATION: escape(problem.interpretation),
  EXTRA_NOTE: problem.note || '',
  EXTRA_HIDDEN: problem.note ? '' : 'hidden',
  LAST_INDEX: String(index),
  POSITION: `${index + 1} / ${list.length}`,
  SLIDER_LABEL: escape(`${current.label}: ${V.shortMetric(problem, current)}`),
  CHART: chart.svg,
  LEGEND: chart.legend,
  UNIT: escape(chart.unit),
  NOTE: escape(chart.note),
  MILESTONES_DENSE: String(list.length > 7),
  MILESTONES: V.milestones(problem, list, index, true),
};
process.stdout.write(JSON.stringify(slots));
