import React, { useState } from 'react';
import { RESOURCE_GUIDES, ResourceGuide } from '../data/resources';
import { FORMS_CATALOGUE, FormItem } from '../data/forms';

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (plan: string) => void;
  isMember?: boolean;
}

export const ResourcesModal: React.FC<ResourcesModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  isMember = false,
}) => {
  const [activeTab, setActiveTab] = useState<'guides' | 'forms'>('guides');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGuide, setSelectedGuide] = useState<ResourceGuide | null>(null);

  const handleDownloadTemplate = (form: FormItem) => {
    const memberId = localStorage.getItem('landlords_member_id') || 'BC-MEM-8421';
    const content = `========================================================================
LANDLORDS BC — VERIFIED STATUTORY MEMBER TEMPLATE
Document Code: ${form.code}
Title: ${form.title}
Badge: ${form.badge}
Jurisdiction: British Columbia, Canada (Residential Tenancy Act SBC 2002, c. 78)
Issued Under Active Member ID: ${memberId}
Date Generated: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
========================================================================

1. PURPOSE & OVERVIEW
${form.description}

2. STATUTORY SERVICE REQUIREMENTS (BC RTA SECTION 88 & 90)
- In Person: Deemed served immediately on the same date.
- Posting to Front Door or Mailbox: Deemed received 3 full calendar days later.
- Sent by Registered Mail: Deemed received 5 full calendar days later.
- Email Service: Allowed only with prior written consent (Form RTB-51) and deemed received 3 days later.

3. REQUIRED FORM DETAILS & CHECKLIST
[ ] Property Unit Address: _____________________________________________
[ ] Tenant Legal Full Name: ___________________________________________
[ ] Landlord Representative Name: _____________________________________
[ ] Date Notice Served: _______________________________________________
[ ] Exact Method of Service: [ ] In Person  [ ] Door Post  [ ] Reg Mail
[ ] Witness or Proof of Delivery Attached: [ ] Yes  [ ] No

4. RTB DISPUTE ADMISSIBILITY NOTE
Never alter standard government clauses or attempt to contract out of the BC Residential Tenancy Act (Section 5). Keep this completed document in your Landlords BC Private Documentation Vault for formal dispute hearings.

Landlords BC Priority Helpline: 1-800-555-0199
Zero-Disclosure Charter: Verified Confidential & Proprietary Document.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.code}-${form.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const filteredGuides = RESOURCE_GUIDES.filter((guide) => {
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || guide.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const filteredForms = FORMS_CATALOGUE.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || form.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

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
          maxWidth: '780px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px',
        }}
      >
        {/* Top Header */}
        <div className="modal-top" style={{ marginBottom: '16px' }}>
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
              BC RTA Knowledge Centre &amp; Forms Library
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#2a1a12' }}>
              Statutory Resources &amp; Official Forms
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

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid rgba(59, 33, 22, 0.12)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('guides');
              setSelectedGuide(null);
            }}
            style={{
              background: activeTab === 'guides' ? '#3b2116' : 'rgba(255, 255, 255, 0.65)',
              color: activeTab === 'guides' ? '#f6f0e7' : '#3b2116',
              border: '1px solid rgba(59, 33, 22, 0.15)',
              borderRadius: '999px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Knowledge Guides ({RESOURCE_GUIDES.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('forms');
              setSelectedGuide(null);
            }}
            style={{
              background: activeTab === 'forms' ? '#3b2116' : 'rgba(255, 255, 255, 0.65)',
              color: activeTab === 'forms' ? '#f6f0e7' : '#3b2116',
              border: '1px solid rgba(59, 33, 22, 0.15)',
              borderRadius: '999px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Forms &amp; Statutory Templates ({FORMS_CATALOGUE.length})
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder={
              activeTab === 'guides'
                ? 'Search guides (e.g. deposits, notice, inspection)...'
                : 'Search forms (e.g. RTB-30, RTB-1, condition inspection)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              borderRadius: '12px',
              border: '1px solid #d4c8b8',
              background: '#ffffff',
              padding: '8px 14px',
              fontSize: '13px',
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              borderRadius: '12px',
              border: '1px solid #d4c8b8',
              background: '#ffffff',
              padding: '8px 12px',
              fontSize: '12.5px',
              color: '#3b2116',
            }}
          >
            <option value="all">All Categories</option>
            {activeTab === 'guides' ? (
              <>
                <option value="tenancy">Tenancy Rules</option>
                <option value="dispute">Dispute &amp; Notices</option>
                <option value="property">Property Records</option>
                <option value="government">Government Resources</option>
              </>
            ) : (
              <>
                <option value="government">Official RTB Forms</option>
                <option value="template">Organization Templates</option>
                <option value="example">Educational Examples</option>
                <option value="third-party">Government Portals</option>
              </>
            )}
          </select>
        </div>

        {/* Scrollable Content Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '6px',
          }}
        >
          {/* Detailed Guide Reader View */}
          {selectedGuide ? (
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e2d9cd',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8c7b6f',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ← Back to All Guides
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    background: '#f2eae1',
                    color: '#3b2116',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontWeight: 600,
                  }}
                >
                  {selectedGuide.category}
                </span>
                <span style={{ fontSize: '11.5px', color: '#8c7b6f' }}>
                  Updated {selectedGuide.updatedDate} · {selectedGuide.readTime}
                </span>
              </div>

              <h2 style={{ fontSize: '20px', color: '#2a1a12', margin: '8px 0 14px 0' }}>
                {selectedGuide.title}
              </h2>

              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#4a3b32',
                  fontWeight: 500,
                  background: '#faf7f2',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  borderLeft: '4px solid #3b2116',
                  marginBottom: '18px',
                }}
              >
                {selectedGuide.summary}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedGuide.content.map((paragraph, idx) => (
                  <p
                    key={idx}
                    style={{
                      fontSize: '13.5px',
                      lineHeight: '1.65',
                      color: '#2a1a12',
                      margin: 0,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div
                style={{
                  marginTop: '22px',
                  paddingTop: '16px',
                  borderTop: '1px solid #eee5dc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '11.5px', color: '#8c7b6f', display: 'block' }}>
                    Statutory Primary Citations:
                  </span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {selectedGuide.citations.map((cite, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          background: '#f0ebe4',
                          color: '#3b2116',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {cite}
                      </span>
                    ))}
                  </div>
                </div>

                {!isMember && selectedGuide.access === 'members' && onSelectPlan && (
                  <button
                    type="button"
                    className="btn-dark"
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                    onClick={() => {
                      onClose();
                      onSelectPlan('individual');
                    }}
                  >
                    Unlock Full Member Kit ($290 CAD) →
                  </button>
                )}
              </div>
            </div>
          ) : activeTab === 'guides' ? (
            /* Guides List View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(59, 33, 22, 0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#3b2116';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(59, 33, 22, 0.12)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          background: '#f0ebe3',
                          color: '#3b2116',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontWeight: 600,
                        }}
                      >
                        {guide.category}
                      </span>
                      {guide.access === 'members' && (
                        <span
                          style={{
                            fontSize: '10px',
                            background: '#e9e3d8',
                            color: '#654f3d',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            fontWeight: 600,
                          }}
                        >
                          Member Library
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: '#8c7b6f' }}>
                      Updated {guide.updatedDate} · {guide.readTime}
                    </span>
                  </div>

                  <h4 style={{ margin: '4px 0 6px 0', fontSize: '15px', color: '#2a1a12' }}>
                    {guide.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#6b5a4e', lineHeight: '1.5' }}>
                    {guide.summary}
                  </p>
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '11.5px',
                      color: '#3b2116',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Read Statutory Guidance</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Forms Catalogue View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  color: '#6b5a4e',
                  border: '1px solid rgba(59, 33, 22, 0.08)',
                  marginBottom: '4px',
                }}
              >
                <strong>Editorial Transparency:</strong> Landlords BC links directly to official, unedited statutory forms issued by the BC Residential Tenancy Branch. Organization templates are clearly designated and will never be mistaken for government forms.
              </div>

              {filteredForms.map((form) => (
                <div
                  key={form.id}
                  style={{
                    background: '#ffffff',
                    padding: '16px 18px',
                    borderRadius: '16px',
                    border: '1px solid rgba(59, 33, 22, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#3b2116',
                          background: '#f6f0e7',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {form.code}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          color:
                            form.category === 'government'
                              ? '#2b6b38'
                              : form.category === 'template'
                              ? '#7d4a20'
                              : '#555',
                          fontWeight: 600,
                        }}
                      >
                        {form.badge}
                      </span>
                    </div>
                    <h4 style={{ margin: '4px 0', fontSize: '14.5px', color: '#2a1a12' }}>
                      {form.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b5a4e', lineHeight: '1.45' }}>
                      {form.description}
                    </p>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#8c7b6f',
                        display: 'block',
                        marginTop: '4px',
                      }}
                    >
                      Source: {form.source}
                    </span>
                  </div>

                  <div>
                    {form.isExternal ? (
                      <a
                        href={form.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-dark"
                        style={{
                          padding: '8px 14px',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        Open Official PDF ↗
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (isMember) {
                            handleDownloadTemplate(form);
                          } else if (onSelectPlan) {
                            onClose();
                            onSelectPlan('individual');
                          }
                        }}
                        className="btn-dark"
                        style={{
                          padding: '8px 14px',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isMember ? 'Download Template ↓' : 'Member Only · Unlock →'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
