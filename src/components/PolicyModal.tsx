import React from 'react';
import { POLICIES, PolicyDoc } from '../data/policies';
import { CONTACT_INFO } from '../data/constants';

interface PolicyModalProps {
  isOpen: boolean;
  policyId?: string;
  onClose: () => void;
  onSelectPolicy: (id: string) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  policyId = 'privacy',
  onClose,
  onSelectPolicy,
}) => {
  if (!isOpen) return null;

  const currentPolicy: PolicyDoc = POLICIES[policyId] || POLICIES.privacy;

  const policyList = [
    { id: 'privacy', label: 'Privacy & Charter' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'community', label: 'Community Rules' },
    { id: 'retention', label: 'Data Retention' },
    { id: 'accessibility', label: 'Accessibility' },
  ];

  return (
    <div
      className="modal-backdrop open"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-box"
        style={{
          maxWidth: '740px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div className="modal-top" style={{ marginBottom: '14px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8c7b6f',
                fontWeight: 600,
              }}
            >
              Landlords BC Statutory Commitments
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#2a1a12' }}>
              {currentPolicy.title}
            </h3>
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Policy Selector Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            borderBottom: '1px solid rgba(59, 33, 22, 0.12)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          {policyList.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPolicy(p.id)}
              style={{
                background: policyId === p.id ? '#3b2116' : 'rgba(255, 255, 255, 0.65)',
                color: policyId === p.id ? '#f6f0e7' : '#3b2116',
                border: '1px solid rgba(59, 33, 22, 0.15)',
                borderRadius: '999px',
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Scrollable Policy Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          <div
            style={{
              background: '#ffffff',
              padding: '22px 24px',
              borderRadius: '16px',
              border: '1px solid #e2d9cd',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#8c7b6f',
                marginBottom: '18px',
                paddingBottom: '10px',
                borderBottom: '1px solid #f0ebe4',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Effective &amp; Last Reviewed: {currentPolicy.lastUpdated}</span>
              <span>Jurisdiction: British Columbia, Canada</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentPolicy.sections.map((section, idx) => (
                <div key={idx}>
                  <h4
                    style={{
                      fontSize: '14.5px',
                      color: '#2a1a12',
                      margin: '0 0 6px 0',
                      fontWeight: 600,
                    }}
                  >
                    {section.heading}
                  </h4>
                  <p
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: '#4a3b32',
                      margin: 0,
                    }}
                  >
                    {section.text}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '24px',
                padding: '14px',
                background: '#faf7f2',
                borderRadius: '12px',
                border: '1px solid #ebd9c8',
                fontSize: '12px',
                color: '#6b5a4e',
              }}
            >
              Have a question regarding our policies or data rights under BC PIPA? Contact our privacy officer at{' '}
              <a
                href={`mailto:${CONTACT_INFO.privacyEmail}`}
                style={{ color: '#3b2116', fontWeight: 600, textDecoration: 'underline' }}
              >
                {CONTACT_INFO.privacyEmail}
              </a>{' '}
              or phone{' '}
              <a
                href={CONTACT_INFO.phoneHref}
                style={{ color: '#3b2116', fontWeight: 600, textDecoration: 'underline' }}
              >
                {CONTACT_INFO.phone}
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
