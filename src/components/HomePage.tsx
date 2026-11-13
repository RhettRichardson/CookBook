import { useEffect, useMemo, useState } from 'react';
import { listGenres, recipes } from '../data/recipes';
import { readSession, writeSession } from '../lib/storage';
import { filterRecipes, groupByGenre } from '../lib/search';
import { ArrowIcon, SearchIcon } from './Icons';

export function HomePage() {
  const genres = useMemo(() => listGenres(recipes), []);
  const [query, setQuery] = useState(() => readSession('cookbook-query') ?? '');
  const [genre, setGenre] = useState(() => readSession('cookbook-genre') ?? 'All');
  const activeGenre = genre === 'All' || genres.includes(genre) ? genre : 'All';

  useEffect(() => {
    writeSession('cookbook-query', query);
    writeSession('cookbook-genre', activeGenre);
  }, [query, activeGenre]);

  const matched = useMemo(() => filterRecipes(recipes, query, activeGenre), [query, activeGenre]);
  const groups = useMemo(() => groupByGenre(matched, recipes), [matched]);
  const resultLabel = `${matched.length} ${matched.length === 1 ? 'recipe' : 'recipes'}`;

  return (
    <div className="home">
      <section className="hero">
        <p className="kicker">Rhett’s kitchen notebook</p>
        <h1>
          Recipes worth <em>repeating</em>.
        </h1>
        <p className="lede">
          Search the book, scale the batch, and cook one generous step at a time — phone on the counter, hands in the pot.
        </p>
      </section>

      <form className="search-panel" role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="recipe-search">Search recipes</label>
        <div className="search">
          <SearchIcon />
          <input
            id="recipe-search"
            type="search"
            value={query}
            className={query ? 'has-clear' : undefined}
            placeholder="Dish, method, or ingredient"
            autoComplete="off"
            enterKeyHint="search"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && query) {
                event.preventDefault();
                setQuery('');
              }
            }}
          />
          {query ? (
            <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">
              Clear
            </button>
          ) : null}
        </div>
      </form>

      <div className="chip-row" role="toolbar" aria-label="Food genres">
        <button type="button" className="chip" aria-pressed={activeGenre === 'All'} onClick={() => setGenre('All')}>
          All
        </button>
        {genres.map((name) => (
          <button
            key={name}
            type="button"
            className="chip"
            aria-pressed={activeGenre === name}
            onClick={() => setGenre(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <p className="result-count" aria-live="polite">
        {resultLabel}
      </p>

      {groups.length === 0 ? (
        <div className="empty">
          <p className="kicker">Nothing simmering</p>
          <h2>No recipes match that search.</h2>
          <p>Try a dish name, a method like crockpot, or an ingredient.</p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setQuery('');
              setGenre('All');
            }}
          >
            Show every recipe
          </button>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.genre} className="genre" aria-labelledby={`genre-${slugify(group.genre)}`}>
            <header className="genre-head">
              <h2 id={`genre-${slugify(group.genre)}`}>{group.genre}</h2>
              <p>
                {group.recipes.length} {group.recipes.length === 1 ? 'recipe' : 'recipes'}
              </p>
            </header>
            <div className="card-grid">
              {group.recipes.map((recipe) => (
                <a key={recipe.slug} className="recipe-card" href={`#/recipe/${recipe.slug}`}>
                  <div className="card-banner">
                    <span>{recipe.method}</span>
                    <ArrowIcon />
                  </div>
                  <div className="card-body">
                    <h3>{recipe.title}</h3>
                    <p className="card-meta">
                      <span>{recipe.prepTime} prep</span>
                      <span>{recipe.cookTime} cook</span>
                      <span>
                        {recipe.ingredients.length}{' '}
                        {recipe.ingredients.length === 1 ? 'ingredient' : 'ingredients'}
                      </span>
                    </p>
                    <p className="summary">{recipe.summary}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
