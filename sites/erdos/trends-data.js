/* Shared calculations for the generated charts and browser controls. */
((root, factory) => {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ErdosTrends = factory();
})(typeof window === 'undefined' ? globalThis : window, () => {
  const DAY = 86400000;
  const time = date => Date.parse(date + 'T00:00:00Z');
  const iso = ms => new Date(ms).toISOString().slice(0, 10);
  const net = c => c.gained.length + c.added.length - c.lost.length - c.removed.length + c.unmatched;
  function validate(data) {
    if (data.schema_version !== 1 || data.points.length < 2 || data.intervals.length !== data.points.length - 1) throw Error('Invalid trends history');
    data.points.forEach(p=> {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || !Number.isFinite(time(p.date)) || !/^[a-f0-9]{40}$/.test(p.commit) ||
          ['total','resolved','resolved_lean','lean','statements'].some(k=>!Number.isSafeInteger(p[k])||p[k]<0) ||
          !p.total || p.resolved>p.total || p.resolved_lean>p.resolved || p.resolved_lean>p.lean || p.lean>p.total || p.statements>p.total) throw Error('Invalid trend snapshot');
    });
    data.intervals.forEach((interval, i) => {
      const a = data.points[i], b = data.points[i + 1];
      if (interval.start !== a.date || interval.end !== b.date || interval.before !== a.commit || interval.after !== b.commit ||
          interval.days !== (time(b.date) - time(a.date)) / DAY || interval.days <= 0) throw Error('Invalid trend interval');
      for (const metric of ['resolved', 'lean', 'statements']) {
        const c = interval.changes[metric];
        if (!Number.isInteger(c.unmatched) || ['gained','lost','added','removed'].some(k => !Array.isArray(c[k]) || c[k].some(id => !/^\d+$/.test(id))) || net(c) !== b[metric] - a[metric]) throw Error('Trend counts do not reconcile');
      }
    });
    return data;
  }
  function monthly(data, metric) {
    const months = new Map();
    const start = data.points[0].date, end = data.points.at(-1).date;
    let cursor = start.slice(0, 7) + '-01';
    while (cursor <= end) {
      months.set(cursor.slice(0, 7), {date: cursor, gained: 0, added: 0, lost: 0, removed: 0, unmatched: 0, net: 0,
        partial: cursor < start || cursor.slice(0, 7) === end.slice(0, 7)});
      const next = new Date(time(cursor)); next.setUTCMonth(next.getUTCMonth() + 1); cursor = iso(+next);
    }
    data.intervals.forEach(interval => {
      const row = months.get(interval.end.slice(0, 7)), c = interval.changes[metric];
      row.gained += c.gained.length; row.added += c.added.length;
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
  function releaseWindow(data, date, metric, days = 30) {
    const release = time(date);
    const evaluate = (start, end) => {
      const count = data.intervals.filter(i => time(i.end) >= start && time(i.end) < end)
        .reduce((sum, i) => sum + i.changes[metric].gained.length, 0);
      const complete = start >= time(data.points[0].date) && end <= time(data.points.at(-1).date);
      return {start: iso(start), end: iso(end), count, complete, rate: complete ? count / days : null};
    };
    return {before: evaluate(release - days * DAY, release), after: evaluate(release, release + days * DAY)};
  }
  function events(data, metric, month) {
    return data.intervals.filter(i => i.end.startsWith(month)).flatMap(interval =>
      ['gained', 'added', 'lost', 'removed'].flatMap(kind => interval.changes[metric][kind].map(number => ({number, kind, ...interval}))))
      .sort((a,b) => b.end.localeCompare(a.end) || Number(a.number) - Number(b.number));
  }
  return {DAY, time, iso, net, validate, monthly, rolling, releaseWindow, events};
});
