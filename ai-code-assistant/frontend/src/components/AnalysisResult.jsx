import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, Bug, Check, Copy, FlaskConical, Lightbulb, Sparkles, Wrench } from 'lucide-react';
import IssueList from './IssueList.jsx';
import SourceReferences from './SourceReferences.jsx';
import Loader from './Loader.jsx';
import { USE_MOCK } from '../services/api.js';
import { languageLabel } from '../data/mockAnalysis.js';

const TABS = [
  { id: 'explanation', label: 'Code Explanation', Icon: Lightbulb },
  { id: 'issues', label: 'Detected Issues', Icon: Bug },
  { id: 'fix', label: 'Suggested Fix', Icon: Wrench },
  { id: 'sources', label: 'Source References', Icon: BookOpen },
];

function copyWithFallback(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(area);
  if (!ok) throw new Error('Copy failed');
}

function CopyButton({ text }) {
  const [state, setState] = useState('idle');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else copyWithFallback(text);
      setState('copied');
    } catch {
      setState('error');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  return (
    <button type="button" className="btn btn-small btn-ghost" onClick={copy}>
      {state === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'error' ? 'Copy failed' : 'Copy code'}</span>
    </button>
  );
}

function EmptyHint({ icon: Icon, title, text }) {
  return (
    <div className="empty-state">
      <Icon size={28} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ExplanationPanel({ explanation }) {
  if (!explanation) {
    return (
      <EmptyHint icon={Sparkles} title="No explanation yet" text="Choose Explain Code to see a summary and walkthrough." />
    );
  }
  return (
    <div className="stack">
      <section>
        <h3 className="section-title">Summary</h3>
        <p className="prose">{explanation.summary}</p>
      </section>

      <section>
        <h3 className="section-title">Step-by-step</h3>
        <ol className="steps">
          {explanation.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="section-title">Important functions and variables</h3>
        <ul className="entity-list">
          {explanation.entities.map((entity) => (
            <li key={entity.name}>
              <code className="entity-name">{entity.name}</code>
              <span className="chip">{entity.kind}</span>
              <span className="entity-desc">{entity.description}</span>
            </li>
          ))}
        </ul>
      </section>

      {explanation.note && (
        <div className="alert alert-warning" role="note">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{explanation.note}</span>
        </div>
      )}
    </div>
  );
}

function FixPanel({ debug, language, onApplyFix }) {
  if (!debug) {
    return <EmptyHint icon={Wrench} title="No fix yet" text="Choose Debug Code to get corrected code." />;
  }
  return (
    <div className="stack">
      <p className="prose">{debug.summary}</p>
      <div className="code-block">
        <div className="code-block-head">
          <span>Corrected code ({languageLabel(language)})</span>
          <div className="code-block-actions">
            <button type="button" className="btn btn-small btn-ghost" onClick={() => onApplyFix(debug.correctedCode)}>
              Apply to editor
            </button>
            <CopyButton text={debug.correctedCode} />
          </div>
        </div>
        <pre tabIndex={0}>
          <code>{debug.correctedCode}</code>
        </pre>
      </div>
    </div>
  );
}

export default function AnalysisResult({ result, loadingMode, activeTab, onTabChange, stale, onApplyFix }) {
  const issueCount = result?.debug?.issues?.length ?? 0;

  const handleKeyDown = (event) => {
    const index = TABS.findIndex((tab) => tab.id === activeTab);
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    onTabChange(TABS[next].id);
    document.getElementById(`tab-${TABS[next].id}`)?.focus();
  };

  return (
    <div className="analysis">
      <div className="card-header">
        <h2>Analysis</h2>
      </div>

      <div className="tabs" role="tablist" aria-label="Analysis sections" onKeyDown={handleKeyDown}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            type="button"
            role="tab"
            className={`tab${activeTab === id ? ' is-active' : ''}`}
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            tabIndex={activeTab === id ? 0 : -1}
            onClick={() => onTabChange(id)}
          >
            <Icon size={15} aria-hidden="true" />
            <span>{label}</span>
            {id === 'issues' && issueCount > 0 && <span className="tab-count">{issueCount}</span>}
          </button>
        ))}
      </div>

      <div className="tab-panel" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {loadingMode ? (
          <Loader
            block
            label={USE_MOCK ? `Preparing demo ${loadingMode} result…` : `Running ${loadingMode} analysis…`}
            note={USE_MOCK ? 'Demo Mode shows pre-written output. No AI model or document retrieval is running.' : undefined}
          />
        ) : !result ? (
          <EmptyHint
            icon={Sparkles}
            title="No analysis yet"
            text="Paste or upload code, then choose Explain Code or Debug Code. Results appear here."
          />
        ) : (
          <>
            {result.demo && (
              <div className="alert alert-info" role="note">
                <FlaskConical size={16} aria-hidden="true" />
                <span>
                  Demo Mode: this is pre-written sample output, not live AI inference.
                  {result.matchesExample === false && ' Your code differs from the built-in example, so line numbers may not apply.'}
                </span>
              </div>
            )}
            {stale && (
              <div className="alert alert-warning" role="status">
                <AlertTriangle size={16} aria-hidden="true" />
                <span>The code or language changed after this analysis. Run it again to refresh the results.</span>
              </div>
            )}
            {result.sources.length === 0 && activeTab !== 'sources' && (
              <div className="alert alert-warning" role="status">
                <AlertTriangle size={16} aria-hidden="true" />
                <span>No supporting documentation was found, so this response is not grounded in the knowledge base.</span>
              </div>
            )}

            {activeTab === 'explanation' && <ExplanationPanel explanation={result.explanation} />}
            {activeTab === 'issues' &&
              (result.debug ? (
                <IssueList issues={result.debug.issues} />
              ) : (
                <EmptyHint icon={Bug} title="No issues checked yet" text="Choose Debug Code to scan for problems." />
              ))}
            {activeTab === 'fix' && <FixPanel debug={result.debug} language={result.language} onApplyFix={onApplyFix} />}
            {activeTab === 'sources' && <SourceReferences sources={result.sources} demo={result.demo} />}
          </>
        )}
      </div>
    </div>
  );
}
