# Rhett's Cookbook

A personal cookbook for the kitchen. Search by dish, genre, method, or ingredient, scale a batch, check off what you've added, and cook one step at a time. It is a static Progressive Web App with no account and no server.

Hosted at [rhettrichardson.github.io/CookBook](https://rhettrichardson.github.io/CookBook/).

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/CookBook/`.

```bash
npm run lint
npm run typecheck
npm run build
npm run preview
```

The preview is served at `http://localhost:4173/CookBook/`.

## Add a recipe

Append an object to the array in `src/data/recipes.ts`.

- `slug` is the link (`#/recipe/your-slug`). Keep it unique.
- `genre` becomes a filter chip and a section on the home page.
- Set `amount` to a number (and a singular `unit` like `lb` or `pack`) when the batch scaler should change it. Use `amount: null` for "to taste".
- Point each step's `ingredientIds` and `seasoningIds` at the items used in that step so focus mode can list them.

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml`, which builds the site and publishes it with GitHub Pages. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

The Vite `base` is `/CookBook/`, matching the project-site path.
