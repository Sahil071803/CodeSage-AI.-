import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name.';
    if (!EMAIL_PATTERN.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setSubmitError('');
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      // The route guard redirects once the session exists.
    } catch (err) {
      setSubmitError(err.message || 'Sign up failed. Try again.');
      setSubmitting(false);
    }
  };

  const field = (id, label, Icon, { actions, ...props } = {}) => (
    <div className="field">
      <label htmlFor={`signup-${id}`}>{label}</label>
      <div className="input-wrap">
        <Icon size={16} aria-hidden="true" />
        <input
          id={`signup-${id}`}
          className="input"
          value={form[id]}
          onChange={update(id)}
          aria-invalid={Boolean(errors[id])}
          aria-describedby={errors[id] ? `signup-${id}-error` : undefined}
          {...props}
        />
        {actions}
      </div>
      {errors[id] && (
        <p id={`signup-${id}-error`} className="field-error">
          {errors[id]}
        </p>
      )}
    </div>
  );

  const toggle = (
    <button
      type="button"
      className="icon-btn input-action"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
    >
      {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
    </button>
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start explaining and debugging code in a minute."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {submitError && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        {field('name', 'Full name', User, { type: 'text', autoComplete: 'name', placeholder: 'Ada Lovelace' })}
        {field('email', 'Email', Mail, { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}
        {field('password', 'Password', Lock, {
          type: showPassword ? 'text' : 'password',
          autoComplete: 'new-password',
          placeholder: 'At least 8 characters',
          actions: toggle,
        })}
        {field('confirm', 'Confirm password', Lock, {
          type: showPassword ? 'text' : 'password',
          autoComplete: 'new-password',
          placeholder: 'Repeat your password',
        })}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting && <Loader size={16} />}
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
