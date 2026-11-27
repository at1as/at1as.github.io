/* Shared calculations for the generated charts and browser controls. */
((root, factory) => {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ErdosTrends = factory();
})(typeof window === 'undefined' ? globalThis : window, () => {
  const DAY = 86400000;
  const catalogVersion = 4;
  const metrics = ['resolved', 'lean', 'statements'];
  const time = date => Date.parse(date + 'T00:00:00Z');
  const iso = ms => new Date(ms).toISOString().slice(0, 10);
  const net = c => c.gained.length + c.added.length + (c.baseline?.length || 0) - c.lost.length - c.removed.length + c.unmatched;
  function validate(data) {
    if (data.schema_version !== 1 || !data.points.length || data.intervals.length !== data.points.length - 1) throw Error('Invalid trends history');
    data.points.forEach(p=> {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || !Number.isFinite(time(p.date)) || !/^[a-f0-9]{40}$/.test(p.commit) ||
          ['total','resolved','resolved_lean','lean','statements'].some(k=>!Number.isSafeInteger(p[k])||p[k]<0) ||
          !p.total || p.resolved>p.total || p.resolved_lean>p.resolved || p.resolved_lean>p.lean || p.lean>p.total || p.statements>p.total) throw Error('Invalid trend snapshot');
    });
    data.intervals.forEach((interval, i) => {
      const a = data.points[i], b = data.points[i + 1];
      if (interval.start !== a.date || interval.end !== b.date || interval.before !== a.commit || interval.after !== b.commit ||
          interval.days !== (time(b.date) - time(a.date)) / DAY || interval.days <= 0) throw Error('Invalid trend interval');
      for (const metric of metrics) {
        const c = interval.changes[metric];
        const kinds = ['gained','lost','added','removed'];
        if ('baseline' in c) kinds.push('baseline');
        if (!Number.isInteger(c.unmatched) || kinds.some(k => !Array.isArray(c[k]) || c[k].some(id => !/^\d+$/.test(id))) || net(c) !== b[metric] - a[metric]) throw Error('Trend counts do not reconcile');
      }
    });
    return data;
  }

  function catalogSources(catalog, selection) {
    return selection === 'combined' ? catalog.sources : catalog.sources.filter(source => source.id === selection);
  }

  function summarize(rows, date, commit) {
    const point = {date, commit, total: 0, resolved: 0, lean: 0, statements: 0, resolved_lean: 0};
    for (const records of rows.values()) for (const record of records) {
      point.total++;
      for (const metric of record) point[metric]++;
      if (record.includes('resolved') && record.includes('lean')) point.resolved_lean++;
    }
    return point;
  }

  function mergeObservations(states) {
    states = states.filter(state => state.previous);
    if (states.length === 1) return new Map(states[0].rows);
    const merged = new Map();
    for (const {rows} of states) for (const [id, records] of rows) {
      const flags = merged.get(id) || new Set();
      // A duplicate within one source cannot supply a trustworthy identity match.
      if (records.length === 1) for (const metric of records[0]) flags.add(metric);
      merged.set(id, flags);
    }
    return new Map([...merged].map(([id, flags]) => [id, [[...flags]]]));
  }

  function applyObservation(state, observation) {
    for (const [id, flags] of Object.entries(observation.changes)) {
      if (flags === null) state.rows.delete(id);
      else state.rows.set(id, flags);
    }
    state.previous = observation;
  }

  function problemRowsAt(sources, date) {
    const states = sources.map(source => {
      const state = { rows: new Map(), previous: null };
      for (const observation of source.history) {
        if (observation.date > date) break;
        applyObservation(state, observation);
      }
      return state;
    });
    return mergeObservations(states);
  }

  function compareObservations(before, after, a, b, ambiguous, revisions, afterImport = null) {
    const changes = Object.fromEntries(metrics.map(metric => [metric, {gained:[], lost:[], added:[], removed:[], unmatched:0}]));
    const ids = [...new Set([...before.keys(), ...after.keys()])].sort((x,y) => Number(x)-Number(y));
    for (const id of ids) {
      if (ambiguous.has(id)) continue;
      const old = before.get(id)?.[0], next = after.get(id)?.[0];
      for (const metric of metrics) {
        const had = !!old?.includes(metric), has = !!next?.includes(metric);
        if (had === has) continue;
        const kind = has ? (old ? 'gained' : 'added') : (next ? 'lost' : 'removed');
        changes[metric][kind].push(id);
      }
    }
    if (afterImport) {
      for (const metric of metrics) changes[metric].baseline = [];
      for (const [id, records] of afterImport) {
        if (ambiguous.has(id)) continue;
        for (const metric of records[0]) {
          if (!after.get(id)?.[0]?.includes(metric)) changes[metric].baseline.push(id);
        }
      }
    }
    for (const metric of metrics) changes[metric].unmatched = b[metric] - a[metric] - net(changes[metric]);
    return {start:a.date, end:b.date, before:a.commit, after:b.commit, days:(time(b.date)-time(a.date))/DAY,
      changes, revisions, ambiguous_ids:[...ambiguous].sort((x,y) => Number(x)-Number(y))};
  }

  function rollup(catalog, selection) {
    if (catalog.schema_version !== catalogVersion || !Array.isArray(catalog.sources) || !Array.isArray(catalog.problems)) throw Error('Invalid problem data');
    const sources = catalogSources(catalog, selection);
    if (!sources.length || sources.some(source => !source.history?.length)) throw Error('Source history unavailable');
    const states = sources.map(source => ({source, rows:new Map(), previous:null}));
    const observations = new Map();
    for (const state of states) for (const snapshot of state.source.history) {
      if (!observations.has(snapshot.date)) observations.set(snapshot.date, []);
      observations.get(snapshot.date).push({state, snapshot});
    }
    const points = [], intervals = [];
    let previousRows, previousAmbiguous;
    for (const [date, updates] of [...observations].sort(([a],[b]) => a.localeCompare(b))) {
      const revisions = [];
      const imports = updates.filter(({state}) => !state.previous);
      const apply = ({state, snapshot}) => {
        const {source, previous} = state;
        const numbers = Object.keys(snapshot.changes);
        revisions.push({source:source.id, label:source.label, repository:source.repository,
          start:previous?.date || date, end:date, before:previous?.commit, after:snapshot.commit,
          numbers, metrics:source.metrics, ...(previous ? {} : {baseline:snapshot.changes})});
        applyObservation(state, snapshot);
      };
      updates.filter(({state}) => state.previous).forEach(apply);
      const beforeImport = previousRows && imports.length ? mergeObservations(states) : null;
      imports.forEach(apply);
      const current = mergeObservations(states);
      const ambiguous = new Set(states.flatMap(({rows}) => [...rows].filter(([, records]) => records.length > 1).map(([id]) => id)));
      const point = summarize(current, date, updates[0].snapshot.commit);
      if (previousRows) intervals.push(compareObservations(previousRows, beforeImport || current, points.at(-1), point,
        new Set([...previousAmbiguous, ...ambiguous]), revisions, beforeImport ? current : null));
      points.push(point);
      previousRows = current;
      previousAmbiguous = ambiguous;
    }
    const coverage = Object.fromEntries(metrics.flatMap(metric => {
      const dates = sources.filter(source => source.metrics.includes(metric)).map(source => source.history.at(-1).date).sort();
      return dates.length ? [[metric, dates[0]]] : [];
    }));
    return validate({schema_version:1, points, intervals, coverage, repository:sources[0].repository});
  }

  function evidence(interval, metric, number) {
    const ids = number ? [number] : interval.uncertain_ids || interval.changes[metric].gained;
    return (interval.revisions || []).filter(revision => revision.metrics.includes(metric) &&
      (interval.kind === 'baseline' ?
        ids.some(id => revision.baseline?.[id]?.[0]?.includes(metric)) :
        !revision.baseline && ids.some(id => revision.numbers.includes(id))));
  }

  function coveredThrough(data, metric) {
    const last = data.points.at(-1).date, covered = data.coverage?.[metric];
    return covered && covered < last ? covered : last;
  }

  function defaultRelease(data, releases) {
    const start = time(data.points[0].date), end = time(coveredThrough(data, 'resolved'));
    const pick = pool => {
      const eligible = pool.filter(release => time(release.date) - 30*DAY > start &&
        time(release.date) + 30*DAY <= end && !coverageChanged(data, 'resolved', time(release.date), 30));
      return eligible.at(-1);
    };
    const featured = releases.filter(release => release.featured !== false);
    const observedFeatured = featured.filter(release => release.date <= data.points.at(-1).date);
    const observed = releases.filter(release => release.date <= data.points.at(-1).date);
    return (pick(featured) || pick(releases) || observedFeatured.at(-1) || observed.at(-1) || featured[0] || releases[0])?.id;
  }

  function monthly(data, metric) {
    const months = new Map();
    const start = data.points[0].date, end = data.points.at(-1).date;
    let cursor = start.slice(0, 7) + '-01';
    while (cursor <= end) {
      months.set(cursor.slice(0, 7), {date: cursor, gained: 0, added: 0, baseline: 0, lost: 0, removed: 0, unmatched: 0, net: 0,
        partial: cursor < start || cursor.slice(0, 7) === end.slice(0, 7)});
      const next = new Date(time(cursor)); next.setUTCMonth(next.getUTCMonth() + 1); cursor = iso(+next);
    }
    data.intervals.forEach(interval => {
      const row = months.get(interval.end.slice(0, 7)), c = interval.changes[metric];
      row.gained += c.gained.length; row.added += c.added.length;
      row.baseline += c.baseline?.length || 0;
      row.lost -= c.lost.length; row.removed -= c.removed.length;
      row.unmatched += c.unmatched; row.net += net(c);
    });
    return [...months.values()];
  }
  function rolling(data, metric, days = 30) {
    const prefix = [0];
    data.intervals.forEach(interval => prefix.push(prefix.at(-1) + interval.changes[metric].gained.length));
    let baseline = 0;
    return data.points.flatMap((point, i) => {
      const target = time(point.date) - days * DAY;
      if (target < time(data.points[0].date)) return [];
      while (baseline + 1 < i && time(data.points[baseline + 1].date) <= target) baseline++;
      const elapsed = (time(point.date) - time(data.points[baseline].date)) / DAY;
      const events = prefix[i] - prefix[baseline];
      return [{date: point.date, start: data.points[baseline].date, days: elapsed, events, value: events / elapsed}];
    });
  }
  function coverageChanged(data, metric, release, days) {
    return data.intervals.some(interval => {
      const date = time(interval.end);
      return date >= release - days * DAY && date < release + days * DAY &&
        interval.revisions?.some(revision => revision.baseline && revision.metrics.includes(metric));
    });
  }
  function releaseWindow(data, date, metric, days = 30) {
    const release = time(date), uncertainIntervals = new Map();
    const changed = coverageChanged(data, metric, release, days);
    const evaluate = (start, end) => {
      let count = 0, uncertain = 0;
      for (const interval of data.intervals) {
        const b = time(interval.end);
        if (b < start) continue;
        for (const id of interval.changes[metric].gained) {
          const previous = evidence(interval, metric, id).map(revision => revision.start).sort()[0] || interval.start;
          const a = time(previous);
          if (a >= end) continue;
          // Compare against the contributing source's real observation gap.
          // An intervening snapshot from another catalog cannot narrow it.
          if (a >= start && b < end) count++;
          else {
            uncertain++;
            if (!uncertainIntervals.has(interval)) uncertainIntervals.set(interval, {start:previous, ids:new Set()});
            const observed = uncertainIntervals.get(interval);
            if (previous < observed.start) observed.start = previous;
            observed.ids.add(id);
          }
        }
      }
      // A first snapshot on the starting date may be partway through that day.
      const complete = start > time(data.points[0].date) && end <= time(coveredThrough(data, metric));
      return {start: iso(start), end: iso(end), count, uncertain, possible: count + uncertain,
        complete, rate: complete && !uncertain && !changed ? count / days : null,
        minRate: complete && !changed ? count / days : null,
        maxRate: complete && !changed ? (count + uncertain) / days : null};
    };
    const before = evaluate(release - days * DAY, release), after = evaluate(release, release + days * DAY);
    const intervals = [...uncertainIntervals].map(([interval, observed]) => ({...interval, start:observed.start,
      uncertain_ids:[...observed.ids]})).sort((a,b)=>a.start.localeCompare(b.start));
    return {before, after, uncertainIntervals:intervals, coverageChanged:changed};
  }
  function events(data, metric, period, kinds = ['gained', 'added', 'baseline', 'lost', 'removed']) {
    // Rate windows use the same baseline-exclusive, end-inclusive observations
    // as rolling(); month selections include every recorded kind of change.
    return data.intervals.filter(i => typeof period === 'string' ? i.end.startsWith(period) : i.end > period.start && i.end <= period.date).flatMap(interval =>
      kinds.flatMap(kind => (interval.changes[metric][kind] || []).map(number => ({number, kind, ...interval}))))
      .sort((a,b) => b.end.localeCompare(a.end) || Number(a.number) - Number(b.number));
  }
  return {DAY, catalogVersion, time, iso, net, validate, catalogSources, problemRowsAt, rollup, evidence, defaultRelease, monthly, rolling, releaseWindow, events};
});
