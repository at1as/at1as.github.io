// Preserve the curated order until a reader chooses a sortable column. Missing
// values stay last in both directions; ties retain their original order.
export function sortAtlasRows(rows, valueFor, direction = "ascending") {
  if (!valueFor) return [...rows];
  const missing = value => value == null || value === "" ||
    (typeof value === "number" && !Number.isFinite(value));
  const sign = direction === "descending" ? -1 : 1;
  return rows.map((row, index) => ({ row, index, value: valueFor(row) }))
    .sort((a, b) => {
      if (missing(a.value) || missing(b.value)) {
        return Number(missing(a.value)) - Number(missing(b.value)) || a.index - b.index;
      }
      const comparison = typeof a.value === "number" && typeof b.value === "number"
        ? a.value - b.value
        : String(a.value).localeCompare(String(b.value), "en", { sensitivity: "base", numeric: true });
      return sign * comparison || a.index - b.index;
    }).map(({ row }) => row);
}

export const fundingSortValues = {
  organization: row => row.entity.name,
  // ISO dates sort chronologically without inventing a day for month/year precision.
  date: row => /^\d{4}(?:-\d{2}){0,2}$/.test(row.date || "") ? row.date : null,
  amount: row => Number.isFinite(row.amount) ? row.amount : null,
  type: row => row.type,
};

export const evidenceSortValues = {
  organization: row => row.name,
  approach: row => row.approach,
};

export const isMappedSite = site => Number.isFinite(site.latitude) && Number.isFinite(site.longitude);
export const isPlannedSite = site => /planned|construction/i.test(site.status || "");

// Count records, not clusters. Shared coordinates still represent separate sites;
// planning status overlaps the four mutually exclusive marker categories.
export function mapSiteCounts(sites) {
  const counts = { circle: 0, square: 0, diamond: 0, hexagon: 0, planned: 0 };
  for (const site of sites.filter(isMappedSite)) {
    const shape = site.marker_shape === "outlined_diamond" ? "diamond" : site.marker_shape;
    counts[["circle", "square", "diamond", "hexagon"].includes(shape) ? shape : "circle"]++;
    if (isPlannedSite(site)) counts.planned++;
  }
  return counts;
}
