export function formatDateSeparator(date) {
  return date.toLocaleDateString('ru-RU', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  });
}