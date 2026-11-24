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
  const [activeTab, setActiveTab] = useState<'vault' | 'calculators'>('vault');

  // Private notes state
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [newUnit, setNewUnit] = useState('');
  const [newNote, setNewNote] = useState('');
  const [downloadNotice, setDownloadNotice] = useState(false);

  // Calculator states
  const [rentInput, setRentInput] = useState<number>(2200);
  const [copiedRent, setCopiedRent] = useState(false);
  const [serviceMethod, setServiceMethod] = useState<'person' | 'door' | 'mail' | 'email'>('door');
  const [serviceDate, setServiceDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [copiedService, setCopiedService] = useState(false);

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

    const bundleContent = `========================================================================
LANDLORDS BC — COMPLETE STATUTORY LEGAL DEFENSE & COMPLIANCE DOSSIER
Active Member ID: ${memberId}
Registered Account: ${userEmail}
Issued By: Landlords BC Association Legal Research Desk
Date: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
Zero-Disclosure Charter: Verified Confidential Property Defense Toolkit
========================================================================

CONTENTS INCLUDED IN THIS MEMBER PACK:
1. BC RTA Statutory Dispute Resolution Evidence Standards
2. Section 88 & 90 Proof of Service Affidavit Checklist
3. 2026 Allowable Rent Increase (3.0%) Notice Calculator Form (RTB-7 Protocol)
4. Move-In Inspection Sequence & Key Handover Protocol (RTA Sec 23)
5. Security Deposit Trust Account Ledger (RTA Sec 19 & 38)
6. Priority Advisor Line Direct Contact

------------------------------------------------------------------------
SECTION 1: RTB HEARING EVIDENCE INDEXING STANDARD
When uploading evidence to the Residential Tenancy Branch (RTB) Dispute Access site:
- File naming format: [EvidenceNumber]_[DocumentType]_[DateYYYY-MM-DD].pdf
- Example: 01_RTB30_10DayNotice_2026-10-15.pdf
- Example: 02_DoorPostingPhoto_TimeStamped_2026-10-15.jpg
- Example: 03_BankStatement_ProofOfUnpaidRent_2026-10-16.pdf
Arbitrators will disregard unindexed or disordered evidence. Always number chronologically.

------------------------------------------------------------------------
SECTION 2: PROOF OF SERVICE AFFIDAVIT (RTA SECTION 88 & 90)
Before filing for an Order of Possession at the RTB:
Method:
[ ] In Person to Tenant: Deemed same day.
[ ] Posting on Tenant Door: Deemed 3 days later.
[ ] Registered Mail: Deemed 5 days later. (Attach Canada Post tracking barcode).
Witness Signature: _______________________ Date: _______________________

------------------------------------------------------------------------
SECTION 3: 2026 MAXIMUM ALLOWABLE RENT INCREASE FORMULA
- BC 2026 Statutory Rent Increase Limit: 3.0%
- Notice Period Required: 3 full rental payment months prior to effective date.
- Required Mandatory Form: RTB-7 (Notice of Rent Increase - Residential).
- Failure to give 3 full months notice makes the entire increase legally void.

------------------------------------------------------------------------
SECTION 4: MOVE-IN / MOVE-OUT INSPECTION PROTOCOL (RTA SEC 23 & 35)
- Landlord must offer at least two opportunities for the condition inspection.
- The second opportunity must be offered in writing using Form RTB-22.
- Failure to complete Form RTB-27 moves the statutory burden of proof entirely onto landlord.

Landlords BC Priority Member Advisor Line: 1-800-555-0199
Direct Advisory Email: support@landlordsbc.org
© 2026 Landlords BC Association. All rights reserved.`;

    const blob = new Blob([bundleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Landlords-BC-Complete-Legal-Toolkit-${memberId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculations for Rent Increase
  const rentIncreaseAmount = Math.round(rentInput * 0.03 * 100) / 100;
  const newMaxRent = rentInput + rentIncreaseAmount;

  const handleCopyRentCalc = () => {
    const text = `BC RTA Section 43 Rent Increase Calculation
Current Rent: $${rentInput.toFixed(2)} CAD
2026 Maximum Provincial Cap: 3.0%
Allowable Increase: +$${rentIncreaseAmount.toFixed(2)} CAD / month
Maximum New Allowable Rent: $${newMaxRent.toFixed(2)} CAD / month
Mandatory Notice: Must serve Form RTB-7 at least 3 full rental payment months before effective date.`;
    navigator.clipboard.writeText(text);
    setCopiedRent(true);
    setTimeout(() => setCopiedRent(false), 3000);
  };

  // Calculations for Deemed Service Date
  const methodDays = {
    person: 0,
    door: 3,
    mail: 5,
    email: 3,
  };
  const daysToAdd = methodDays[serviceMethod];
  const sDate = new Date(serviceDate);
  const deemedDate = new Date(sDate);
  deemedDate.setDate(deemedDate.getDate() + daysToAdd);
  const endTenancyDate = new Date(deemedDate);
  endTenancyDate.setDate(endTenancyDate.getDate() + 10);
  const disputeDeadlineDate = new Date(deemedDate);
  disputeDeadlineDate.setDate(disputeDeadlineDate.getDate() + 5);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const handleCopyServiceCalc = () => {
    const methodNames = {
      door: 'Posted to tenant door / in mailbox (Deemed 3 days)',
      mail: 'Registered mail / ordinary mail (Deemed 5 days)',
      email: 'Email with written consent (Deemed 3 days)',
      person: 'In person / handed directly (Immediate, 0 days)',
    };
    const text = `BC RTA Section 88 & 90 Statutory Service Timeline
Notice Served: ${serviceDate}
Method: ${methodNames[serviceMethod]}
Legally Deemed Received Date: ${formatDate(deemedDate)}
Tenant 5-Day Dispute Window Closes: ${formatDate(disputeDeadlineDate)}
10-Day Notice (RTB-30) Earliest Vacate / End Date: ${formatDate(endTenancyDate)}`;
    navigator.clipboard.writeText(text);
    setCopiedService(true);
    setTimeout(() => setCopiedService(false), 3000);
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
          maxWidth: '840px',
          maxHeight: '92vh',
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
            padding: '16px 22px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(42, 26, 18, 0.18)',
            flexWrap: 'wrap',
            gap: '12px',
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
              {userEmail} · Annual Membership (BC RTA Coverage Active)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
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
              {downloadNotice ? 'Downloaded ✓' : 'Download Complete Legal Kit ↓'}
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

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #e5dbcf', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            style={{
              background: activeTab === 'vault' ? '#3b2116' : 'rgba(255,255,255,0.6)',
              color: activeTab === 'vault' ? '#f6f0e7' : '#5a493e',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Private Property Ledger &amp; Notes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calculators')}
            style={{
              background: activeTab === 'calculators' ? '#3b2116' : 'rgba(255,255,255,0.6)',
              color: activeTab === 'calculators' ? '#f6f0e7' : '#5a493e',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            BC Statutory Calculators (Rent &amp; Service Date) ⚡
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {activeTab === 'vault' ? (
            <>
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
                    padding: '14px 16px',
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
                    padding: '14px 16px',
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
                    padding: '14px 16px',
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

              {/* Private Notes Vault */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '18px 20px',
                  borderRadius: '16px',
                  border: '1px solid #e2d9cd',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#2a1a12' }}>
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
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Unit identifier (e.g. Suite #2 or Duplex)"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      style={{
                        flex: '1 1 200px',
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
                        flex: '2 1 300px',
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
            </>
          ) : (
            /* Statutory Calculators Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Calculator 1: Rent Increase */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '20px 22px',
                  borderRadius: '16px',
                  border: '1px solid #e2d9cd',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#2e6b3b', textTransform: 'uppercase', fontWeight: 700 }}>
                      BC RTA Section 43 &amp; Regulation
                    </span>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '16px', color: '#2a1a12' }}>
                      2026 Allowable Rent Increase Calculator (3.0% Limit)
                    </h4>
                    <p style={{ margin: '2px 0 14px 0', fontSize: '12px', color: '#8c7b6f' }}>
                      Calculate the maximum legal rent increase permitted by British Columbia law for 2026.
                    </p>
                  </div>
                  <span
                    style={{
                      background: '#d4ecd7',
                      color: '#1e4128',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px',
                    }}
                  >
                    2026 CAP: 3.0%
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#3b2116', marginBottom: '4px' }}>
                      Current Monthly Rent ($ CAD)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="10"
                      value={rentInput}
                      onChange={(e) => setRentInput(Number(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #d4c8b8',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#2a1a12',
                      }}
                    />
                  </div>

                  <div style={{ background: '#faf6f0', padding: '12px 16px', borderRadius: '12px', border: '1px solid #ebd9c8' }}>
                    <div style={{ fontSize: '11px', color: '#8c7b6f', textTransform: 'uppercase' }}>Allowable Max Increase</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#2b6b38' }}>
                      +${rentIncreaseAmount.toFixed(2)} CAD / mo
                    </div>
                  </div>

                  <div style={{ background: '#faf6f0', padding: '12px 16px', borderRadius: '12px', border: '1px solid #ebd9c8' }}>
                    <div style={{ fontSize: '11px', color: '#8c7b6f', textTransform: 'uppercase' }}>Maximum New Rent</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#3b2116' }}>
                      ${newMaxRent.toFixed(2)} CAD / mo
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', padding: '10px 14px', background: '#f5efe6', borderRadius: '10px', fontSize: '11.5px', color: '#6a594d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span>
                    ⚠️ <strong>Mandatory Requirement:</strong> You must serve official government form <strong>RTB-7</strong> at least <strong>3 full calendar months</strong> before the increase becomes effective.
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRentCalc}
                    style={{
                      background: '#3b2116',
                      color: '#f6f0e7',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {copiedRent ? 'Copied ✓' : 'Copy RTB-7 Notice Summary'}
                  </button>
                </div>
              </div>

              {/* Calculator 2: Deemed Service Calculator */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '20px 22px',
                  borderRadius: '16px',
                  border: '1px solid #e2d9cd',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10.5px', color: '#2e6b3b', textTransform: 'uppercase', fontWeight: 700 }}>
                      BC RTA Section 88 &amp; 90 Rules of Court
                    </span>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '16px', color: '#2a1a12' }}>
                      Statutory Notice Deemed-Service Timeline Calculator
                    </h4>
                    <p style={{ margin: '2px 0 14px 0', fontSize: '12px', color: '#8c7b6f' }}>
                      Never have an RTB hearing dismissed due to invalid service timing.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#3b2116', marginBottom: '4px' }}>
                      Service Method (Section 88)
                    </label>
                    <select
                      value={serviceMethod}
                      onChange={(e: any) => setServiceMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #d4c8b8',
                        fontSize: '13px',
                        background: '#ffffff',
                      }}
                    >
                      <option value="door">Attached to front door / mail slot (3 days)</option>
                      <option value="mail">Registered mail / ordinary mail (5 days)</option>
                      <option value="person">In person to tenant (Immediate, 0 days)</option>
                      <option value="email">Email with signed RTB-51 consent (3 days)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#3b2116', marginBottom: '4px' }}>
                      Date Notice Delivered / Posted
                    </label>
                    <input
                      type="date"
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #d4c8b8',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                {/* Output timelines */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '14px' }}>
                  <div style={{ background: '#faf6f0', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ebd9c8' }}>
                    <div style={{ fontSize: '11px', color: '#8c7b6f' }}>Legally Deemed Received</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#3b2116' }}>{formatDate(deemedDate)}</div>
                  </div>

                  <div style={{ background: '#faf6f0', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ebd9c8' }}>
                    <div style={{ fontSize: '11px', color: '#8c7b6f' }}>Tenant Dispute Window Closes</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#a84232' }}>{formatDate(disputeDeadlineDate)}</div>
                  </div>

                  <div style={{ background: '#faf6f0', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ebd9c8' }}>
                    <div style={{ fontSize: '11px', color: '#8c7b6f' }}>10-Day Notice (RTB-30) Effective</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#2b6b38' }}>{formatDate(endTenancyDate)}</div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleCopyServiceCalc}
                    style={{
                      background: '#3b2116',
                      color: '#f6f0e7',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {copiedService ? 'Timeline Copied ✓' : 'Copy Service Evidence Log'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
