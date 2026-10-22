import { useState } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';

/**
 * Drag-and-drop or click-to-browse file picker.
 * Validates extension and size, then hands the File to `onFile`.
 */
export default function FileUpload({
  id,
  accept,
  label,
  hint,
  maxSizeMB = 5,
  fileName = '',
  onFile,
  onClear,
  disabled = false,
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const allowed = accept.split(',').map((ext) => ext.trim().toLowerCase());

  const handleFile = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!allowed.some((ext) => name.endsWith(ext))) {
      setError(`Unsupported file type. Allowed: ${allowed.join(', ')}`);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`That file is larger than ${maxSizeMB} MB.`);
      return;
    }
    setError('');
    onFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="upload">
      <label
        htmlFor={id}
        className={`dropzone${dragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <UploadCloud size={22} aria-hidden="true" />
        <span className="dropzone-title">{label}</span>
        <span className="dropzone-hint">{hint}</span>
        <input
          id={id}
          type="file"
          className="sr-only"
          accept={accept}
          disabled={disabled}
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      {fileName && (
        <div className="file-chip">
          <FileText size={16} aria-hidden="true" />
          <span className="file-chip-name">{fileName}</span>
          {onClear && (
            <button type="button" className="icon-btn" onClick={onClear} aria-label={`Remove ${fileName}`}>
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
