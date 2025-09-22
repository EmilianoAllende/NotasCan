export const getElapsedString = (ts) => {
  if (!ts) return '';
  const diffMs = Date.now() - ts;
  if (diffMs < 0) return '0 s';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remMin = minutes % 60;
    return remMin ? `${hours} h ${remMin} min` : `${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 día' : `${days} días`;
};
