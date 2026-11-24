import React, { useState } from 'react';
import { BackgroundVideo } from './common/BackgroundVideo';
import { VIDEOS, POSTERS, CONTACT_INFO } from '../data/constants';

interface ContactFooterProps {
  onNavigate: (hash: string) => void;
  onSubmitStory: () => void;
  onOpenResources: () => void;
  onOpenEventsNews: (tab?: 'events' | 'news') => void;
  onOpenPolicy: (policyId: string) => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  onNavigate,
  onSubmitStory,
  onOpenResources,
  onOpenEventsNews,
  onOpenPolicy,
}) => {
  const [callbackInput, setCallbackInput] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackInput.trim()) return;
    setCallbackSubmitted(true);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    onNavigate(hash);
  };

  return (
    <section className="s-foot" id="start">
      <div className="wrap">
        <div className="cta rv rv-scale">
          <BackgroundVideo
            id="v-cta"
            src={VIDEOS.cta}
            poster={POSTERS.cta}
            alt="British Columbia residential courtyard"
          />

          <h2 className="split" data-split>
            Connect
            <br />
            Directly
          </h2>
          <p
            className="rv"
            style={{ ['--d' as string]: 2 }}
          >
            Facing a complex BC tenancy dispute, rent arrears, or have a membership question? Reach our confidential landlord desk directly by phone or email.
          </p>

          <div
            className="direct-contact rv"
            style={{ ['--d' as string]: 2 }}
          >
            <a className="contact-link" href={CONTACT_INFO.phoneHref}>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="#2a1a12"
                strokeWidth="1.7"
              >
                <path
                  d="M3.5 4.5h3l1.5 3.5-2 1.5a11 11 0 0 0 4.5 4.5l1.5-2 3.5 1.5v3a2 2 0 0 1-2 2A14 14 0 0 1 1.5 4.5a2 2 0 0 1 2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Call {CONTACT_INFO.phone}</span>
            </a>
            <a
              className="contact-link"
              href={`mailto:${CONTACT_INFO.helpEmail}?subject=BC%20Tenancy%20Inquiry`}
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="#2a1a12"
                strokeWidth="1.7"
              >
                <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
                <path
                  d="M3 5.5l7 5 7-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{CONTACT_INFO.helpEmail}</span>
            </a>
          </div>

          <form
            className="sub rv"
            style={{ ['--d' as string]: 3 }}
            onSubmit={handleCallbackSubmit}
          >
            <input
              type="text"
              required
              aria-label="Phone number or email address"
              placeholder="Enter your phone or email for a private callback"
              value={callbackInput}
              onChange={(e) => setCallbackInput(e.target.value)}
            />
            <button className="btn-dark" type="submit">
              {callbackSubmitted ? 'Request Recorded ✓' : 'Request Callback'}
            </button>
          </form>
          <span
            className="sub-note rv"
            style={{ ['--d' as string]: 4 }}
          >
            Strictly confidential under the Zero-Disclosure Charter. No tenant names or street addresses required.
          </span>
        </div>

        <footer className="footer">
          <div className="cols">
            <div
              className="c-brand rv"
              style={{ ['--d' as string]: 0 }}
            >
              <div className="badge">
                <span className="dot" aria-hidden="true"></span>
                <span>BC Tenancy Association</span>
              </div>
              <p>
                A professional, non-adversarial platform for British Columbia rental-property owners under the Residential Tenancy Act (RTA).
              </p>
              <div className="socials">
                <a
                  href={CONTACT_INFO.phoneHref}
                  aria-label="Direct Phone Line"
                  title="Direct Phone Line"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2a1a12"
                    strokeWidth="1.8"
                  >
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href={`mailto:${CONTACT_INFO.helpEmail}`}
                  aria-label="Email Advisory Desk"
                  title="Email Advisory Desk"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2a1a12"
                    strokeWidth="1.8"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path
                      d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div
              className="rv"
              style={{ ['--d' as string]: 1 }}
            >
              <h6>Membership &amp; Resources</h6>
              <ul>
                <li>
                  <a href="#pricing" onClick={(e) => handleLinkClick(e, '#pricing')}>
                    Individual Plan ($290 CAD)
                  </a>
                </li>
                <li>
                  <a href="#pricing" onClick={(e) => handleLinkClick(e, '#pricing')}>
                    Property Manager Plan ($590 CAD)
                  </a>
                </li>
                <li>
                  <a
                    href="#resources"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenResources();
                    }}
                  >
                    Official RTB Forms Gateway
                  </a>
                </li>
                <li>
                  <a
                    href="#events"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenEventsNews('events');
                    }}
                  >
                    Workshops &amp; Briefings
                  </a>
                </li>
              </ul>
            </div>

            <div
              className="rv"
              style={{ ['--d' as string]: 2 }}
            >
              <h6>RTA &amp; Privacy</h6>
              <ul>
                <li>
                  <a href="#features" onClick={(e) => handleLinkClick(e, '#features')}>
                    BC Case Scenarios
                  </a>
                </li>
                <li>
                  <a
                    href="#submit"
                    onClick={(e) => {
                      e.preventDefault();
                      onSubmitStory();
                    }}
                  >
                    Share Tenancy Experience
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenPolicy('privacy');
                    }}
                  >
                    Zero-Disclosure Charter
                  </a>
                </li>
                <li>
                  <a
                    href="#news"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenEventsNews('news');
                    }}
                  >
                    News: No Tenant Blacklists
                  </a>
                </li>
              </ul>
            </div>

            <div
              className="rv"
              style={{ ['--d' as string]: 3 }}
            >
              <h6>Direct Helpline</h6>
              <ul>
                <li>
                  <a href={CONTACT_INFO.phoneHref}>Phone: {CONTACT_INFO.phone}</a>
                </li>
                <li>
                  <a href={`mailto:${CONTACT_INFO.helpEmail}`}>
                    {CONTACT_INFO.helpEmail}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${CONTACT_INFO.privacyEmail}`}>
                    {CONTACT_INFO.privacyEmail}
                  </a>
                </li>
                <li>
                  <a href="#start" onClick={(e) => handleLinkClick(e, '#start')}>
                    Request Private Callback
                  </a>
                </li>
              </ul>
            </div>

            <div
              className="mark rv"
              style={{ ['--d' as string]: 4 }}
            >
              <svg viewBox="0 0 40 40" fill="#2a1a12">
                <path d="M5 5h13v13H5zM22 22h13v13H22z" />
                <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
              </svg>
            </div>
          </div>

          <div className="legal">
            <span
              style={{
                maxWidth: '850px',
                textAlign: 'center',
                display: 'block',
                margin: '0 auto 10px',
                fontSize: '12.5px',
                color: '#6d5a4d',
                lineHeight: '1.5',
              }}
            >
              General educational information for BC rental-property owners under the RTA framework, not formal legal advice. Always review official RTB statutory guidelines or consult qualified counsel.
            </span>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#8c7b6f',
              }}
            >
              <span>© Copyright Landlords BC 2026</span>
              <button
                type="button"
                onClick={() => onOpenPolicy('privacy')}
                style={{ background: 'none', border: 'none', color: '#6d5a4d', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('terms')}
                style={{ background: 'none', border: 'none', color: '#6d5a4d', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('community')}
                style={{ background: 'none', border: 'none', color: '#6d5a4d', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Community Guidelines
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('retention')}
                style={{ background: 'none', border: 'none', color: '#6d5a4d', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Data Retention
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('accessibility')}
                style={{ background: 'none', border: 'none', color: '#6d5a4d', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Accessibility
              </button>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
};
