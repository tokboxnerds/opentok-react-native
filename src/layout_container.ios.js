export default function getBestDimensions(minRatio, maxRatio, count, Width, Height) {
  let maxArea;
  let targetCols;
  let targetRows;
  let targetHeight;
  let targetWidth;
  let tWidth;
  let tHeight;

  // Iterate through every possible combination of rows and columns
  // and see which one has the least amount of whitespace
  for (let i = 1; i <= count; i++) {
    const cols = i;
    const rows = Math.ceil(count / cols);

    // Try taking up the whole height and width
    tHeight = Math.floor(Height / rows);
    tWidth = Math.floor(Width / cols);

    let tRatio = tHeight / tWidth;
    if (tRatio > maxRatio) {
      // We went over decrease the height
      tRatio = maxRatio;
      tHeight = tWidth * tRatio;
    } else if (tRatio < minRatio) {
      // We went under decrease the width
      tRatio = minRatio;
      tWidth = tHeight / tRatio;
    }

    const area = (tWidth * tHeight) * count;

    // If this width and height takes up the most space then we're going with that
    if (maxArea === undefined || (area > maxArea)) {
      maxArea = area;
      targetHeight = tHeight;
      targetWidth = tWidth;
      targetCols = cols;
      targetRows = rows;
    }
  }
  
  return {
    maxArea,
    targetCols,
    targetRows,
    targetHeight,
    targetWidth,
  };
}
