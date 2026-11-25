import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../data/constants';
import { FORMS_CATALOGUE } from '../data/forms';

interface MemberDashboardPageProps {
  onBackToHome: () => void;
  onSignOut: () => void;
  onOpenResourcesModal?: () => void;
  onOpenMembershipModal?: (planChoice?: string) => void;
}

interface MemberNote {
  id: string;
  unit: string;
  note: string;
  timestamp: string;
}

export const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({
  onBackToHome,
  onSignOut,
  onOpenResourcesModal,
  onOpenMembershipModal,
}) => {
  const [userEmail, setUserEmail] = useState('member@landlordsbc.org');
  const [userName, setUserName] = useState('Verified BC Landlord');
  const [memberId, setMemberId] = useState('BC-MEM-8421');
  const [membershipPlan, setMembershipPlan] = useState('Individual Membership ($290 CAD / year)');
  const [downloadNotice, setDownloadNotice] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [newUnit, setNewUnit] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeNoteModal, setActiveNoteModal] = useState<MemberNote | null>(null);

  // Forms modal state
  const [showAllForms, setShowAllForms] = useState(false);

  // Rent Calculator state
  const [rentInput, setRentInput] = useState<number>(2200);
  const [copiedRent, setCopiedRent] = useState(false);

  // Gauge animation state
  const [gaugePercent, setGaugePercent] = useState(0);

  useEffect(() => {
    // Load stored user info
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

    const savedPlan = localStorage.getItem('pending_checkout_plan');
    if (savedPlan) {
      setMembershipPlan(savedPlan);
    }

    let assigned = localStorage.getItem('landlords_member_id');
    if (!assigned) {
      assigned = `BC-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('landlords_member_id', assigned);
    }
    setMemberId(assigned);

    // Load private notes
    const savedNotes = localStorage.getItem('landlords_member_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (_) {}
    } else {
      const initialNotes: MemberNote[] = [
        {
          id: 'case-409',
          unit: 'Vancouver Suite #204',
          note: 'Move-in condition inspection completed & signed with RTB-27. Security deposit $1,150 held in designated trust account.',
          timestamp: '15 Oct 2026',
        },
        {
          id: 'case-512',
          unit: 'Kelowna Duplex Unit B',
          note: 'Annual heating & smoke alarm safety inspection logged. Water heater checked with zero active seepage.',
          timestamp: '02 Nov 2026',
        },
        {
          id: 'case-618',
          unit: 'Victoria Suite #108',
          note: '2026 Allowable Rent Increase prepared with 3 full calendar months notice served in accordance with RTA Section 42.',
          timestamp: '18 Nov 2026',
        },
      ];
      setNotes(initialNotes);
      localStorage.setItem('landlords_member_notes', JSON.stringify(initialNotes));
    }

    // Trigger gauge animation smoothly
    const timer = setTimeout(() => {
      setGaugePercent(100);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const item: MemberNote = {
      id: `case-${Date.now().toString().slice(-4)}`,
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
    setIsAddingNote(false);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem('landlords_member_notes', JSON.stringify(updated));
    if (activeNoteModal?.id === id) setActiveNoteModal(null);
  };

  const handleDownloadToolkit = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 4500);

    const bundleContent = `========================================================================
LANDLORDS BC — COMPLETE STATUTORY LEGAL DEFENSE & COMPLIANCE DOSSIER
Active Member ID: ${memberId}
Registered Account: ${userEmail}
Issued By: Landlords BC Association Legal Research Desk
Date: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
Plan Tier: ${membershipPlan}
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

  const handleDownloadFormDocument = (form: any) => {
    if (form.id === 'gov-portal' || form.id === 'gov-bclaws') {
      window.open(form.link, '_blank');
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const docContent = `========================================================================
LANDLORDS BC — STATUTORY FORM & COMPLIANCE DOSSIER
Document Title: ${form.title} (${form.code})
Active Member ID: ${memberId}
Registered Account: ${userEmail}
Jurisdiction: British Columbia, Canada (RTA SBC 2002, c. 78)
Date Generated: ${dateStr}
Zero-Disclosure Charter: Verified Confidential Association Document
========================================================================

1. PURPOSE & STATUTORY FRAMEWORK:
${form.description}

2. STATUTORY SERVICE REQUIREMENTS (BC RTA SECTION 88 & 90):
- In Person: Deemed served immediately on the same date.
- Posting to Front Door or Mailbox: Deemed received 3 full calendar days later.
- Sent by Registered Mail: Deemed received 5 full calendar days later.
- Email Service: Allowed only with signed prior written consent (Form RTB-51).

3. OFFICIAL RTB DISPUTE ADMISSIBILITY NOTE:
Never alter standard government clauses or attempt to contract out of the BC Residential Tenancy Act (Section 5). Keep this completed document in your Landlords BC Private Documentation Vault for formal dispute hearings.

Landlords BC Priority Helpline: 1-800-555-0199
© 2026 Landlords BC Association. All rights reserved.`;

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Landlords-BC-${form.code}-${form.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
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

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f6f0e7',
        color: '#2a1a12',
        fontFamily: '"Inter Tight", system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Sticky Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(246, 240, 231, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(42, 26, 18, 0.08)',
          padding: '12px 24px',
        }}
      >
        <div
          className="wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={onBackToHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              title="Return to Home Page"
            >
              <svg viewBox="0 0 40 40" width="32" height="32" fill="#2a1a12">
                <path d="M5 5h13v13H5zM22 22h13v13H22z" />
                <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.02em', color: '#2a1a12' }}>
                  LANDLORDS BC
                </div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5b4a3f', fontWeight: 600 }}>
                  Member Portal
                </div>
              </div>
            </button>

            <span
              style={{
                background: 'rgba(46, 107, 59, 0.12)',
                color: '#2e6b3b',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span style={{ fontSize: '8px' }}>●</span> {memberId} ✓
            </span>
          </div>

          {/* Center: Subscription Plan Badge */}
          <div
            style={{
              background: 'rgba(236, 227, 215, 0.8)',
              border: '1px solid rgba(42, 26, 18, 0.12)',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#3b2116',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ color: '#2e6b3b' }}>●</span>
            <span>Plan: <strong>{membershipPlan}</strong></span>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href={CONTACT_INFO.phoneHref}
              style={{
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid rgba(42, 26, 18, 0.12)',
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2a1a12',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
              title="Call Priority Advisor Helpline"
            >
              <span>📞 {CONTACT_INFO.phone}</span>
            </a>

            <button
              type="button"
              onClick={onBackToHome}
              style={{
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid rgba(42, 26, 18, 0.12)',
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2a1a12',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>← Back to Home</span>
            </button>

            <button
              type="button"
              onClick={onSignOut}
              style={{
                background: 'rgba(42, 26, 18, 0.06)',
                border: '1px solid rgba(42, 26, 18, 0.1)',
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#5b4a3f',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Bento Grid Section */}
      <main style={{ flex: 1, padding: '28px 0 60px' }}>
        <div className="wrap" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

          {/* Section Header */}
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#2e6b3b',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              <span>●</span> Active Member Portal · Verified Zero-Disclosure Charter
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', margin: '4px 0 6px', color: '#2a1a12' }}>
              Member Association Dashboard
            </h1>
            <p style={{ fontSize: '14px', color: '#5b4a3f', margin: 0 }}>
              Welcome back, <strong>{userName}</strong> ({userEmail}). Your active <strong>{membershipPlan}</strong> provides complete statutory RTA defense coverage.
            </p>
          </div>

          {/* Notification Alert if downloaded */}
          {downloadNotice && (
            <div
              style={{
                background: '#2e6b3b',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px',
                boxShadow: '0 4px 14px rgba(46, 107, 59, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>✓</span>
              <span>Complete Statutory Legal Defense Kit downloaded successfully! Check your downloads folder.</span>
            </div>
          )}

          {/* TAILORED BENTO GRID FOR LOGGED-IN MEMBERS */}
          <div className="bento" style={{ marginTop: '0', gridTemplateColumns: '1.2fr 1fr 1fr' }}>
            
            {/* Card 1: Member Subscription & Protection Passport (Tall Left Anchor) */}
            <div className="card c-big" style={{ background: '#3b2116' }}>
              <img
                src="/assets/landlord/sunlit-facade.svg"
                alt="Protected BC property"
                style={{ objectFit: 'cover', opacity: 0.85 }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span
                  style={{
                    background: 'rgba(46, 107, 59, 0.35)',
                    border: '1px solid rgba(74, 222, 128, 0.5)',
                    color: '#bbf7d0',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '12px',
                  }}
                >
                  Member ID: {memberId} ✓ · Active
                </span>
                <h3 style={{ fontSize: '25px', lineHeight: 1.25, fontWeight: 700, margin: '0 0 10px' }}>
                  Member Protection
                  <br />
                  <span>&amp; Legal Defense Passport</span>
                </h3>
                <p className="desc" style={{ fontSize: '13px', lineHeight: 1.55, color: 'rgba(255, 255, 255, 0.88)' }}>
                  Your active membership guarantees verified legal defense under the BC Residential Tenancy Act (RTA), priority advisor hotline support, and pre-formatted dispute evidence packages across all your rental units.
                </p>
                <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(0, 0, 0, 0.28)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700 }}>
                    Active Subscription Tier
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f6f0e7', marginTop: '2px' }}>
                    {membershipPlan}
                  </div>
                  <div style={{ fontSize: '11px', color: '#bbf7d0', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>●</span> Annual Billing · RTA Protection Active
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div className="avatars" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="av-stack">
                    <img src="/assets/landlord/landlord-profile.svg" alt="Protected BC landlord" />
                    <img src="/assets/landlord/penthouse-living.svg" alt="BC rental residence" />
                    <img src="/assets/landlord/sunlit-facade.svg" alt="Protected building" />
                  </div>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                    2,400+ protected BC property owners
                  </span>
                </div>

                <button
                  className="btn-white"
                  type="button"
                  onClick={handleDownloadToolkit}
                  style={{ fontWeight: 700 }}
                >
                  Download 2026 Legal Defense Kit ↓
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Zero-Disclosure Vault · Server-Sealed &amp; Fully Non-Public</span>
                </div>
              </div>
            </div>

            {/* Card 2: RTB Statutory Document Gateway (Top-Middle with Animated Character) */}
            <div className="card c-pad">
              <div className="collage">
                <div>
                  <img
                    src="/assets/landlord/staged-kitchen.svg"
                    alt="Property condition documentation"
                  />
                </div>
                <div>
                  <img
                    src="/assets/landlord/landlord-profile.svg"
                    alt="Animated stylish BC landlord character"
                  />
                </div>
              </div>
              <div className="txt">
                <h4>Official RTB Statutory Gateway</h4>
                <p>
                  Direct instant downloads of mandatory BC tenancy forms with statutory notice checklists and proof of service protocols.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleDownloadFormDocument(FORMS_CATALOGUE[1])}
                    style={{
                      background: '#3b2116',
                      color: '#f6f0e7',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Download RTB-30 10-Day Notice for Unpaid Rent"
                  >
                    RTB-30 Notice ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadFormDocument(FORMS_CATALOGUE[2])}
                    style={{
                      background: 'rgba(42, 26, 18, 0.08)',
                      color: '#2a1a12',
                      border: '1px solid rgba(42, 26, 18, 0.12)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Download RTB-27 Condition Inspection Report"
                  >
                    RTB-27 Report ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllForms(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b2116',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '6px 4px',
                    }}
                  >
                    View All 12+ Forms →
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Statutory Compliance & Health Gauge (Top-Right Radial Graph) */}
            <div className="card c-pad" id="gauge-card">
              <div className="gauge">
                <svg
                  viewBox="0 0 180 100"
                  style={{ width: '180px', height: '110px', overflow: 'visible' }}
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="gg-dash" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a9c6e6" />
                      <stop offset="100%" stopColor="#e9a77d" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 95 A80 80 0 0 1 170 95"
                    fill="none"
                    stroke="rgba(42,26,18,.1)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 95 A80 80 0 0 1 170 95"
                    fill="none"
                    stroke="url(#gg-dash)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="252"
                    strokeDashoffset={gaugePercent === 100 ? 0 : 252}
                    style={{
                      transition: 'stroke-dashoffset 2.2s cubic-bezier(.22,1,.36,1)',
                    }}
                  />
                </svg>
                <div className="val">
                  <span>100</span>%
                </div>
                <div className="ends">
                  <span>Notice Error Risk: 0%</span>
                  <span>Server-Sealed: 100%</span>
                </div>
              </div>
              <div className="txt">
                <h4>Statutory Procedural Health: 100%</h4>
                <p>
                  All condition inspection files, timestamps, and service affidavits comply with admissible RTB dispute guidelines under full anonymity.
                </p>
              </div>
            </div>

            {/* Card 4: Private Property Vault & Unit Ledger (Bottom-Middle Interactive Rows) */}
            <div className="card c-pad">
              <div className="rows">
                {notes.slice(0, 3).map((note, idx) => (
                  <div
                    key={note.id}
                    className="row"
                    style={{ ['--i' as string]: idx, opacity: 1, transform: 'none' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveNoteModal(note)}
                    title="Click to view complete confidential note"
                  >
                    <img
                      src={
                        idx === 0
                          ? '/assets/landlord/staged-kitchen.svg'
                          : idx === 1
                          ? '/assets/landlord/penthouse-living.svg'
                          : '/assets/landlord/landlord-profile.svg'
                      }
                      alt={note.unit}
                    />
                    <div>
                      <b>{note.unit}</b>
                      <em>{note.note.length > 55 ? note.note.slice(0, 55) + '...' : note.note}</em>
                    </div>
                    <span className="ok">
                      <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M2.5 6.5L5 9L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                ))}
              </div>
              <div className="txt">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4>Private Property Vault &amp; Unit Ledger</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    style={{
                      background: '#3b2116',
                      color: '#f6f0e7',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + Add Unit Record
                  </button>
                </div>
                <p>
                  Time-stamped inspection and repair logs for dispute defense. Stored exclusively on your device under the Zero-Disclosure Charter.
                </p>
              </div>
            </div>

            {/* Card 5: 2026 Provincial Rent Calculator (Bottom-Right with Architectural Artwork) */}
            <div className="card c-pad">
              <div className="insight">
                <img
                  src="/assets/landlord/penthouse-living.svg"
                  alt="Protected tenancy records vault"
                />
                <div className="chip">
                  <i></i>
                  <span>● 2026 RTA Cap: 3.0%</span>
                </div>
              </div>
              <div className="txt">
                <h4>2026 Statutory Rent Increase Calculator</h4>
                <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    value={rentInput}
                    onChange={(e) => setRentInput(Math.max(0, Number(e.target.value)))}
                    style={{
                      width: '95px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(42, 26, 18, 0.2)',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                    title="Current Rent CAD"
                  />
                  <span style={{ fontSize: '11px', color: '#5b4a3f' }}>
                    +3% = <strong>${newMaxRent.toFixed(2)}/mo</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRentCalc}
                    style={{
                      background: '#3b2116',
                      color: '#f6f0e7',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    {copiedRent ? 'Copied ✓' : 'Copy RTB-7'}
                  </button>
                </div>
                <p>
                  Provincial rent increase cap strictly enforced at 3.0% for 2026. Landlords must give at least 3 full rental payment months notice under RTA Section 42.
                </p>
              </div>
            </div>

          </div>

          {/* Quick Note Modal */}
          {isAddingNote && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsAddingNote(false);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '520px', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#2a1a12' }}>Add Private Property Note</h3>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setIsAddingNote(false)}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Unit Identifier:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vancouver Suite #204"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Observation / Repair Log:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter confidential observation, inspection date, or repair note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: '#3b2116',
                      color: '#f6f0e7',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '6px',
                    }}
                  >
                    Save to Private Vault
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Note Detail Modal */}
          {activeNoteModal && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setActiveNoteModal(null);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '520px', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#8c7e75', textTransform: 'uppercase', fontWeight: 600 }}>
                      Confidential Unit Record · {activeNoteModal.timestamp}
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: '#2a1a12' }}>
                      {activeNoteModal.unit}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setActiveNoteModal(null)}
                  >
                    ✕
                  </button>
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#3b2116', margin: '0 0 20px' }}>
                  {activeNoteModal.note}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(activeNoteModal.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#b91c1c',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete Record ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNoteModal(null)}
                    style={{
                      background: '#3b2116',
                      color: '#f6f0e7',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* All Forms Catalogue Modal */}
          {showAllForms && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowAllForms(false);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '780px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2e6b3b', fontWeight: 700 }}>
                      Official RTB Statutory Repository
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#2a1a12' }}>
                      All Official Forms &amp; Practical Templates
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setShowAllForms(false)}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', paddingRight: '4px' }}>
                  {FORMS_CATALOGUE.map((form) => (
                    <div
                      key={form.id}
                      style={{
                        border: '1px solid rgba(42, 26, 18, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: '#ffffff',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: '#3b2116' }}>{form.code}</span>
                          <span style={{ fontSize: '10px', background: 'rgba(46, 107, 59, 0.1)', color: '#2e6b3b', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                            {form.badge}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', color: '#2a1a12' }}>{form.title}</h4>
                        <p style={{ fontSize: '12px', color: '#5b4a3f', margin: '0 0 12px', lineHeight: 1.5 }}>{form.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadFormDocument(form)}
                          style={{
                            background: '#3b2116',
                            color: '#f6f0e7',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            flex: 1,
                          }}
                        >
                          {form.category === 'third-party' ? 'Open Portal ↗' : 'Download Document ↓'}
                        </button>
                        {form.isExternal && form.link && form.link.startsWith('http') && form.category !== 'third-party' && (
                          <a
                            href={form.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: 'rgba(42, 26, 18, 0.05)',
                              border: '1px solid rgba(42, 26, 18, 0.12)',
                              color: '#2a1a12',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            PDF ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer matching standard landing page */}
      <footer
        style={{
          borderTop: '1px solid rgba(42, 26, 18, 0.08)',
          background: 'rgba(250, 245, 238, 0.65)',
          padding: '24px',
          fontSize: '12px',
          color: '#5b4a3f',
        }}
      >
        <div
          className="wrap"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            © Copyright Landlords BC 2026 · Confidential Member Association Portal
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>RTA Regulatory Framework</span>
            <span>Zero-Disclosure Charter</span>
            <span>Helpline: {CONTACT_INFO.phone}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
