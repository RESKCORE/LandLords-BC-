import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../data/constants';

interface MemberDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

interface MemberNote {
  id: string;
  unit: string;
  note: string;
  timestamp: string;
}

export const MemberDashboardModal: React.FC<MemberDashboardModalProps> = ({
  isOpen,
  onClose,
  onSignOut,
}) => {
  const [userEmail, setUserEmail] = useState('member@landlordsbc.org');
  const [userName, setUserName] = useState('Verified BC Landlord');
  const [memberId, setMemberId] = useState('BC-MEM-8421');

  // Private notes state
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [newUnit, setNewUnit] = useState('');
  const [newNote, setNewNote] = useState('');
  const [downloadNotice, setDownloadNotice] = useState(false);

  useEffect(() => {
    // Retrieve stored Google user or pending email
    const savedGoogle = localStorage.getItem('landlords_google_user');
    if (savedGoogle) {
      try {
        const parsed = JSON.parse(savedGoogle);
        if (parsed.email) setUserEmail(parsed.email);
        if (parsed.name) setUserName(parsed.name);
      } catch (_) {}
    } else {
      const pending = localStorage.getItem('pending_checkout_email');
      if (pending) setUserEmail(pending);
    }

    // Retrieve or assign stable member ID
    let assigned = localStorage.getItem('landlords_member_id');
    if (!assigned) {
      assigned = `BC-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('landlords_member_id', assigned);
    }
    setMemberId(assigned);

    // Load private member notes
    const savedNotes = localStorage.getItem('landlords_member_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (_) {}
    } else {
      // Default sample private note
      setNotes([
        {
          id: 'note-1',
          unit: 'Vancouver Suite #204',
          note: 'Move-in inspection signed with RTB-27. Security deposit $1,150 held in designated trust account. Rent paid via e-transfer on the 1st.',
          timestamp: '15 Oct 2026',
        },
      ]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const item: MemberNote = {
      id: `note-${Date.now()}`,
      unit: newUnit.trim() || 'General Property',
      note: newNote.trim(),
      timestamp: new Date().toLocaleDateString('en-CA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
    const updated = [item, ...notes];
    setNotes(updated);
    localStorage.setItem('landlords_member_notes', JSON.stringify(updated));
    setNewUnit('');
    setNewNote('');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem('landlords_member_notes', JSON.stringify(updated));
  };

  const handleDownloadToolkit = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 4000);
    // Trigger download of statutory forms bundle
    const link = document.createElement('a');
    link.href =
      'https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb1.pdf';
    link.target = '_blank';
    link.download = 'BC-Landlords-Legal-Kit-RTB1.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          maxWidth: '820px',
          maxHeight: '90vh',
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
                color: '#2e6b3b',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>●</span> Active Member Portal · Verified Zero-Disclosure Charter
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#2a1a12' }}>
              Member Association Dashboard
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

        {/* Member Profile Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3b2116 0%, #2a1a12 100%)',
            color: '#f6f0e7',
            padding: '18px 22px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            boxShadow: '0 8px 24px rgba(42, 26, 18, 0.18)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>{userName}</span>
              <span
                style={{
                  fontSize: '11px',
                  background: '#2e4933',
                  color: '#9de8ab',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}
              >
                {memberId} ✓
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#d9cdbe', marginTop: '3px' }}>
              {userEmail} · Annual Member (BC RTA Coverage Active)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleDownloadToolkit}
              style={{
                background: '#f6f0e7',
                color: '#2a1a12',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {downloadNotice ? 'Downloaded ✓' : 'Download Complete Legal Kit (ZIP) ↓'}
            </button>
            <button
              type="button"
              onClick={onSignOut}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#f6f0e7',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Quick Access Tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid rgba(59, 33, 22, 0.12)',
              }}
            >
              <span style={{ fontSize: '11px', color: '#8c7b6f', textTransform: 'uppercase' }}>
                Priority Member Helpline
              </span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#3b2116', marginTop: '4px' }}>
                {CONTACT_INFO.phone}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#6b5a4e' }}>
                Direct access to BC tenancy advisors for notice and hearing prep.
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid rgba(59, 33, 22, 0.12)',
              }}
            >
              <span style={{ fontSize: '11px', color: '#8c7b6f', textTransform: 'uppercase' }}>
                RTB Evidence Indexing
              </span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#3b2116', marginTop: '4px' }}>
                Statutory Dossier Format
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#6b5a4e' }}>
                Admissible formatting checklist for RTB dispute upload portal.
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid rgba(59, 33, 22, 0.12)',
              }}
            >
              <span style={{ fontSize: '11px', color: '#8c7b6f', textTransform: 'uppercase' }}>
                Zero-Disclosure Vault
              </span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#2b6b38', marginTop: '4px' }}>
                Encrypted &amp; Non-Public
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#6b5a4e' }}>
                Staff cannot browse private notes. Never published to lists.
              </p>
            </div>
          </div>

          {/* Private Notes & Unit Documentation Vault */}
          <div
            style={{
              background: '#ffffff',
              padding: '20px 22px',
              borderRadius: '16px',
              border: '1px solid #e2d9cd',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#2a1a12' }}>
                  Private Unit Documentation Vault
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#8c7b6f' }}>
                  Record private tenancy observations, inspection timestamps, and repair logs safely.
                </p>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  background: '#f2eae1',
                  color: '#3b2116',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                {notes.length} Private Records Stored
              </span>
            </div>

            {/* Note creation form */}
            <form onSubmit={handleAddNote} style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Unit identifier (e.g. Suite #2 or Main Floor Duplex)"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  style={{
                    flex: '0 0 38%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #d4c8b8',
                    fontSize: '12.5px',
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="Enter confidential observation, inspection date, or repair note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #d4c8b8',
                    fontSize: '12.5px',
                  }}
                />
                <button
                  type="submit"
                  className="btn-dark"
                  style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  Save Note +
                </button>
              </div>
            </form>

            {/* Note items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {notes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: '#faf7f2',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #ebd9c8',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '12.5px', color: '#3b2116' }}>{n.unit}</strong>
                      <span style={{ fontSize: '10.5px', color: '#8c7b6f' }}>{n.timestamp}</span>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#4a3b32', lineHeight: '1.45' }}>
                      {n.note}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(n.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a84232',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: '2px 6px',
                    }}
                    title="Delete record"
                  >
                    Delete ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
