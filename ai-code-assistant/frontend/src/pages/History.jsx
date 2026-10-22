import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Bug, Clock, History as HistoryIcon, Sparkles, Trash2 } from 'lucide-react';
import Loader from '../components/Loader.jsx';
import { clearHistory, getHistory } from '../services/api.js';
import { languageLabel } from '../data/mockAnalysis.js';

function timeAgo(iso) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

export default function History() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getHistory()
      .then((data) => !cancelled && setEntries(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClear = async () => {
    await clearHistory();
    setEntries([]);
    setConfirming(false);
  };

  return (
    <div className="page">
      <header className="page-header page-header-row">
        <div>
          <span className="page-eyebrow">
            <HistoryIcon size={13} aria-hidden="true" />
            Activity
          </span>
          <h1>Analysis History</h1>
          <p className="page-subtitle">Previous analyses. Open one to see it again in the editor.</p>
        </div>
        {entries.length > 0 &&
          (confirming ? (
            <div className="actions">
              <button type="button" className="btn btn-danger" onClick={handleClear}>
                Clear all
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)}>
              <Trash2 size={16} aria-hidden="true" />
              Clear history
            </button>
          ))}
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Loader block label="Loading history…" />
      ) : entries.length === 0 ? (
        <div className="empty-state card">
          <Clock size={28} aria-hidden="true" />
          <h3>No analyses yet</h3>
          <p>Run Explain Code or Debug Code on the dashboard and it will show up here.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
            Go to dashboard
          </button>
        </div>
      ) : (
        <ul className="history-list">
          {entries.map((entry) => (
            <li key={entry.id} className="history-item">
              <div className="history-icon">
                {entry.mode === 'debug' ? <Bug size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
              </div>
              <div className="history-body">
                <h3 className="history-title">{entry.title}</h3>
                <div className="doc-meta">
                  <span className="chip">{entry.mode === 'debug' ? 'Debug' : 'Explain'}</span>
                  <span className="chip">{languageLabel(entry.language)}</span>
                  {entry.issueCount != null && (
                    <span className="chip chip-warn">
                      {entry.issueCount} {entry.issueCount === 1 ? 'issue' : 'issues'}
                    </span>
                  )}
                  {entry.sample && <span className="chip chip-info">Sample</span>}
                  <span className="muted">{timeAgo(entry.createdAt)}</span>
                </div>
              </div>
              <button type="button" className="btn btn-secondary btn-small" onClick={() => navigate('/', { state: { restore: entry } })}>
                Open
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
