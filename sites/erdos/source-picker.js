/* Both views use the same source choices and observed date ranges. */
window.populateErdosSourcePicker = function (picker, sources) {
  const descriptions = {
    'bloom-tao': 'The curated Erdős Problems catalog counts proofs, disproofs and other solutions. It also tracks statements and solutions in Lean.',
    'plasma': 'Counts accepted claims that settle the whole problem, including independence results. It tracks solutions in Lean.'
  };
  const help = document.getElementById('source-help');
  const list = help.querySelector('dl');
  const formatter = new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric', timeZone:'UTC'});
  const format = date => formatter.format(new Date(date + 'T00:00:00Z'));
  const options = sources.map(source => new Option(source.label, source.id));
  if (sources.length > 1) options.push(new Option('Combined', 'combined'));
  picker.replaceChildren(...options);
  list.replaceChildren();
  for (const source of sources) {
    const term = document.createElement('dt');
    const link = document.createElement('a');
    link.href = source.policy_url || source.repository;
    link.textContent = source.label;
    term.append(link);
    const range = document.createElement('span');
    range.textContent = format(source.history[0].date) + ' – ' + format(source.history.at(-1).date);
    const detail = document.createElement('dd');
    if (descriptions[source.id]) {
      term.append(' ', range);
      detail.textContent = descriptions[source.id];
    } else {
      detail.append(range);
    }
    list.append(term, detail);
  }
  help.querySelector('#combined-help').hidden = sources.length < 2;
  picker.disabled = false;
  picker.parentElement.querySelector('.source-info').hidden = false;
};
