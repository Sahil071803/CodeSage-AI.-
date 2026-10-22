import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, FileText, FlaskConical, Library, Search } from 'lucide-react';
import FileUpload from '../components/FileUpload.jsx';
import Loader from '../components/Loader.jsx';
import { getKnowledgeDocs, uploadDocument, USE_MOCK } from '../services/api.js';

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lastUpload, setLastUpload] = useState('');

  useEffect(() => {
    let cancelled = false;
    getKnowledgeDocs()
      .then((data) => !cancelled && setDocs(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpload = async (file) => {
    setUploading(true);
    setError('');
    try {
      const doc = await uploadDocument(file);
      setDocs((current) => [doc, ...current]);
      setLastUpload(file.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return docs;
    return docs.filter((doc) => `${doc.title} ${doc.language} ${doc.description}`.toLowerCase().includes(term));
  }, [docs, query]);

  return (
    <div className="page">
      <header className="page-header">
        <span className="page-eyebrow">
          <Library size={13} aria-hidden="true" />
          Knowledge Base
        </span>
        <h1>Knowledge Base</h1>
        <p className="page-subtitle">
          Programming notes and documentation that answers should be grounded in. Upload PDF or TXT files to add your own.
        </p>
      </header>

      {USE_MOCK && (
        <div className="alert alert-info" role="note">
          <FlaskConical size={16} aria-hidden="true" />
          <span>
            Demo Mode: these are sample documents. Uploaded files are listed in this browser only and are not read,
            chunked, embedded, or searched until the backend is connected.
          </span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <FileUpload
          id="kb-file"
          accept=".pdf,.txt"
          label="Upload documentation"
          hint="PDF or TXT, up to 10 MB."
          maxSizeMB={10}
          fileName={lastUpload}
          onFile={handleUpload}
          onClear={() => setLastUpload('')}
          disabled={uploading}
        />
        {uploading && (
          <p className="inline-status" role="status">
            <Loader size={16} /> Uploading…
          </p>
        )}
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={16} aria-hidden="true" />
          <label htmlFor="kb-search" className="sr-only">
            Search documents
          </label>
          <input
            id="kb-search"
            type="search"
            className="input"
            placeholder="Search documents"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <span className="muted">
          {visible.length} {visible.length === 1 ? 'document' : 'documents'}
        </span>
      </div>

      {loading ? (
        <Loader block label="Loading documents…" />
      ) : visible.length === 0 ? (
        <div className="empty-state card">
          <Library size={28} aria-hidden="true" />
          <h3>{docs.length === 0 ? 'No documents yet' : 'No matching documents'}</h3>
          <p>
            {docs.length === 0
              ? 'Upload a PDF or TXT file to start building your knowledge base.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <ul className="doc-grid">
          {visible.map((doc) => (
            <li key={doc.id} className="doc-card">
              <div className="doc-icon">
                <FileText size={20} aria-hidden="true" />
              </div>
              <div className="doc-body">
                <h3 className="doc-title">{doc.title}</h3>
                <p className="doc-desc">{doc.description}</p>
                <div className="doc-meta">
                  <span className="chip">{doc.type}</span>
                  <span className="chip">{doc.language}</span>
                  <span className="chip">{doc.length}</span>
                  <span className="chip">{doc.size}</span>
                  <span className={`chip ${doc.status === 'sample' ? 'chip-info' : 'chip-warn'}`}>
                    {doc.status === 'sample' ? 'Sample' : 'Not indexed'}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
