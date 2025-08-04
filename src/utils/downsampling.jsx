// Алгоритм Largest Triangle Three Buckets для downsampling
export function downsampleData(x, y, threshold) {
  if (x.length <= threshold) return { x, y };
  
  const bucketSize = Math.floor(x.length / threshold);
  const sampledX = [];
  const sampledY = [];
  
  for (let i = 0; i < threshold; i++) {
    const start = i * bucketSize;
    let end = (i + 1) * bucketSize;
    if (i === threshold - 1) end = x.length;
    
    let maxAreaIndex = -1;
    let maxArea = -1;
    
    // Найти точку с максимальной площадью треугольника
    for (let j = start + 1; j < end - 1; j++) {
      const area = Math.abs(
        0.5 * (
          (x[start] - x[j]) * (y[end - 1] - y[j]) - 
          (x[end - 1] - x[j]) * (y[start] - y[j])
        )
      );
      
      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }
    
    // Добавить начальную точку, точку с максимальной площадью и конечную точку
    if (i === 0) {
      sampledX.push(x[start]);
      sampledY.push(y[start]);
    }
    
    if (maxAreaIndex !== -1) {
      sampledX.push(x[maxAreaIndex]);
      sampledY.push(y[maxAreaIndex]);
    }
    
    if (i === threshold - 1) {
      sampledX.push(x[end - 1]);
      sampledY.push(y[end - 1]);
    }
  }
  
  return { x: sampledX, y: sampledY };
}