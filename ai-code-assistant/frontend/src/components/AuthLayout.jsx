import { Code2, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import { USE_MOCK } from '../services/api.js';

const POINTS = [
  { Icon: Sparkles, text: 'Explain unfamiliar code in plain language' },
  { Icon: ShieldCheck, text: 'Spot likely bugs and get corrected code' },
  { Icon: FileSearch, text: 'See the documentation behind each answer' },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="brand">
          <span className="brand-mark">
            <Code2 size={18} aria-hidden="true" />
          </span>
          <span className="brand-name">CodeSage AI</span>
        </div>
        <div>
          <h2 className="auth-headline">Understand code before you ship it.</h2>
          <ul className="auth-points">
            {POINTS.map(({ Icon, text }) => (
              <li key={text}>
                <Icon size={18} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="auth-aside-note">Built for the AI-Powered Code Explainer and Debugging Assistant using RAG.</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {USE_MOCK && (
            <div className="alert alert-info" role="note">
              <span>
                Demo Mode: no real account is created and nothing is sent to a server. Any valid email and a password
                of 8 or more characters will work.
              </span>
            </div>
          )}
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}
