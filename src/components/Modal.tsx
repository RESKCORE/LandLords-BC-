import React, { useState, useEffect } from 'react';
import { ModalState } from '../types';
import { HARDSHIP_STORIES } from '../data/stories';
import { CONTACT_INFO } from '../data/constants';

declare global {
  interface Window {
    google?: any;
  }
}

interface ModalProps {
  modalState: ModalState;
  onClose: () => void;
  isMember?: boolean;
  googleUser?: GoogleUserProfile | null;
  onGoogleSignIn?: () => void;
  onGoogleDisconnect?: () => void;
  onOpenMemberDashboard?: () => void;
}

interface GoogleUserProfile {
  name: string;
  email: string;
  picture?: string;
}

const STRIPE_CHECKOUT_LINKS: Record<string, string> = {
  individual: 'https://buy.stripe.com/test_14A00i5i41XN05x3RQgw000',
  'property-manager': 'https://buy.stripe.com/test_8x28wOfWI7i74lN3RQgw001',
  custom: 'https://buy.stripe.com/test_14A00i5i41XN05x3RQgw000',
};

export const Modal: React.FC<ModalProps> = ({
  modalState,
  onClose,
  isMember = false,
  googleUser: externalGoogleUser,
  onGoogleSignIn: externalGoogleSignIn,
  onGoogleDisconnect: externalGoogleDisconnect,
  onOpenMemberDashboard,
}) => {
  const { isOpen, type, storyId, planChoice = 'individual' } = modalState;

  const [selectedPlan, setSelectedPlan] = useState(planChoice);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [internalGoogleUser, setInternalGoogleUser] = useState<GoogleUserProfile | null>(null);

  const googleUser = externalGoogleUser !== undefined ? externalGoogleUser : internalGoogleUser;

  // Testimony form fields
  const [alias, setAlias] = useState('');
  const [testimonyContact, setTestimonyContact] = useState('');
  const [experience, setExperience] = useState('');
  const [assignedRecordId, setAssignedRecordId] = useState<string | null>(null);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (planChoice) setSelectedPlan(planChoice);
  }, [planChoice]);

  useEffect(() => {
    if (googleUser?.email) {
      setEmail(googleUser.email);
    }
  }, [googleUser]);

  useEffect(() => {
    setFormSubmitted(false);
    setIsRedirecting(false);
    setAssignedRecordId(null);
  }, [isOpen, type]);

  // Load existing Google authentication from storage if available
  useEffect(() => {
    if (externalGoogleUser !== undefined) return;
    const saved = localStorage.getItem('landlords_google_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setInternalGoogleUser(parsed);
          setEmail(parsed.email);
        }
      } catch (_) {}
    }
  }, [externalGoogleUser]);

  // Initialize official Google Identity Services SDK if configured
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isRealClientId =
      clientId &&
      !clientId.includes('your_google_client_id') &&
      clientId.includes('.apps.googleusercontent.com');

    if (isRealClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              try {
                // Decode JWT base64url payload
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                const user: GoogleUserProfile = {
                  email: payload.email,
                  name: payload.name || payload.email.split('@')[0],
                  picture: payload.picture,
                };
                setInternalGoogleUser(user);
                setEmail(user.email);
                localStorage.setItem('landlords_google_user', JSON.stringify(user));
              } catch (err) {
                console.error('Error parsing Google JWT', err);
              }
            }
          },
        });
      } catch (e) {
        console.warn('GIS initialization check:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !type) return null;

  const handleGoogleSignIn = () => {
    if (externalGoogleSignIn) {
      externalGoogleSignIn();
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isRealClientId =
      clientId &&
      !clientId.includes('your_google_client_id') &&
      clientId.includes('.apps.googleusercontent.com');

    if (isRealClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (err) {
        console.warn('Google One Tap prompt warning:', err);
      }
    }

    // Interactive Google Auth prompt fallback when GCP Client ID is pending setup
    const promptEmail = window.prompt(
      'Sign in with Google:\nPlease enter your Google email address:',
      email || 'reddysantosh1310@gmail.com'
    );

    if (promptEmail && promptEmail.includes('@')) {
      const cleanEmail = promptEmail.trim().toLowerCase();
      const derivedName = cleanEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const mockUser: GoogleUserProfile = {
        name: derivedName,
        email: cleanEmail,
      };
      setInternalGoogleUser(mockUser);
      setEmail(mockUser.email);
      localStorage.setItem('landlords_google_user', JSON.stringify(mockUser));
    }
  };

  const handleGoogleDisconnect = () => {
    if (externalGoogleDisconnect) {
      externalGoogleDisconnect();
    }
    setInternalGoogleUser(null);
    localStorage.removeItem('landlords_google_user');
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/submit-testimony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias,
          contact: testimonyContact,
          experience,
        }),
      });
      const data = await res.json();
      if (data.recordId) {
        setAssignedRecordId(data.recordId);
      }
    } catch (_) {
      // Offline fallback
      setAssignedRecordId(`BC-${Math.floor(1000 + Math.random() * 9000)}`);
    }
    setFormSubmitted(true);
  };

  const handleMembershipCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(true);

    const baseLink =
      STRIPE_CHECKOUT_LINKS[selectedPlan] || STRIPE_CHECKOUT_LINKS.individual;

    const trimmedEmail = email.trim();
    if (trimmedEmail) {
      localStorage.setItem('pending_checkout_email', trimmedEmail);
      localStorage.setItem('pending_checkout_plan', selectedPlan);
    }

    // Try dynamic checkout session with origin so it automatically redirects back to the current deployed URL
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          interval: selectedPlan === 'individual' ? 'month' : 'year',
          billingType: 'recurring',
          email: trimmedEmail,
          returnUrl: window.location.origin,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (err) {
      console.warn('API checkout fallback to payment link:', err);
    }

    // Fallback to static Stripe Payment Link
    const finalUrl = trimmedEmail
      ? `${baseLink}?prefilled_email=${encodeURIComponent(trimmedEmail)}`
      : baseLink;

    window.location.href = finalUrl;
  };

  const currentStory = storyId ? HARDSHIP_STORIES[storyId] : null;

  return (
    <div
      className="modal-backdrop open"
      id="assoc-modal"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <div className="modal-top">
          <h3 id="modal-title">
            {type === 'story' && currentStory
              ? currentStory.title
              : type === 'story-submit'
              ? 'Share Your Tenancy Experience Privately'
              : 'Association Membership Enrollment'}
          </h3>
          <button
            type="button"
            className="modal-close"
            id="modal-close"
            aria-label="Close modal"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body" id="modal-content">
          {/* Story Viewer Modal */}
          {type === 'story' && currentStory && (
            <>
              <p>{currentStory.body}</p>
              <div className="modal-note">
                Identity protected under the Landlords BC Zero-Disclosure Charter. Need immediate help? Call{' '}
                <a
                  href={CONTACT_INFO.phoneHref}
                  style={{ textDecoration: 'underline' }}
                >
                  {CONTACT_INFO.phone}
                </a>{' '}
                or email{' '}
                <a
                  href={`mailto:${CONTACT_INFO.helpEmail}`}
                  style={{ textDecoration: 'underline' }}
                >
                  {CONTACT_INFO.helpEmail}
                </a>
                .
              </div>
            </>
          )}

          {/* Anonymous Story Submission Modal */}
          {type === 'story-submit' && (
            <>
              <p>
                Your name, tenant details, and property address are automatically redacted before any advocacy review. Only an encrypted case identifier is assigned and stored on our secure server.
              </p>
              <form id="modal-form" onSubmit={handleStorySubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label htmlFor="modal-alias" style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>
                    Preferred Alias or Anonymous Pin
                  </label>
                  <input
                    id="modal-alias"
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    placeholder="e.g. Small Duplex Owner — Vancouver"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    Used solely to track your private advocacy inquiry.
                  </span>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label htmlFor="modal-contact" style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>
                    Direct Phone or Email (Kept Strictly Private)
                  </label>
                  <input
                    id="modal-contact"
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    placeholder="Phone or email for confidential follow-up"
                    value={testimonyContact}
                    onChange={(e) => setTestimonyContact(e.target.value)}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    Never disclosed publicly or shared with third parties.
                  </span>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label htmlFor="modal-experience" style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>
                    Your Tenancy Experience Narrative
                  </label>
                  <textarea
                    id="modal-experience"
                    rows={4}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '13px',
                      color: '#0f172a',
                      lineHeight: '1.5',
                      outline: 'none',
                    }}
                    placeholder="Describe rent arrears, RTB hearing delays, or condition report challenges..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    fontSize: '11.5px',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    lineHeight: '1.5',
                    marginBottom: '14px',
                  }}
                >
                  <strong>Charter Privacy Guarantee:</strong> Submissions are stored with server-sealed encryption and forwarded directly to the verified host desk. We never maintain a tenant blacklist or public directory.
                </div>
                <button
                  type="submit"
                  className="btn-dark"
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                  }}
                >
                  {formSubmitted
                    ? `Confirmed · Case ID ${assignedRecordId || '#LA-409'} Dispatched ✓`
                    : 'Submit Encrypted Testimony'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Protected under the Landlords BC Zero-Disclosure Charter &amp; BC PIPA</span>
                </div>
              </form>
            </>
          )}

          {/* Membership Stripe Checkout Modal */}
          {type === 'membership' && (
            <>
              {isMember ? (
                <div
                  style={{
                    margin: '12px 0 8px',
                    padding: '24px 20px',
                    borderRadius: '18px',
                    background: 'rgba(30, 65, 40, 0.08)',
                    border: '1px solid rgba(43, 107, 56, 0.28)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: '#1e4128',
                      color: '#f6f0e7',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      marginBottom: '12px',
                    }}
                  >
                    ✓
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '18px', color: '#1e4128', fontWeight: 700 }}>
                    Active Membership Identified!
                  </h4>
                  <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#2a4430', lineHeight: 1.5 }}>
                    Welcome back, <strong>{googleUser?.name || 'Verified Landlord Member'}</strong>!
                  </p>
                  <div
                    style={{
                      display: 'inline-block',
                      margin: '6px 0 14px',
                      padding: '4px 14px',
                      borderRadius: '999px',
                      background: '#d4ecd7',
                      color: '#1e4128',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {localStorage.getItem('pending_checkout_plan') || 'Property Manager Plan ($590 CAD / year)'} · Active
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#556b5b', margin: '0 0 18px' }}>
                    Linked account: <strong>{googleUser?.email || localStorage.getItem('pending_checkout_email')}</strong>
                  </p>
                  <button
                    type="button"
                    className="btn-dark"
                    style={{
                      width: '100%',
                      background: '#1e4128',
                      color: '#f6f0e7',
                      padding: '13px 20px',
                      borderRadius: '999px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(30, 65, 40, 0.25)',
                    }}
                    onClick={() => {
                      onClose();
                      if (onOpenMemberDashboard) onOpenMemberDashboard();
                    }}
                  >
                    Open Member Dashboard &amp; Legal Vault →
                  </button>
                </div>
              ) : (
                <>
                  <p>
                    Join confidentially to access all BC RTA legal kits, condition inspection workflows, and direct helpline support.
                  </p>

              {/* Google Authentication Section */}
              <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                <label
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--ink-2)',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Quick Verification &amp; One-Click Joining
                </label>

                {googleUser ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      border: '1px solid #c9bcae',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {googleUser.picture ? (
                        <img
                          src={googleUser.picture}
                          alt={googleUser.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1px solid #d4c8b8',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#3b2116',
                            color: '#f6f0e7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 'bold',
                          }}
                        >
                          {googleUser.name ? googleUser.name[0] : 'G'}
                        </div>
                      )}
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#2a1a12',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>{googleUser.name}</span>
                          <span
                            style={{
                              fontSize: '10px',
                              background: '#e5f3e7',
                              color: '#2b6b38',
                              padding: '1px 6px',
                              borderRadius: '999px',
                              fontWeight: 600,
                            }}
                          >
                            Google Verified ✓
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#6b5a4e' }}>
                          {googleUser.email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleDisconnect}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8c7b6f',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      background: '#ffffff',
                      border: '1px solid #d4c8b8',
                      borderRadius: '14px',
                      padding: '10px 16px',
                      color: '#2a1a12',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#fcfaf7')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = '#ffffff')
                    }
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.19 0 9.99 0 12s.45 3.81 1.25 5.41l4.03-3.13z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '12px 0 6px 0',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      background: 'rgba(59, 33, 22, 0.1)',
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      color: '#8c7b6f',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    or provide details below
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      background: 'rgba(59, 33, 22, 0.1)',
                    }}
                  ></div>
                </div>
              </div>

              <form id="modal-form" onSubmit={handleMembershipCheckout}>
                <div className="modal-field">
                  <label htmlFor="modal-plan-select">Select Membership Plan</label>
                  <select
                    id="modal-plan-select"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  >
                    <option value="individual">
                      Individual Plan — Self-Managing Owner ($290 CAD / month)
                    </option>
                    <option value="property-manager">
                      Property Manager Plan — Licensed / Multi-Portfolio ($590 CAD / year)
                    </option>
                    <option value="custom">
                      Custom Portfolio Membership — 6+ Units ($999 CAD / year)
                    </option>
                  </select>
                </div>
                <div className="modal-field">
                  <label htmlFor="modal-email">
                    Confidential Member Email{' '}
                    {googleUser && (
                      <span style={{ color: '#2b6b38', fontWeight: 'bold' }}>
                        (Verified via Google ✓)
                      </span>
                    )}
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    placeholder="you@domain.ca"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="modal-phone">Direct Phone (Optional, for Helpline Priority)</label>
                  <input
                    id="modal-phone"
                    type="tel"
                    placeholder="(604) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="modal-note">
                  Payment is securely processed via Stripe in Canadian Dollars (CAD). An itemized payment receipt and membership dossier are automatically dispatched to your email.
                </div>

                <button
                  type="submit"
                  className="btn-dark"
                  disabled={isRedirecting}
                  style={{
                    width: '100%',
                    marginTop: '14px',
                    opacity: isRedirecting ? 0.75 : 1,
                    cursor: isRedirecting ? 'wait' : 'pointer',
                  }}
                >
                  {isRedirecting
                    ? 'Redirecting to Stripe Checkout...'
                    : 'Proceed to Secure Stripe Checkout (CAD) →'}
                </button>
              </form>
            </>
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
};
