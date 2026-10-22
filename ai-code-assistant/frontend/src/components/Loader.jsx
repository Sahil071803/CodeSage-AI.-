import { Loader2 } from 'lucide-react';

/**
 * Inline spinner by default; pass `block` for a centered panel with text.
 */
export default function Loader({ label, note, size = 18, block = false }) {
  if (!block) {
    return <Loader2 size={size} className="spin" aria-hidden="true" />;
  }

  return (
    <div className="loader-block" role="status" aria-live="polite">
      <span className="loader-ring">
        <Loader2 size={size} className="spin" aria-hidden="true" />
      </span>
      <p className="loader-label">{label || 'Loading…'}</p>
      {note && <p className="loader-note">{note}</p>}
    </div>
  );
}
