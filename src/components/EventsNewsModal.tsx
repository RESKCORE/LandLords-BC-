import React, { useState } from 'react';
import { WORKSHOP_PROGRAMS, NEWS_ARTICLES, NewsArticle } from '../data/eventsNews';

interface EventsNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'events' | 'news';
}

export const EventsNewsModal: React.FC<EventsNewsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'events',
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'news'>(initialTab);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [subscribedNotice, setSubscribedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubscribeSchedule = () => {
    setSubscribedNotice(true);
    setTimeout(() => setSubscribedNotice(false), 5000);
  };

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
          maxWidth: '750px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px',
        }}
      >
        {/* Header */}
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
              Landlords BC Briefings &amp; Verified News
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#0f172a' }}>
              Educational Briefings &amp; Editorial Updates
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
            borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('events');
              setSelectedArticle(null);
            }}
            style={{
              background: activeTab === 'events' ? '#0f172a' : 'rgba(255, 255, 255, 0.7)',
              color: activeTab === 'events' ? '#ffffff' : '#0f172a',
              border: '1px solid rgba(15, 23, 42, 0.15)',
              borderRadius: '999px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Educational Programs ({WORKSHOP_PROGRAMS.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('news');
              setSelectedArticle(null);
            }}
            style={{
              background: activeTab === 'news' ? '#0f172a' : 'rgba(255, 255, 255, 0.7)',
              color: activeTab === 'news' ? '#ffffff' : '#0f172a',
              border: '1px solid rgba(15, 23, 42, 0.15)',
              borderRadius: '999px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Editorial News ({NEWS_ARTICLES.length})
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {selectedArticle ? (
            /* Single Article Full Reader */
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                }}
              >
                ← Back to News Overview
              </button>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '11px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontWeight: 600,
                  }}
                >
                  {selectedArticle.category}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Published {selectedArticle.date}
                </span>
              </div>

              <h2 style={{ fontSize: '20px', color: '#0f172a', margin: '10px 0 14px 0' }}>
                {selectedArticle.title}
              </h2>

              <p
                style={{
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: '#334155',
                  lineHeight: '1.6',
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  borderLeft: '4px solid #0f172a',
                  marginBottom: '16px',
                }}
              >
                {selectedArticle.summary}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedArticle.body.map((para, i) => (
                  <p key={i} style={{ fontSize: '13.5px', lineHeight: '1.65', color: '#0f172a', margin: 0 }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ) : activeTab === 'events' ? (
            /* Educational Programs List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  lineHeight: '1.5',
                }}
              >
                <strong>Authentic Schedule Notice:</strong> Educational sessions and legal masterclasses operate on scheduled cohort cycles aligned with provincial legislative updates. Active members receive calendar invitations directly upon cohort opening.
              </div>

              {WORKSHOP_PROGRAMS.map((prog) => (
                <div
                  key={prog.id}
                  style={{
                    background: '#ffffff',
                    padding: '18px 20px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#0f172a',
                          background: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {prog.schedule}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                        {prog.format}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '10.5px',
                        background: '#ecfdf5',
                        color: '#047857',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontWeight: 600,
                      }}
                    >
                      Member Curriculum
                    </span>
                  </div>

                  <h4 style={{ margin: '2px 0', fontSize: '15.5px', color: '#0f172a' }}>
                    {prog.title}
                  </h4>

                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
                    {prog.summary}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                    {prog.topics.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          background: '#f8fafc',
                          color: '#334155',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleSubscribeSchedule}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {subscribedNotice
                    ? 'Calendar Alert Active ✓'
                    : 'Notify Me When Next Provincial Cohort Opens →'}
                </button>
              </div>
            </div>
          ) : (
            /* News List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {NEWS_ARTICLES.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  style={{
                    background: '#ffffff',
                    padding: '18px 20px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0f172a')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10.5px',
                        background: '#f1f5f9',
                        color: '#0f172a',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontWeight: 600,
                      }}
                    >
                      {article.category}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {article.date}
                    </span>
                  </div>

                  <h4 style={{ margin: '4px 0 6px 0', fontSize: '15px', color: '#0f172a' }}>
                    {article.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
                    {article.summary}
                  </p>
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '11.5px',
                      color: '#1d4ed8',
                      fontWeight: 600,
                    }}
                  >
                    Read Full Statement →
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
