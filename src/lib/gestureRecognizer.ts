// Wand path gesture recognizer
// Tracks the path drawn by the wand tip and matches against known spell patterns

export interface PathPoint {
  x: number;
  y: number;
  t: number;
}

export type SpellGesture = "V" | "circle" | "line" | "zigzag" | "none";

// Normalize path to unit square
function normalizePath(points: PathPoint[]): Array<{ x: number; y: number }> {
  if (points.length < 3) return [];
  
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return points.map((p) => ({
    x: (p.x - minX) / rangeX,
    y: (p.y - minY) / rangeY,
  }));
}

// Check if path forms a V shape
function isVShape(normalized: Array<{ x: number; y: number }>): boolean {
  if (normalized.length < 5) return false;

  // Find the lowest point (highest y value since y increases downward)
  let lowestIdx = 0;
  let lowestY = -Infinity;
  for (let i = 0; i < normalized.length; i++) {
    if (normalized[i].y > lowestY) {
      lowestY = normalized[i].y;
      lowestIdx = i;
    }
  }

  // V shape: lowest point should be roughly in the middle
  const midRatio = lowestIdx / normalized.length;
  if (midRatio < 0.25 || midRatio > 0.75) return false;

  // Start and end should be at the top
  const startY = normalized[0].y;
  const endY = normalized[normalized.length - 1].y;
  if (startY > 0.4 || endY > 0.4) return false;
  if (lowestY < 0.7) return false;

  return true;
}

// Check if path forms a circle
function isCircle(normalized: Array<{ x: number; y: number }>): boolean {
  if (normalized.length < 8) return false;

  // Center should be roughly at (0.5, 0.5)
  let cx = 0, cy = 0;
  for (const p of normalized) {
    cx += p.x;
    cy += p.y;
  }
  cx /= normalized.length;
  cy /= normalized.length;

  // Check radial variance is low (points are roughly equidistant from center)
  const radii = normalized.map((p) => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2));
  const avgRadius = radii.reduce((a, b) => a + b) / radii.length;
  const variance = radii.reduce((sum, r) => sum + (r - avgRadius) ** 2, 0) / radii.length;

  // Low variance = circular
  if (variance > 0.03) return false;

  // Check that start and end are close (loop is closed)
  const startEnd = Math.sqrt(
    (normalized[0].x - normalized[normalized.length - 1].x) ** 2 +
    (normalized[0].y - normalized[normalized.length - 1].y) ** 2
  );

  return startEnd < 0.4;
}

// Check if path is a straight line
function isStraightLine(normalized: Array<{ x: number; y: number }>): boolean {
  if (normalized.length < 4) return false;

  // Calculate angle of start to end
  const dx = normalized[normalized.length - 1].x - normalized[0].x;
  const dy = normalized[normalized.length - 1].y - normalized[0].y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 0.5) return false;

  // Check deviation from line
  let maxDev = 0;
  for (const p of normalized) {
    const t = ((p.x - normalized[0].x) * dx + (p.y - normalized[0].y) * dy) / (length * length);
    const projX = normalized[0].x + t * dx;
    const projY = normalized[0].y + t * dy;
    const dev = Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
    maxDev = Math.max(maxDev, dev);
  }

  return maxDev < 0.15;
}

// Check for zigzag pattern
function isZigzag(normalized: Array<{ x: number; y: number }>): boolean {
  if (normalized.length < 6) return false;

  // Count direction changes in x
  let dirChanges = 0;
  for (let i = 2; i < normalized.length; i++) {
    const prevDir = Math.sign(normalized[i - 1].x - normalized[i - 2].x);
    const currDir = Math.sign(normalized[i].x - normalized[i - 1].x);
    if (prevDir !== 0 && currDir !== 0 && prevDir !== currDir) {
      dirChanges++;
    }
  }

  return dirChanges >= 3;
}

export function recognizeGesture(trail: PathPoint[], maxAge = 1.5): SpellGesture {
  const now = performance.now() / 1000;
  // Filter to recent points only
  const recent = trail.filter((p) => now - p.t / 1000 < maxAge);
  if (recent.length < 5) return "none";

  const normalized = normalizePath(recent);
  if (normalized.length < 5) return "none";

  // Check patterns in order of specificity
  if (isCircle(normalized)) return "circle";
  if (isVShape(normalized)) return "V";
  if (isZigzag(normalized)) return "zigzag";
  if (isStraightLine(normalized)) return "line";

  return "none";
}

// Map gesture to spell name
export function gestureToSpell(gesture: SpellGesture): string | null {
  switch (gesture) {
    case "V": return "Expelliarmus";
    case "circle": return "Protego";
    case "line": return "Stupefy";
    case "zigzag": return "Incendio";
    default: return null;
  }
}
