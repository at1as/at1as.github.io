import { defaults } from './model.js?v=58eee71b';

// The same 500 MW of fusion and Q = 10 in both cases. Only the heating system's
// electricity-to-plasma efficiency changes; these are not facility predictions.
export const learningScenarios = {
  loss: { ...defaults.continuous, driver: 0.25 },
  surplus: { ...defaults.continuous },
};
export function matchingLesson(scenario) {
  return Object.keys(learningScenarios).find(key =>
    Object.entries(learningScenarios[key]).every(([field, value]) => scenario[field] === value)) || '';
}
export const targetsPerDay = rate => rate * 24 * 60 * 60;
