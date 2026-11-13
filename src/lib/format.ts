const FRACTIONS: { value: number; glyph: string }[] = [
  { value: 0, glyph: '' },
  { value: 1 / 8, glyph: '⅛' },
  { value: 1 / 4, glyph: '¼' },
  { value: 1 / 3, glyph: '⅓' },
  { value: 3 / 8, glyph: '⅜' },
  { value: 1 / 2, glyph: '½' },
  { value: 5 / 8, glyph: '⅝' },
  { value: 2 / 3, glyph: '⅔' },
  { value: 3 / 4, glyph: '¾' },
  { value: 7 / 8, glyph: '⅞' },
  { value: 1, glyph: '' },
];

const PLURALS: Record<string, string> = {
  lb: 'lbs',
  bottle: 'bottles',
  box: 'boxes',
  pack: 'packs',
  cup: 'cups',
  clove: 'cloves',
  can: 'cans',
  oz: 'oz',
  tsp: 'tsp',
  tbsp: 'tbsp',
};

export function scaleAmount(amount: number, factor: number): number {
  const scaled = amount * factor;
  const eighths = Math.round(scaled * 8) / 8;
  if (Math.abs(eighths - scaled) < 0.02) return eighths;
  return Math.round(scaled * 100) / 100;
}

export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) return '';
  const sign = value < 0 ? '−' : '';
  const absolute = Math.abs(value);
  const whole = Math.floor(absolute + 1e-9);
  const fraction = absolute - whole;

  let closest = FRACTIONS[0];
  if (!closest) return sign + String(absolute);
  let distance = Infinity;
  for (const entry of FRACTIONS) {
    const next = Math.abs(fraction - entry.value);
    if (next < distance) {
      closest = entry;
      distance = next;
    }
  }

  if (distance > 0.02) {
    const rounded = Math.round(absolute * 100) / 100;
    return sign + String(rounded);
  }

  let carry = whole;
  let glyph = closest.glyph;
  if (closest.value === 1) {
    carry += 1;
    glyph = '';
  }
  if (carry === 0) return sign + (glyph || '0');
  if (!glyph) return sign + String(carry);
  return `${sign}${carry}${glyph}`;
}

export function pluralUnit(unit: string, amount: number): string {
  if (Math.abs(amount) <= 1) return unit;
  return PLURALS[unit] ?? (unit.endsWith('s') ? unit : `${unit}s`);
}

export function formatMeasure(amount: number | null, unit: string | undefined, factor: number): string {
  if (amount == null) return 'to taste';
  const scaled = scaleAmount(amount, factor);
  const quantity = formatQuantity(scaled);
  if (!unit) return quantity;
  return `${quantity} ${pluralUnit(unit, scaled)}`;
}

export function formatFactor(factor: number): string {
  return `${factor}×`;
}
