import { AlertCircle, AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

const SEVERITY = {
  critical: { label: 'Critical', Icon: ShieldAlert, rank: 0 },
  high: { label: 'High', Icon: AlertTriangle, rank: 1 },
  medium: { label: 'Medium', Icon: AlertCircle, rank: 2 },
  low: { label: 'Low', Icon: Info, rank: 3 },
};

export function SeverityBadge({ severity }) {
  const config = SEVERITY[severity] ?? SEVERITY.low;
  const { Icon } = config;
  return (
    <span className={`badge badge-${SEVERITY[severity] ? severity : 'low'}`}>
      <Icon size={13} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default function IssueList({ issues = [] }) {
  if (issues.length === 0) {
    return (
      <div className="empty-state">
        <CheckCircle2 size={28} aria-hidden="true" />
        <h3>No issues detected</h3>
        <p>The analysis did not flag any problems in this code.</p>
      </div>
    );
  }

  const sorted = [...issues].sort(
    (a, b) => (SEVERITY[a.severity]?.rank ?? 9) - (SEVERITY[b.severity]?.rank ?? 9)
  );

  return (
    <ul className="issue-list">
      {sorted.map((issue) => (
        <li key={issue.id} className={`issue issue-${issue.severity}`}>
          <div className="issue-head">
            <SeverityBadge severity={issue.severity} />
            <h3 className="issue-title">{issue.title}</h3>
            {issue.line ? <span className="chip chip-mono">Line {issue.line}</span> : null}
          </div>
          <p className="issue-text">{issue.description}</p>
          <div className="issue-fix">
            <span className="issue-fix-label">Recommended fix</span>
            <p>{issue.fix}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
