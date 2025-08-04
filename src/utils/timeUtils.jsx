// Преобразование временной метки в строку
export function timeToString(timestamp) {
  if (isNaN(timestamp) || timestamp === 0) return "00:00:00";
  
  // Простой пример преобразования временной метки
  const date = new Date(timestamp * 1000);
  return date.toISOString().substr(11, 8);
}