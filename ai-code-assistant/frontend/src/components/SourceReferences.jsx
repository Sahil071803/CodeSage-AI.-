import { Link } from 'react-router-dom';
import { FileSearch, FlaskConical, Quote } from 'lucide-react';

export default function SourceReferences({ sources = [], demo = false }) {
  if (sources.length === 0) {
    return (
      <div className="empty-state">
        <FileSearch size={28} aria-hidden="true" />
        <h3>No supporting documentation found</h3>
        <p>
          The knowledge base has no relevant passages for this code, so this response is not backed by documentation.
          Treat it with caution, or add relevant notes in the{' '}
          <Link to="/knowledge-base">Knowledge Base</Link>.
        </p>
      </div>
    );
  }

  return (
    <div>
      {demo && (
        <div className="alert alert-info" role="note">
          <FlaskConical size={16} aria-hidden="true" />
          <span>
            Demonstration references. These passages are pre-written and were not retrieved from an index. Real retrieval
            starts once the backend is connected.
          </span>
        </div>
      )}
      <ul className="source-list">
        {sources.map((source) => (
          <li key={source.id} className="source">
            <h3 className="source-title">{source.title}</h3>
            <div className="source-meta">
              <span className="chip">{source.section}</span>
              {source.page && <span className="chip">{source.page}</span>}
            </div>
            <blockquote className="source-excerpt">
              <Quote size={14} aria-hidden="true" />
              <span>{source.excerpt}</span>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
}
