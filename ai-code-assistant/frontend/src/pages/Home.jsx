import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Bot, Bug, RotateCcw, Sparkles, X } from 'lucide-react';
import CodeInput from '../components/CodeInput.jsx';
import LanguageSelector from '../components/LanguageSelector.jsx';
import FileUpload from '../components/FileUpload.jsx';
import AnalysisResult from '../components/AnalysisResult.jsx';
import Loader from '../components/Loader.jsx';
import { analyzeCode, saveHistoryEntry } from '../services/api.js';
import { CODE_FILE_ACCEPT, SAMPLE_CODE, languageFromFilename, languageLabel } from '../data/mockAnalysis.js';

function shorten(text, max = 60) {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(SAMPLE_CODE.python);
  const [problem, setProblem] = useState('');
  const [fileName, setFileName] = useState('');
  const [loadingMode, setLoadingMode] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('explanation');
  const [error, setError] = useState('');

  // Re-open an analysis chosen on the History page.
  useEffect(() => {
    const entry = location.state?.restore;
    if (!entry) return;
    setLanguage(entry.language);
    setCode(entry.code);
    setProblem(entry.problem || '');
    setFileName('');
    setResult({ ...entry.result, analyzedCode: entry.code, language: entry.language });
    setActiveTab(entry.mode === 'debug' ? 'issues' : 'explanation');
    setError('');
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const stale = Boolean(result) && (result.analyzedCode !== code || result.language !== language);

  const highlightLines = useMemo(() => {
    if (!result?.debug || stale) return [];
    return result.debug.issues.map((issue) => issue.line).filter(Boolean);
  }, [result, stale]);

  const busy = Boolean(loadingMode);

  const handleLanguageChange = (next) => {
    const untouched = !code.trim() || code === SAMPLE_CODE[language];
    setLanguage(next);
    if (untouched) setCode(SAMPLE_CODE[next]);
  };

  const handleReset = () => {
    setCode(SAMPLE_CODE[language]);
    setProblem('');
    setFileName('');
    setResult(null);
    setError('');
    setActiveTab('explanation');
  };

  const handleCodeFile = async (file) => {
    try {
      const text = await file.text();
      setCode(text);
      setFileName(file.name);
      const detected = languageFromFilename(file.name);
      if (detected) setLanguage(detected);
      setResult(null);
      setError('');
    } catch {
      setError('That file could not be read. Try another file.');
    }
  };

  const runAnalysis = async (mode) => {
    if (!code.trim()) {
      setError('The editor is empty. Paste or upload some code first.');
      return;
    }
    setError('');
    setLoadingMode(mode);
    try {
      const data = await analyzeCode({ mode, code, language, problem });
      const keep = result && result.analyzedCode === code && result.language === language ? result : {};
      const next = {
        explanation: data.explanation ?? keep.explanation ?? null,
        debug: data.debug ?? keep.debug ?? null,
        sources: data.sources ?? [],
        demo: Boolean(data.demo),
        matchesExample: data.matchesExample,
        analyzedCode: code,
        language,
      };
      setResult(next);
      setActiveTab(mode === 'debug' ? 'issues' : 'explanation');

      const action = mode === 'debug' ? 'Debug' : 'Explain';
      saveHistoryEntry({
        id: `h-${Date.now()}`,
        mode,
        language,
        code,
        problem,
        title: problem.trim() ? shorten(problem) : `${action} ${languageLabel(language)} snippet`,
        createdAt: new Date().toISOString(),
        issueCount: next.debug ? next.debug.issues.length : null,
        result: next,
      }).catch(() => {});
    } catch (err) {
      setError(err.message || 'The analysis failed. Try again.');
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <span className="page-eyebrow">
          <Bot size={13} aria-hidden="true" />
          AI Code Assistant
        </span>
        <h1>Understand, debug, and improve your code</h1>
        <p className="page-subtitle">
          Explain unfamiliar code, surface likely bugs, and ground every answer in real programming documentation.
        </p>
      </header>

      <div className="workspace">
        <section className="card" aria-labelledby="code-input-title">
          <div className="card-header">
            <h2 id="code-input-title">Code input</h2>
            <LanguageSelector value={language} onChange={handleLanguageChange} disabled={busy} />
          </div>

          <div className="field">
            <label htmlFor="problem">
              Describe the problem <span className="muted">(optional)</span>
            </label>
            <textarea
              id="problem"
              className="textarea"
              rows={2}
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              placeholder="For example: the average looks wrong for my test scores."
            />
          </div>

          <CodeInput value={code} onChange={setCode} language={language} highlightLines={highlightLines} />

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
              <button type="button" className="icon-btn alert-close" onClick={() => setError('')} aria-label="Dismiss error">
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => runAnalysis('explain')} disabled={busy}>
              {loadingMode === 'explain' ? <Loader size={16} /> : <Sparkles size={16} aria-hidden="true" />}
              Explain Code
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => runAnalysis('debug')} disabled={busy}>
              {loadingMode === 'debug' ? <Loader size={16} /> : <Bug size={16} aria-hidden="true" />}
              Debug Code
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleReset}
              disabled={busy}
              title="Restore the example code and clear results"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reset
            </button>
          </div>

          <FileUpload
            id="code-file"
            accept={CODE_FILE_ACCEPT}
            label="Upload a source file"
            hint="Drop a code file or .txt here, or click to browse. Max 1 MB. PDF and TXT documentation belongs in the Knowledge Base."
            maxSizeMB={1}
            fileName={fileName}
            onFile={handleCodeFile}
            onClear={() => setFileName('')}
            disabled={busy}
          />
        </section>

        <section className="card" aria-label="Analysis results">
          <AnalysisResult
            result={result}
            loadingMode={loadingMode}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            stale={stale}
            onApplyFix={(fixed) => setCode(fixed)}
          />
        </section>
      </div>
    </div>
  );
}
