export type MeasuredItem = {
  id: string;
  name: string;
  /** Amount for a 1× batch. Null means "to taste" and does not scale. */
  amount: number | null;
  /** Singular unit such as "lb", "oz", or "pack". */
  unit?: string;
  /** Short kitchen hint shown beside the item. */
  detail?: string;
};

export type CookStep = {
  id: string;
  instruction: string;
  ingredientIds: string[];
  seasoningIds: string[];
  tip?: string;
};

export type Recipe = {
  slug: string;
  title: string;
  genre: string;
  method: string;
  prepTime: string;
  cookTime: string;
  summary: string;
  ingredients: MeasuredItem[];
  seasonings: MeasuredItem[];
  steps: CookStep[];
  equipment: string[];
  notes: string[];
};

export type ThemeChoice = 'system' | 'light' | 'dark';

export type InstructionMode = 'all' | 'focus';
