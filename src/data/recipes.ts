import type { MeasuredItem, Recipe } from '../types';

/**
 * Add a recipe by appending an object to this array.
 * `slug` becomes the shareable link: `#/recipe/<slug>`.
 * Set `amount` to a number when the batch scaler should change it, or `null` for "to taste".
 * List ingredient and seasoning ids on the step where they are used.
 */
export const recipes: Recipe[] = [
  {
    slug: 'crockpot-buffalo-chicken-pasta',
    title: 'Crockpot Buffalo Chicken Pasta',
    genre: 'Comfort & Crockpot',
    method: 'Crockpot',
    prepTime: '10 min',
    cookTime: '3–4 hrs',
    summary:
      'Creamy slow-cooker shredded buffalo chicken tossed with shell noodles and melted cheddar and mozzarella.',
    ingredients: [
      {
        id: 'chicken',
        name: 'Chicken',
        amount: 3,
        unit: 'lb',
        detail: 'Start — crockpot',
      },
      {
        id: 'buffalo-sauce',
        name: 'Buffalo sauce',
        amount: 1,
        unit: 'bottle',
        detail: 'Start — crockpot',
      },
      {
        id: 'cream-cheese',
        name: 'Cream cheese',
        amount: 12,
        unit: 'oz',
        detail: 'Start — crockpot',
      },
      {
        id: 'shell-noodles',
        name: 'Shell noodles',
        amount: 1,
        unit: 'box',
        detail: 'Boil separately near the end',
      },
      {
        id: 'cheddar',
        name: 'Cheddar cheese',
        amount: 1,
        unit: 'pack',
        detail: 'Stir in at the end',
      },
      {
        id: 'mozzarella',
        name: 'Mozzarella cheese',
        amount: 1,
        unit: 'pack',
        detail: 'Stir in at the end',
      },
    ],
    seasonings: [
      { id: 'seasoning-salt', name: 'Seasoning salt', amount: null },
      { id: 'black-pepper', name: 'Black pepper', amount: null },
      { id: 'onion-powder', name: 'Onion powder', amount: null },
      { id: 'garlic-powder', name: 'Garlic powder', amount: null },
      { id: 'herb-garlic', name: 'Herb & garlic seasoning', amount: null },
    ],
    steps: [
      {
        id: 'season',
        instruction:
          'Put chicken in the crockpot and season evenly with seasoning salt, black pepper, onion powder, garlic powder, and herb & garlic seasoning.',
        ingredientIds: ['chicken'],
        seasoningIds: [
          'seasoning-salt',
          'black-pepper',
          'onion-powder',
          'garlic-powder',
          'herb-garlic',
        ],
      },
      {
        id: 'sauce',
        instruction: 'Pour buffalo sauce over the chicken and add the cream cheese on top.',
        ingredientIds: ['buffalo-sauce', 'cream-cheese'],
        seasoningIds: [],
      },
      {
        id: 'cook',
        instruction:
          'Cover and cook on High for about 3–4 hours until the chicken is tender and shreds easily.',
        ingredientIds: [],
        seasoningIds: [],
      },
      {
        id: 'shred',
        instruction:
          'Shred the chicken with two forks directly in the crockpot and stir it into the buffalo cream cheese sauce.',
        ingredientIds: [],
        seasoningIds: [],
      },
      {
        id: 'pasta',
        instruction: 'Cook shell noodles on the stovetop until fully tender, then drain thoroughly.',
        ingredientIds: ['shell-noodles'],
        seasoningIds: [],
        tip: 'Start boiling pasta water around the 3-hour mark so everything comes together hot.',
      },
      {
        id: 'finish',
        instruction:
          'Add the cooked shell noodles, cheddar cheese, and mozzarella cheese into the crockpot, stir until melted and coated, and serve.',
        ingredientIds: ['cheddar', 'mozzarella'],
        seasoningIds: [],
        tip: 'Medium or large pasta shells hold the buffalo cream cheese sauce and shredded chicken best.',
      },
    ],
    equipment: ['Crockpot', 'Stovetop pot for pasta', 'Colander/strainer', 'Two forks'],
    notes: [
      'Medium or large pasta shells hold the buffalo cream cheese sauce and shredded chicken best.',
      'Start boiling pasta water around the 3-hour mark so everything comes together hot.',
    ],
  },
];

for (const recipe of recipes) {
  const known = new Map<string, MeasuredItem>();
  for (const item of [...recipe.ingredients, ...recipe.seasonings]) {
    if (known.has(item.id)) {
      throw new Error(`Duplicate item id "${item.id}" on ${recipe.slug}`);
    }
    known.set(item.id, item);
  }
  for (const step of recipe.steps) {
    for (const id of [...step.ingredientIds, ...step.seasoningIds]) {
      if (!known.has(id)) {
        throw new Error(`Recipe "${recipe.slug}" step "${step.id}" references missing item "${id}"`);
      }
    }
  }
}

const slugs = new Set<string>();
for (const recipe of recipes) {
  if (slugs.has(recipe.slug)) {
    throw new Error(`Duplicate recipe slug "${recipe.slug}"`);
  }
  slugs.add(recipe.slug);
}

export function getRecipe(slug: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}

export function stepItems(recipe: Recipe, step: Recipe['steps'][number]): MeasuredItem[] {
  const pick = (ids: string[], pool: MeasuredItem[]) =>
    ids.flatMap((id) => {
      const item = pool.find((entry) => entry.id === id);
      return item ? [item] : [];
    });
  return [...pick(step.ingredientIds, recipe.ingredients), ...pick(step.seasoningIds, recipe.seasonings)];
}

export function listGenres(list: Recipe[] = recipes): string[] {
  const genres: string[] = [];
  for (const recipe of list) {
    if (!genres.includes(recipe.genre)) genres.push(recipe.genre);
  }
  return genres;
}
