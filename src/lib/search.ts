import type { MeasuredItem, Recipe } from '../types';

function names(items: MeasuredItem[]): string[] {
  return items.map((item) => item.name);
}

export function recipeHaystack(recipe: Recipe): string {
  return [
    recipe.title,
    recipe.genre,
    recipe.method,
    recipe.summary,
    recipe.prepTime,
    recipe.cookTime,
    ...names(recipe.ingredients),
    ...names(recipe.seasonings),
    ...recipe.equipment,
    ...recipe.notes,
  ]
    .join(' ')
    .toLowerCase();
}

export function filterRecipes(list: Recipe[], query: string, genre: string): Recipe[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return list.filter((recipe) => {
    if (genre !== 'All' && recipe.genre !== genre) return false;
    if (terms.length === 0) return true;
    const haystack = recipeHaystack(recipe);
    return terms.every((term) => haystack.includes(term));
  });
}

export function groupByGenre(matched: Recipe[], source: Recipe[]): { genre: string; recipes: Recipe[] }[] {
  const order: string[] = [];
  for (const recipe of source) {
    if (!order.includes(recipe.genre)) order.push(recipe.genre);
  }
  return order
    .map((genre) => ({
      genre,
      recipes: matched.filter((recipe) => recipe.genre === genre),
    }))
    .filter((group) => group.recipes.length > 0);
}
