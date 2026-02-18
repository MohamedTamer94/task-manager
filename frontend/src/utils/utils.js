export function formatDate(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}