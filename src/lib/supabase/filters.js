// Safely builds an ilike pattern for use inside a PostgREST `.or(...)`
// string filter. A raw `%${search}%` breaks if the search text contains a
// comma (or.() uses commas to separate conditions) — PostgREST's fix is to
// double-quote the value, with `\` and `"` inside it backslash-escaped.
export function ilikePattern(search) {
  const escaped = String(search).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}
