import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export function RegisterPage({ onNavigateLogin, onRegisterSuccess }) {
  const { register, authError } = useAuth();
  const { navigateTo } = useShop();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionStep, setProvisionStep] = useState(null);
  const [formError, setFormError] = useState('');

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !password) {
      setFormError('Please fill out all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (!acceptedTerms) {
      setFormError('You must accept the Terms of Service to register');
      return;
    }

    setIsSubmitting(true);
    setProvisionStep('Provisioning tenant workspace identity in PostgreSQL...');

    const result = await register(name, email, password);

    if (result.success) {
      setProvisionStep('Allocating isolated container runtime environment...');
      setTimeout(() => {
        setIsSubmitting(false);
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else {
          navigateTo('workspace');
        }
      }, 1000);
    } else {
      setIsSubmitting(false);
      setProvisionStep(null);
    }
  };

  return (
    <main className="w-full max-w-[1200px] mx-auto px-4 py-12 md:py-20 flex justify-center items-center flex-grow">
      <div className="w-full max-w-md bg-white border border-[#e2ded9] p-8 sm:p-12 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#bc9c85] font-semibold block mb-2">
            Create Sho.V Workspace
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#151616] tracking-wider uppercase font-light">
            Register
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-light">
            Receive your unique tenant workspace and isolated container identity.
          </p>
        </div>

        {/* Provisioning Loader overlay */}
        {provisionStep ? (
          <div className="py-12 text-center space-y-4">
            <div className="inline-block w-10 h-10 border-2 border-[#151616] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#bc9c85] font-semibold">
              {provisionStep}
            </p>
            <p className="text-[11px] text-gray-400 font-light">
              Applying PostgreSQL tenant isolation & server-side container orchestration...
            </p>
          </div>
        ) : (
          <>
            {/* Error Feedback */}
            {(formError || authError) && (
              <div className="mb-6 bg-[#93000a]/10 border border-[#93000a]/30 p-3 text-center text-xs text-[#93000a]">
                {formError || authError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#151616] font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 text-xs border border-[#e2ded9] focus:border-[#151616] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#151616] font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 text-xs border border-[#e2ded9] focus:border-[#151616] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#151616] font-semibold mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-xs border border-[#e2ded9] focus:border-[#151616] focus:outline-none transition-colors"
                />
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${strength.color}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#151616] font-semibold mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-xs border border-[#e2ded9] focus:border-[#151616] focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 accent-[#151616]"
                  />
                  <span className="text-[11px] text-gray-600 font-light leading-snug">
                    I accept the Sho.V Multi-Tenant Terms of Service & Workspace Security Policy.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#151616] hover:bg-[#bc9c85] text-white py-4 text-xs font-semibold uppercase tracking-[0.25em] transition-colors shadow-md disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Provisioning..." : "Create Account & Workspace"}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-8 pt-6 border-t border-[#e2ded9] text-center">
              <p className="text-xs text-gray-500 font-light">
                Already have a workspace?{' '}
                <button
                  onClick={onNavigateLogin}
                  className="font-semibold text-[#151616] hover:text-[#bc9c85] underline transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
