export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function valid(value: number | null | undefined): value is number {
  return typeof value === 'number' && isFinite(value);
}

export function calculateArea(width: number, length: number): number {
  return round2(width * length);
}

export function calculatePerimeter(width: number, length: number): number {
  return round2(2 * (width + length));
}

export function calculateWallArea(perimeter: number, height: number): number {
  return round2(perimeter * height);
}

export function calculateVolume(length: number, width: number, height: number): number {
  return round2(length * width * height);
}

export function calculateForService(
  measurements: Record<string, number | null>,
  geometry: string[]
): Record<string, number | null> {
  const result: Record<string, number | null> = {};

  const w = measurements.width;
  const l = measurements.length;
  const h = measurements.height;

  if (geometry.includes('area') && valid(w) && valid(l)) {
    result.floorArea = calculateArea(w, l);
  } else {
    result.floorArea = null;
  }

  if (geometry.includes('perimeter') && valid(w) && valid(l)) {
    result.perimeter = calculatePerimeter(w, l);
  } else {
    result.perimeter = null;
  }

  if (geometry.includes('wallArea') && valid(result.perimeter) && valid(h)) {
    result.wallArea = calculateWallArea(result.perimeter!, h);
  } else {
    result.wallArea = null;
  }

  if (geometry.includes('volume') && valid(w) && valid(l) && valid(h)) {
    result.volume = calculateVolume(l, w, h);
  } else {
    result.volume = null;
  }

  if (geometry.includes('linear') && valid(l)) {
    result.linearMeters = l;
  } else {
    result.linearMeters = null;
  }

  return result;
}
