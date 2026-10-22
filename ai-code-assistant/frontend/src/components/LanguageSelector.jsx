import { ChevronDown } from 'lucide-react';
import { LANGUAGES } from '../data/mockAnalysis.js';

export default function LanguageSelector({ value, onChange, disabled = false }) {
  return (
    <div className="select-wrap">
      <label htmlFor="language-select" className="sr-only">
        Programming language
      </label>
      <select
        id="language-select"
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {LANGUAGES.map((language) => (
          <option key={language.id} value={language.id}>
            {language.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="select-icon" aria-hidden="true" />
    </div>
  );
}
