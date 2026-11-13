import { useEffect, useState } from 'react';
import { getRecipe, stepItems } from '../data/recipes';
import { useChecks } from '../hooks/useChecks';
import { useWakeLock } from '../hooks/useWakeLock';
import { formatFactor, formatMeasure } from '../lib/format';
import type { InstructionMode, MeasuredItem, Recipe } from '../types';
import { BackIcon } from './Icons';

const FACTORS = [0.5, 1, 1.5, 2] as const;

export function RecipePage({ slug }: { slug: string }) {
  const recipe = getRecipe(slug);
  if (!recipe) return <MissingRecipe />;
  return <CookingView key={recipe.slug} recipe={recipe} />;
}

function MissingRecipe() {
  return (
    <div className="missing">
      <a className="back-link" href="#/">
        <BackIcon /> Back to Cookbook
      </a>
      <h1>That page isn’t in the book.</h1>
      <p>The link may be old. Head back and pick a recipe from the shelf.</p>
    </div>
  );
}

function CookingView({ recipe }: { recipe: Recipe }) {
  const [factor, setFactor] = useState<number>(1);
  const [mode, setMode] = useState<InstructionMode>('all');
  const [stepIndex, setStepIndex] = useState(0);
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const checks = useChecks(recipe.slug);
  const wake = useWakeLock(wakeEnabled);

  useEffect(() => {
    if (mode !== 'focus') return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (event.key === 'ArrowRight') {
        setStepIndex((current) => Math.min(recipe.steps.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft') {
        setStepIndex((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, recipe.steps.length]);

  return (
    <article className="recipe">
      <a className="back-link" href="#/">
        <BackIcon /> Back to Cookbook
      </a>
      <p className="kicker">{recipe.genre}</p>
      <h1 className="recipe-title">{recipe.title}</h1>
      <p className="deck">{recipe.summary}</p>
      <ul className="facts">
        <li>
          <span>Method</span>
          {recipe.method}
        </li>
        <li>
          <span>Prep</span>
          {recipe.prepTime}
        </li>
        <li>
          <span>Cook</span>
          {recipe.cookTime}
        </li>
        <li>
          <span>Batch</span>
          {formatFactor(factor)}
        </li>
      </ul>

      <div className="cook-layout">
        <section className="panel ingredients-panel" aria-labelledby="ingredients-heading">
          <div className="panel-block">
            <h2 id="batch-heading">Batch size</h2>
            <div className="batch-switch" role="group" aria-label="Batch size">
              {FACTORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={factor === value}
                  onClick={() => setFactor(value)}
                >
                  {formatFactor(value)}
                </button>
              ))}
            </div>
            <p className="hint">Measured ingredients scale. Seasonings stay to taste, and the cook time stays the same.</p>
          </div>

          <div className="panel-block">
            <div className="panel-head">
              <h2 id="ingredients-heading">Ingredients</h2>
              <button type="button" className="text-button" onClick={checks.reset} disabled={checks.checked.length === 0}>
                Reset checks
              </button>
            </div>
            <ul className="check-list">
              {recipe.ingredients.map((item) => (
                <CheckRow
                  key={item.id}
                  item={item}
                  factor={factor}
                  checked={checks.isChecked(item.id)}
                  onToggle={checks.toggle}
                />
              ))}
            </ul>
          </div>

          <div className="panel-block">
            <h2>Seasonings</h2>
            <ul className="check-list">
              {recipe.seasonings.map((item) => (
                <CheckRow
                  key={item.id}
                  item={item}
                  factor={factor}
                  checked={checks.isChecked(item.id)}
                  onToggle={checks.toggle}
                />
              ))}
            </ul>
          </div>
        </section>

        <div className="method-column">
          <div className="mode-bar no-print">
            <div className="mode-switch" role="tablist" aria-label="Instruction mode">
              <button
                type="button"
                role="tab"
                id="tab-all"
                aria-selected={mode === 'all'}
                aria-controls="steps-panel"
                onClick={() => setMode('all')}
              >
                All Steps
              </button>
              <button
                type="button"
                role="tab"
                id="tab-focus"
                aria-selected={mode === 'focus'}
                aria-controls="steps-panel"
                onClick={() => setMode('focus')}
              >
                Step-by-Step
              </button>
            </div>
            {wake.supported ? (
              <label className="wake-toggle">
                <input
                  type="checkbox"
                  checked={wakeEnabled}
                  onChange={(event) => setWakeEnabled(event.target.checked)}
                />
                <span>Keep screen awake</span>
                {wake.active ? <span className="wake-state">On</span> : null}
              </label>
            ) : null}
          </div>
          {wake.failed && wakeEnabled ? (
            <p className="hint wake-error">Couldn’t keep the screen awake in this browser.</p>
          ) : null}

          <div id="steps-panel" role="tabpanel" aria-labelledby={mode === 'all' ? 'tab-all' : 'tab-focus'}>
            <ol className={mode === 'focus' ? 'step-list screen-hidden' : 'step-list'}>
              {recipe.steps.map((item, index) => (
                <li key={item.id} className="step-card">
                  <span className="step-num">{index + 1}</span>
                  <p>{item.instruction}</p>
                </li>
              ))}
            </ol>

            {mode === 'focus' ? (
              <FocusStep
                recipe={recipe}
                index={stepIndex}
                factor={factor}
                onPrevious={() => setStepIndex((current) => Math.max(0, current - 1))}
                onNext={() => setStepIndex((current) => Math.min(recipe.steps.length - 1, current + 1))}
              />
            ) : null}
          </div>

          <section className="notes-block" aria-labelledby="equipment-heading">
            <h2 id="equipment-heading">Equipment</h2>
            <ul className="equipment">
              {recipe.equipment.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="notes-block" aria-labelledby="notes-heading">
            <h2 id="notes-heading">Kitchen notes</h2>
            <ul className="notes">
              {recipe.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}

function CheckRow({
  item,
  factor,
  checked,
  onToggle,
}: {
  item: MeasuredItem;
  factor: number;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  const measure = formatMeasure(item.amount, item.unit, item.amount == null ? 1 : factor);
  return (
    <li>
      <label className={checked ? 'check is-checked' : 'check'}>
        <input type="checkbox" checked={checked} onChange={() => onToggle(item.id)} />
        <span className="check-body">
          <span className="measure">{measure}</span>
          <span className="item-name">{item.name}</span>
          {item.detail ? <span className="detail">{item.detail}</span> : null}
        </span>
      </label>
    </li>
  );
}

function FocusStep({
  recipe,
  index,
  factor,
  onPrevious,
  onNext,
}: {
  recipe: Recipe;
  index: number;
  factor: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const step = recipe.steps[index];
  if (!step) return null;
  const items = stepItems(recipe, step);
  const atStart = index === 0;
  const atEnd = index === recipe.steps.length - 1;

  return (
    <div className="focus-view no-print" aria-live="polite">
      <div className="focus-step" key={step.id}>
        <p className="focus-kicker">
          Step {index + 1} of {recipe.steps.length}
        </p>
        <p className="instruction">{step.instruction}</p>
        <div className="step-extras">
          <h3>For this step</h3>
          {items.length === 0 ? (
            <p className="hint">Nothing new to measure — stay with the pot.</p>
          ) : (
            <ul className="used-list">
              {items.map((item) => (
                <li key={item.id}>
                  <span>{formatMeasure(item.amount, item.unit, item.amount == null ? 1 : factor)}</span>
                  {item.name}
                </li>
              ))}
            </ul>
          )}
          {step.tip ? (
            <p className="tip">
              <strong>Tip.</strong> {step.tip}
            </p>
          ) : null}
        </div>
      </div>
      <div className="step-nav">
        <button type="button" onClick={onPrevious} disabled={atStart}>
          Previous
        </button>
        <button type="button" className="next" onClick={onNext} disabled={atEnd}>
          Next
        </button>
      </div>
    </div>
  );
}
