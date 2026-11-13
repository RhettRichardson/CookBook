import { useEffect } from 'react';
import { getRecipe } from './data/recipes';
import { useHashRoute } from './hooks/useHashRoute';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { RecipePage } from './components/RecipePage';

export function App() {
  const theme = useTheme();
  const route = useHashRoute();
  const routeKey = route.name === 'recipe' ? route.slug : 'home';

  useEffect(() => {
    if (route.name === 'recipe') {
      const recipe = getRecipe(route.slug);
      document.title = recipe ? `${recipe.title} · Rhett's Cookbook` : "Recipe not found · Rhett's Cookbook";
    } else {
      document.title = "Rhett's Cookbook";
    }
    window.scrollTo(0, 0);
  }, [route, routeKey]);

  return (
    <div className="app">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <Header choice={theme.choice} onChange={theme.setChoice} />
      <main id="content" className="wrap">
        {route.name === 'recipe' ? <RecipePage slug={route.slug} /> : <HomePage />}
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <p>Written for the stove. After the first visit, the book opens offline.</p>
        </div>
      </footer>
    </div>
  );
}
