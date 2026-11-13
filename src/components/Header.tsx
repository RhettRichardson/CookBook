import type { ThemeChoice } from '../types';
import { MoonIcon, SunIcon, SystemIcon } from './Icons';

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof SunIcon }[] = [
  { value: 'system', label: 'Use system theme', icon: SystemIcon },
  { value: 'light', label: 'Use light theme', icon: SunIcon },
  { value: 'dark', label: 'Use dark theme', icon: MoonIcon },
];

export function Header({
  choice,
  onChange,
}: {
  choice: ThemeChoice;
  onChange: (choice: ThemeChoice) => void;
}) {
  return (
    <header className="site-header">
      <div className="wrap bar">
        <a className="brand" href="#/">
          <span className="brand-mark" aria-hidden="true">
            R
          </span>
          <span className="brand-text">
            <span className="brand-name">Rhett's Cookbook</span>
            <span className="brand-sub">Kitchen notebook</span>
          </span>
        </a>
        <div className="theme-switch" role="radiogroup" aria-label="Color theme">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = choice === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={option.label}
                title={option.label}
                onClick={() => onChange(option.value)}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
