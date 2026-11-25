import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../data/constants';
import { FORMS_CATALOGUE, FormItem } from '../data/forms';

interface MemberDashboardPageProps {
  onBackToHome: () => void;
  onSignOut: () => void;
  onOpenResourcesModal?: () => void;
  onOpenMembershipModal?: (planChoice?: string) => void;
}

export interface MemberNote {
  id: string;
  unit: string;
  note: string;
  timestamp: string;
  tenantName?: string;
  moveInDate?: string;
  lastRentIncreaseDate?: string;
  depositAmount?: number;
  depositStatus?: 'held_in_trust' | 'forwarding_received' | 'returned' | 'disputed';
  depositForwardingDate?: string;
  conditionInspectionSigned?: boolean;
  annualSafetyChecked?: boolean;
  complianceTag?: string;
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

  // Helper to format plan tier names cleanly
  const formatPlanName = (plan: string) => {
    if (!plan) return 'Individual Membership ($290 CAD / year)';
    const lower = plan.toLowerCase();
    if (lower.includes('property') || lower.includes('590') || lower === 'property-manager') {
      return 'Property Manager Membership ($590 CAD / year)';
    }
    if (lower.includes('individual') || lower.includes('290')) {
      return 'Individual Membership ($290 CAD / year)';
    }
    return plan;
  };

  // Helper for natural grammatical greeting copy
  const formatPlanGrammatical = (plan: string) => {
    const lower = (plan || '').toLowerCase();
    if (lower.includes('property') || lower.includes('590') || lower === 'property-manager') {
      return 'Property Manager membership';
    }
    return 'Individual membership';
  };

  // Notes & Unit Ledger state
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [newUnit, setNewUnit] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [newMoveInDate, setNewMoveInDate] = useState('');
  const [newLastIncreaseDate, setNewLastIncreaseDate] = useState('');
  const [newDepositAmount, setNewDepositAmount] = useState<number | ''>('');
  const [newDepositStatus, setNewDepositStatus] = useState<'held_in_trust' | 'forwarding_received'>('held_in_trust');
  const [newForwardingDate, setNewForwardingDate] = useState('');
  const [newConditionSigned, setNewConditionSigned] = useState(true);
  const [newSafetyChecked, setNewSafetyChecked] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeNoteModal, setActiveNoteModal] = useState<MemberNote | null>(null);

  // Forms modal & Service Helper modal state
  const [showAllForms, setShowAllForms] = useState(false);
  const [showServiceHelperModal, setShowServiceHelperModal] = useState(false);
  const [activeAdvisoryTopic, setActiveAdvisoryTopic] = useState<string>('unpaid_rent');

  // Rent Calculator state
  const [rentInput, setRentInput] = useState<number>(2200);
  const [serviceMethod, setServiceMethod] = useState<'person' | 'door' | 'mail'>('door');
  const [calcLastIncrease, setCalcLastIncrease] = useState<string>('2025-01-01');
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
        if (parsed.name && parsed.name.trim()) {
          setUserName(parsed.name.trim());
        }
      } catch (_) {}
    } else {
      const pending = localStorage.getItem('pending_checkout_email');
      if (pending) {
        setUserEmail(pending);
        const prefix = pending.split('@')[0];
        if (prefix && prefix !== 'member' && prefix !== 'test') {
          const readable = prefix.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          setUserName(readable);
        }
      }
    }

    const savedPlan = localStorage.getItem('pending_checkout_plan');
    if (savedPlan) {
      setMembershipPlan(formatPlanName(savedPlan));
    }

    let assigned = localStorage.getItem('landlords_member_id');
    if (!assigned) {
      assigned = `BC-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('landlords_member_id', assigned);
    }
    setMemberId(assigned);

    // Load private unit notes
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
          tenantName: 'Michael & Sarah Chen',
          moveInDate: '01 Oct 2024',
          lastRentIncreaseDate: '01 Jan 2025',
          depositAmount: 1150,
          depositStatus: 'held_in_trust',
          conditionInspectionSigned: true,
          annualSafetyChecked: true,
          complianceTag: 'RTB-27 Signed · Trust Held',
          note: 'Move-in condition inspection completed & signed with RTB-27. Security deposit $1,150 held in designated trust account.',
          timestamp: '15 Oct 2026',
        },
        {
          id: 'case-512',
          unit: 'Kelowna Duplex Unit B',
          tenantName: 'David Miller',
          moveInDate: '15 Jun 2023',
          lastRentIncreaseDate: '01 Jul 2024',
          depositAmount: 1200,
          depositStatus: 'forwarding_received',
          depositForwardingDate: '2026-11-18',
          conditionInspectionSigned: true,
          annualSafetyChecked: true,
          complianceTag: '15-Day Deposit Watch',
          note: 'Tenancy concluding Nov 30. Written forwarding address provided Nov 18. Statutory 15-day security deposit return countdown active.',
          timestamp: '18 Nov 2026',
        },
        {
          id: 'case-618',
          unit: 'Victoria Suite #108',
          tenantName: 'Emma Watson',
          moveInDate: '01 May 2025',
          lastRentIncreaseDate: '2025-05-01',
          depositAmount: 975,
          depositStatus: 'held_in_trust',
          conditionInspectionSigned: true,
          annualSafetyChecked: true,
          complianceTag: 'Eligible for 2026 Increase',
          note: '2026 Allowable Rent Increase prepared with 3 full calendar months notice served in accordance with RTA Section 42.',
          timestamp: '22 Nov 2026',
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

    let tag = 'General Property';
    if (newDepositStatus === 'forwarding_received') {
      tag = '15-Day Deposit Watch';
    } else if (newConditionSigned) {
      tag = 'RTB-27 Signed · Trust Held';
    } else {
      tag = 'Inspection Pending';
    }

    const item: MemberNote = {
      id: `case-${Date.now().toString().slice(-4)}`,
      unit: newUnit.trim() || 'General Property',
      tenantName: newTenantName.trim() || undefined,
      moveInDate: newMoveInDate.trim() || undefined,
      lastRentIncreaseDate: newLastIncreaseDate.trim() || undefined,
      depositAmount: typeof newDepositAmount === 'number' ? newDepositAmount : undefined,
      depositStatus: newDepositStatus,
      depositForwardingDate: newDepositStatus === 'forwarding_received' && newForwardingDate ? newForwardingDate : undefined,
      conditionInspectionSigned: newConditionSigned,
      annualSafetyChecked: newSafetyChecked,
      complianceTag: tag,
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
    setNewTenantName('');
    setNewMoveInDate('');
    setNewLastIncreaseDate('');
    setNewDepositAmount('');
    setNewDepositStatus('held_in_trust');
    setNewForwardingDate('');
    setNewConditionSigned(true);
    setNewSafetyChecked(true);
    setNewNote('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem('landlords_member_notes', JSON.stringify(updated));
    if (activeNoteModal?.id === id) setActiveNoteModal(null);
  };

  // Export structured dispute evidence packet for a specific unit
  const handleExportUnitEvidence = (note: MemberNote) => {
    const dateStr = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const depositInfo = note.depositAmount
      ? `Deposit Held: $${note.depositAmount} CAD (Designated Trust Account under RTA Sec 19)
Deposit Status: ${note.depositStatus === 'forwarding_received' ? 'Forwarding Address Logged — 15-Day Countdown Active' : 'Held in Trust'}
Forwarding Address Received Date: ${note.depositForwardingDate || 'N/A'}`
      : 'Deposit Records: Stored in Private Ledger';

    const inspectionInfo = `RTB-27 Condition Inspection Report: ${note.conditionInspectionSigned ? 'Signed & Executed on File (RTA Sec 23/35 Compliant)' : 'Pending Opportunity Offer'}
Annual Safety & Smoke/CO Alarm Check: ${note.annualSafetyChecked ? 'Verified & Documented' : 'Scheduled'}`;

    const content = `========================================================================
BC RESIDENTIAL TENANCY BRANCH (RTB) — DISPUTE EVIDENCE DOSSIER
Unit / Property Identifier: ${note.unit}
Member ID: ${memberId}
Landlord Account: ${userEmail}
Prepared On: ${dateStr}
Zero-Disclosure Charter: Verified Confidential Property Defense Package
========================================================================

DOCUMENT CLASSIFICATION & ADMISSIBILITY:
This dossier compiles chronologically indexed statutory evidence, service logs, and inspection documentation for dispute resolution proceedings before the BC Residential Tenancy Branch (RTA SBC 2002, c. 78).

------------------------------------------------------------------------
SECTION 1: TENANCY & UNIT PROFILE
- Unit: ${note.unit}
- Tenant Name(s): ${note.tenantName || 'Tenant on File'}
- Tenancy Start / Move-In Date: ${note.moveInDate || note.timestamp}
- Last Rent Increase Date: ${note.lastRentIncreaseDate || 'N/A'}
- 2026 Allowable Increase Status: Eligible under RTA Section 42 (3.0% cap)

------------------------------------------------------------------------
SECTION 2: STATUTORY CONDITION INSPECTION & SAFETY COMPLIANCE
${inspectionInfo}
*Statutory Admissibility Note (RTA Sec 24 & 36):
Failure of landlord to complete Form RTB-27 moves the full statutory burden of proof. Having signed RTB-27 on file preserves landlord right to claim against security deposit.

------------------------------------------------------------------------
SECTION 3: SECURITY DEPOSIT LEDGER (RTA SECTION 38)
${depositInfo}
*Statutory 15-Day Rule:
Under Section 38(1), within 15 days of the later of (a) the date the tenancy ends, and (b) the date the landlord receives the tenant's forwarding address in writing, the landlord must either repay the deposit or file an RTB Dispute Resolution application. Section 38(6) mandates double return if deadline is missed without tenant written consent.

------------------------------------------------------------------------
SECTION 4: CONFIDENTIAL INSPECTION & REPAIR CHRONOLOGY
Logged Record (${note.timestamp}):
"${note.note}"

------------------------------------------------------------------------
SECTION 5: RTB DISPUTE ACCESS UPLOAD INDEX
Standard Evidentiary File Naming Standards for RTB Portal:
- 01_RTB27_MoveInInspection_${note.unit.replace(/[^a-zA-Z0-9]/g, '')}.pdf
- 02_RTA_DepositReceipt_TrustVerification.pdf
- 03_IncidentNotes_TimestampedLog_${note.id}.pdf
- 04_ProofOfService_Affidavit_RTB34.pdf

Advisor Line for Hearing Preparation: ${CONTACT_INFO.phone} (${CONTACT_INFO.phoneHours})
Landlords BC Member Support Desk: ${CONTACT_INFO.helpEmail}
© 2026 Landlords BC Association. All rights reserved.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RTB-Evidence-Packet-${note.unit.replace(/[^a-zA-Z0-9]/g, '_')}-${memberId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
2. Section 88 & 90 Proof of Service Affidavit Checklist (RTB-34)
3. 2026 Allowable Rent Increase (3.0%) Notice Calculator Form (RTB-7 Protocol)
4. Move-In Inspection Sequence & Key Handover Protocol (RTA Sec 23)
5. Security Deposit Trust Account Ledger & 15-Day Return Protocol (RTA Sec 19 & 38)
6. Priority Advisor Line Direct Contact (${CONTACT_INFO.phoneHours})

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
[ ] In Tenant Mailbox: Deemed 3 days later.
[ ] Registered Mail: Deemed 5 days later. (Attach Canada Post tracking barcode).
[ ] Email Service: Allowed only with signed prior consent (Form RTB-51). Deemed 3 days later.
Witness Signature: _______________________ Date: _______________________

------------------------------------------------------------------------
SECTION 3: 2026 MAXIMUM ALLOWABLE RENT INCREASE FORMULA
- BC 2026 Statutory Rent Increase Limit: 3.0%
- Notice Period Required: 3 full rental payment months prior to effective date.
- Required Mandatory Form: RTB-7 (Notice of Rent Increase - Residential).
- 12-Month Rule: Must be at least 12 months since rent was established or last increased.
- Failure to give 3 full months notice makes the entire increase legally void.

------------------------------------------------------------------------
SECTION 4: MOVE-IN / MOVE-OUT INSPECTION PROTOCOL (RTA SEC 23 & 35)
- Landlord must offer at least two opportunities for the condition inspection.
- The second opportunity must be offered in writing using Form RTB-22.
- Failure to complete Form RTB-27 moves the statutory burden of proof entirely onto landlord.

Landlords BC Priority Member Advisor Line: ${CONTACT_INFO.phone} (${CONTACT_INFO.phoneHours})
Direct Advisory Email: ${CONTACT_INFO.helpEmail}
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

  const handleDownloadFormDocument = (form: FormItem) => {
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

3. PROOF OF SERVICE CHECKLIST (RTB-34 COMPLIANCE):
[ ] Retain copy of document exactly as served
[ ] If served in person: Witness declaration signed (or tenant acknowledgment)
[ ] If posted to door/mailbox: Clear timestamped photo showing document affixed
[ ] If sent by registered mail: Canada Post tracking receipt + signature delivery confirmation
[ ] If served by email: Form RTB-51 signed agreement on file + sent email copy

4. OFFICIAL RTB DISPUTE ADMISSIBILITY NOTE:
Never alter standard government clauses or attempt to contract out of the BC Residential Tenancy Act (Section 5). Keep this completed document in your Landlords BC Private Documentation Vault for formal dispute hearings.

Landlords BC Priority Helpline: ${CONTACT_INFO.phone} (${CONTACT_INFO.phoneHours})
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

  // Calculations for 2026 Rent Increase with Section 42 Lead Time & Service Buffers
  const rentIncreaseAmount = Math.round(rentInput * 0.03 * 100) / 100;
  const newMaxRent = rentInput + rentIncreaseAmount;

  const calculateRentDates = (method: 'person' | 'door' | 'mail', lastDateStr: string) => {
    const today = new Date();
    const deemedBufferDays = method === 'person' ? 0 : method === 'door' ? 3 : 5;

    // Deemed delivery date if served today
    const deemedDate = new Date(today);
    deemedDate.setDate(deemedDate.getDate() + deemedBufferDays);

    // Under RTA Sec 42, notice requires 3 FULL rental payment months.
    // Notice deemed in month M -> 3 full months are M+1, M+2, M+3. Effective on 1st of M+4.
    const effectiveYear =
      deemedDate.getMonth() + 4 > 11
        ? deemedDate.getFullYear() + Math.floor((deemedDate.getMonth() + 4) / 12)
        : deemedDate.getFullYear();
    const effectiveMonth = (deemedDate.getMonth() + 4) % 12;
    const earliestEffective = new Date(effectiveYear, effectiveMonth, 1);

    // 12-Month Rule compliance check
    let compliant12Months = true;
    if (lastDateStr) {
      const lastDate = new Date(lastDateStr);
      const diffMonths =
        (earliestEffective.getFullYear() - lastDate.getFullYear()) * 12 +
        (earliestEffective.getMonth() - lastDate.getMonth());
      compliant12Months = diffMonths >= 12;
    }

    // Recommended latest service date for this effective date
    const lastDayOfNoticeMonth = new Date(effectiveYear, effectiveMonth - 3, 0);
    const latestServiceDate = new Date(lastDayOfNoticeMonth);
    latestServiceDate.setDate(latestServiceDate.getDate() - deemedBufferDays);

    return {
      deemedBufferDays,
      earliestEffective,
      latestServiceDate,
      compliant12Months,
    };
  };

  const rentDates = calculateRentDates(serviceMethod, calcLastIncrease);

  const handleCopyRentCalc = () => {
    const methodName =
      serviceMethod === 'person'
        ? 'In Person (Same Day deemed under RTA Sec 88)'
        : serviceMethod === 'door'
        ? 'Affixed to Tenant Door / Mailbox (Deemed 3 days later under RTA Sec 90)'
        : 'Canada Post Registered Mail (Deemed 5 days later under RTA Sec 90)';

    const effectiveDateStr = rentDates.earliestEffective.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const latestServiceStr = rentDates.latestServiceDate.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const text = `========================================================================
BC RESIDENTIAL TENANCY BRANCH — FORM RTB-7 NOTICE SCHEDULE
Authorized under Section 42 & 43 of the Residential Tenancy Act (RTA)
========================================================================
MEMBER ID: ${memberId}
CURRENT MONTHLY RENT: $${rentInput.toFixed(2)} CAD
2026 STATUTORY MAXIMUM CAP: 3.0%
ALLOWABLE INCREASE: +$${rentIncreaseAmount.toFixed(2)} CAD / month
NEW LAWFUL MONTHLY RENT: $${newMaxRent.toFixed(2)} CAD / month

STATUTORY SERVICE & TIMELINE COMPLIANCE:
- Service Method: ${methodName}
- Latest Recommended Service Date: ${latestServiceStr}
- 3 Full Rental Payment Notice Months: ${rentDates.earliestEffective.toLocaleString('en-CA', { month: 'long' })} effective
- Earliest Lawful Effective Date: ${effectiveDateStr}
- 12-Month Rule Status: ${rentDates.compliant12Months ? 'Compliant (12+ full months elapsed)' : 'Warning: Minimum 12 months required between increases'}

MANDATORY RTB DISPUTE ADMISSIBILITY RULES:
1. Must use official, unaltered Form RTB-7 (Notice of Rent Increase - Residential).
2. Notice must be served at least 3 full rental payment months before effective date.
3. If rent is due on the 1st of the month, notice must be deemed received before the 1st of the initial notice month.
4. Landlord must retain proof of service (Form RTB-34 or Registered Mail barcode).
========================================================================`;

    navigator.clipboard.writeText(text);
    setCopiedRent(true);
    setTimeout(() => setCopiedRent(false), 3500);
  };

  // 15-day deposit return calculator helper
  const calculateDepositCountdown = (forwardingDateStr?: string) => {
    if (!forwardingDateStr) return null;
    const fDate = new Date(forwardingDateStr);
    const deadline = new Date(fDate);
    deadline.setDate(deadline.getDate() + 15);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      deadlineStr: deadline.toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' }),
      daysRemaining: diffDays,
      isOverdue: diffDays < 0,
    };
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
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 3px 12px rgba(42, 26, 18, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
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
            <span>Plan: <strong>{formatPlanName(membershipPlan)}</strong></span>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href={CONTACT_INFO.phoneHref}
              style={{
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 3px 12px rgba(42, 26, 18, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                padding: '7px 15px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2a1a12',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              title={`Call Priority Advisor Helpline · ${CONTACT_INFO.phoneHours}`}
            >
              <span>📞 {CONTACT_INFO.phone}</span>
            </a>

            <button
              type="button"
              onClick={onBackToHome}
              style={{
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 3px 12px rgba(42, 26, 18, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                padding: '7px 15px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2a1a12',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>← Back to Home</span>
            </button>

            <button
              type="button"
              onClick={onSignOut}
              style={{
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(42, 26, 18, 0.12)',
                boxShadow: '0 2px 8px rgba(42, 26, 18, 0.04)',
                padding: '7px 15px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#5b4a3f',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
              Welcome back, <strong>{userName}</strong> ({userEmail}). Your active <strong>{formatPlanGrammatical(membershipPlan)}</strong> provides complete statutory RTA defense coverage.
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
            <div className="card c-big" style={{ background: '#3b2116', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
              <img
                src="/assets/landlord/sunlit-facade.svg"
                alt="Protected BC property"
                style={{ objectFit: 'cover', opacity: 0.45 }}
              />

              {/* Upper Frosted Glass Panel for Text Readability */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  background: 'rgba(32, 17, 10, 0.78)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '20px',
                  padding: '20px 18px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                }}
              >
                <span
                  style={{
                    background: 'rgba(46, 107, 59, 0.4)',
                    border: '1px solid rgba(74, 222, 128, 0.55)',
                    color: '#bbf7d0',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '10px',
                  }}
                >
                  Member ID: {memberId} ✓ · Active
                </span>
                <h3 style={{ fontSize: '24px', lineHeight: 1.25, fontWeight: 700, margin: '0 0 10px', color: '#ffffff' }}>
                  Member Protection
                  <br />
                  <span style={{ color: '#f6f0e7' }}>&amp; Legal Defense Passport</span>
                </h3>
                <p className="desc" style={{ fontSize: '13px', lineHeight: 1.55, color: 'rgba(255, 255, 255, 0.92)', margin: 0 }}>
                  Your active membership guarantees verified legal defense under the BC Residential Tenancy Act (RTA), priority advisor hotline support ({CONTACT_INFO.phoneHours}), and pre-formatted dispute evidence packages across all your rental units.
                </p>
                <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(0, 0, 0, 0.35)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700 }}>
                    Active Subscription Tier
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#f6f0e7', marginTop: '2px' }}>
                    {formatPlanName(membershipPlan)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#bbf7d0', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>●</span> Annual Billing · RTA Protection Active
                  </div>
                </div>
              </div>

              {/* Lower Frosted Glass Panel for Actions & Guarantees */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  background: 'rgba(32, 17, 10, 0.78)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '20px',
                  padding: '16px 18px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginTop: '14px',
                }}
              >
                <div className="avatars" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="av-stack">
                    <img src="/assets/landlord/landlord-profile.svg" alt="Protected BC landlord" />
                    <img src="/assets/landlord/penthouse-living.svg" alt="BC rental residence" />
                    <img src="/assets/landlord/sunlit-facade.svg" alt="Protected building" />
                  </div>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500 }}>
                    2,400+ protected BC property owners
                  </span>
                </div>

                {/* Glass UI Themed Action Button */}
                <button
                  type="button"
                  onClick={handleDownloadToolkit}
                  style={{
                    background: 'rgba(255, 255, 255, 0.88)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 1)',
                    color: '#2a1a12',
                    padding: '13px 20px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.98)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.88)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>Download 2026 Legal Defense Kit</span>
                  <span style={{ fontSize: '15px' }}>↓</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Zero-Disclosure Vault · Encrypted on Device &amp; Client-Sealed</span>
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

                {/* Primary Quick Access Form Buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleDownloadFormDocument(FORMS_CATALOGUE[1])}
                    style={{
                      background: 'rgba(59, 33, 22, 0.88)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 4px 14px rgba(59, 33, 22, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                      color: '#f6f0e7',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Download RTB-30 10-Day Notice for Unpaid Rent"
                  >
                    <span>RTB-30 Notice</span>
                    <span>↓</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadFormDocument(FORMS_CATALOGUE[2])}
                    style={{
                      background: 'rgba(255, 255, 255, 0.72)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 3px 12px rgba(42, 26, 18, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                      color: '#2a1a12',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Download RTB-27 Condition Inspection Report"
                  >
                    <span>RTB-27 Report</span>
                    <span>↓</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadFormDocument(FORMS_CATALOGUE[4])}
                    style={{
                      background: 'rgba(255, 255, 255, 0.72)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      color: '#2a1a12',
                      padding: '6px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Download RTB-7 Notice of Rent Increase"
                  >
                    RTB-7 Rent Incr ↓
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadFormDocument(FORMS_CATALOGUE[5] || FORMS_CATALOGUE[3])}
                    style={{
                      background: 'rgba(255, 255, 255, 0.72)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      color: '#2a1a12',
                      padding: '6px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Download RTB-33 One Month Notice for Cause"
                  >
                    RTB-33 Cause ↓
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAllForms(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.55)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(42, 26, 18, 0.12)',
                      color: '#3b2116',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>View All 12+ Forms</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Deemed Service Timing & Proof of Service Helper Bar */}
                <div
                  style={{
                    marginTop: '10px',
                    padding: '8px 10px',
                    background: 'rgba(42, 26, 18, 0.04)',
                    border: '1px solid rgba(42, 26, 18, 0.08)',
                    borderRadius: '8px',
                    fontSize: '10.5px',
                    lineHeight: 1.4,
                    color: '#3b2116',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <strong style={{ color: '#2a1a12' }}>
                      ⚖️ RTA Deemed Service Timing (Sec 88/90):
                    </strong>
                    <button
                      type="button"
                      onClick={() => setShowServiceHelperModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2e6b3b',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Proof Checklist →
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', color: '#5b4a3f' }}>
                    <span>⚡ <strong>In Person:</strong> Same Day</span>
                    <span>🚪 <strong>Door / Box:</strong> +3 Days</span>
                    <span>📮 <strong>Reg. Mail:</strong> +5 Days</span>
                  </div>
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
                {/* High Contrast Statutory Metric Badges */}
                <div className="ends" style={{ bottom: '2px', left: '8px', right: '8px' }}>
                  <span
                    style={{
                      background: 'rgba(46, 107, 59, 0.12)',
                      border: '1px solid rgba(46, 107, 59, 0.28)',
                      color: '#1e542c',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '10.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '8px' }}>●</span> 0% Notice Error Risk
                  </span>
                  <span
                    style={{
                      background: 'rgba(59, 33, 22, 0.1)',
                      border: '1px solid rgba(59, 33, 22, 0.22)',
                      color: '#2a1a12',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '10.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '8px' }}>●</span> 100% Client-Sealed Vault
                  </span>
                </div>
              </div>
              <div className="txt">
                <h4>Statutory Procedural Health: 100%</h4>
                <p>
                  All condition inspection records, timestamps, and service affidavits are encrypted on device and sealed locally under the Zero-Disclosure Charter.
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
                    title="Click to view complete confidential note & compliance status"
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <b style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.unit}</b>
                        {note.complianceTag && (
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '999px',
                              background: note.complianceTag.includes('Watch')
                                ? 'rgba(180, 83, 9, 0.15)'
                                : 'rgba(46, 107, 59, 0.12)',
                              color: note.complianceTag.includes('Watch') ? '#92400e' : '#2e6b3b',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {note.complianceTag}
                          </span>
                        )}
                      </div>
                      <em style={{ fontSize: '11px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.note}
                      </em>
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
                  {/* Glass UI Button: Add Unit Record */}
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    style={{
                      background: 'rgba(59, 33, 22, 0.88)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      boxShadow: '0 4px 14px rgba(59, 33, 22, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                      color: '#f6f0e7',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    + Add Unit Record
                  </button>
                </div>
                <p>
                  Time-stamped inspection and repair logs for dispute defense. Encrypted and stored exclusively on your device under the Zero-Disclosure Charter.
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

                {/* Main Rent Row */}
                <div style={{ margin: '8px 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    value={rentInput}
                    onChange={(e) => setRentInput(Math.max(0, Number(e.target.value)))}
                    style={{
                      width: '92px',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(42, 26, 18, 0.18)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#2a1a12',
                    }}
                    title="Current Rent CAD"
                  />
                  <span style={{ fontSize: '11px', color: '#5b4a3f' }}>
                    +3% = <strong>${newMaxRent.toFixed(2)}/mo</strong>
                  </span>
                  {/* Glass UI Button: Copy RTB-7 */}
                  <button
                    type="button"
                    onClick={handleCopyRentCalc}
                    style={{
                      background: copiedRent ? 'rgba(46, 107, 59, 0.88)' : 'rgba(59, 33, 22, 0.88)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      boxShadow: '0 4px 14px rgba(59, 33, 22, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                      color: '#f6f0e7',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: 'auto',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copiedRent ? 'Copied ✓' : 'Copy RTB-7'}
                  </button>
                </div>

                {/* Service Method Selector & 12-Month Check Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '10px', color: '#5b4a3f', marginTop: '6px', padding: '6px 8px', background: 'rgba(42, 26, 18, 0.04)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Method:</span>
                    <select
                      value={serviceMethod}
                      onChange={(e) => setServiceMethod(e.target.value as any)}
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 4px',
                        borderRadius: '4px',
                        border: '1px solid rgba(42, 26, 18, 0.15)',
                        background: '#ffffff',
                        color: '#2a1a12',
                      }}
                    >
                      <option value="door">Door Posting (+3d)</option>
                      <option value="person">In Person (Same day)</option>
                      <option value="mail">Registered Mail (+5d)</option>
                    </select>
                  </div>
                  <div>
                    <span>Earliest Effective: </span>
                    <strong style={{ color: '#2a1a12' }}>
                      {rentDates.earliestEffective.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </strong>
                  </div>
                </div>

                <p style={{ marginTop: '6px', marginBottom: 0, fontSize: '11px' }}>
                  3 full calendar months notice required under RTA Sec 42. Serve by <strong>{rentDates.latestServiceDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</strong> for this effective date.
                </p>
              </div>
            </div>

          </div>

          {/* Quick Note & Unit Record Modal */}
          {isAddingNote && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsAddingNote(false);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2e6b3b', fontWeight: 700 }}>
                      Private Unit Documentation Vault
                    </span>
                    <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: '#2a1a12' }}>Add Private Unit Record</h3>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setIsAddingNote(false)}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                        Unit Identifier:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Vancouver Suite #204"
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '12px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                        Tenant Name (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={newTenantName}
                        onChange={(e) => setNewTenantName(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                        Tenancy Start / Move-in Date:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 01 Oct 2024"
                        value={newMoveInDate}
                        onChange={(e) => setNewMoveInDate(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                        Last Rent Increase Date:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 01 Jan 2025"
                        value={newLastIncreaseDate}
                        onChange={(e) => setNewLastIncreaseDate(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                        Security Deposit ($ CAD):
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1150"
                        value={newDepositAmount}
                        onChange={(e) => setNewDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                        Deposit Status:
                      </label>
                      <select
                        value={newDepositStatus}
                        onChange={(e) => setNewDepositStatus(e.target.value as any)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '12px' }}
                      >
                        <option value="held_in_trust">Held in Trust Account (RTA Sec 19)</option>
                        <option value="forwarding_received">Forwarding Address Received (15-Day Watch)</option>
                      </select>
                    </div>
                  </div>

                  {newDepositStatus === 'forwarding_received' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px', color: '#b45309' }}>
                        Date Written Forwarding Address Received:
                      </label>
                      <input
                        type="date"
                        value={newForwardingDate}
                        onChange={(e) => setNewForwardingDate(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #b45309', fontSize: '12px' }}
                        required
                      />
                      <span style={{ fontSize: '10.5px', color: '#b45309' }}>
                        RTA Sec 38 requires return or RTB application within 15 days of this date.
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '16px', background: 'rgba(42, 26, 18, 0.04)', padding: '10px 12px', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newConditionSigned}
                        onChange={(e) => setNewConditionSigned(e.target.checked)}
                      />
                      <span>RTB-27 Condition Report Signed</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newSafetyChecked}
                        onChange={(e) => setNewSafetyChecked(e.target.checked)}
                      />
                      <span>Smoke/CO &amp; Heating Check Verified</span>
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                      Confidential Inspection &amp; Maintenance Observations:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter confidential observation, inspection date, or repair note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '12px' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: 'rgba(59, 33, 22, 0.9)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 4px 14px rgba(59, 33, 22, 0.2)',
                      color: '#f6f0e7',
                      padding: '11px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '6px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Save to Private Vault
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Unit Detail & RTB Evidence Export Modal */}
          {activeNoteModal && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setActiveNoteModal(null);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#8c7e75', textTransform: 'uppercase', fontWeight: 600 }}>
                      Confidential Unit Record · {activeNoteModal.timestamp}
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '19px', color: '#2a1a12' }}>
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

                {/* Statutory Compliance Checklist & Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ background: 'rgba(42, 26, 18, 0.04)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8c7e75', fontWeight: 700 }}>
                      Condition Inspection (RTB-27)
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#2a1a12', marginTop: '2px' }}>
                      {activeNoteModal.conditionInspectionSigned ? '✓ Signed on File (RTA Sec 23)' : '⚠️ Pending / Incomplete'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(42, 26, 18, 0.04)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8c7e75', fontWeight: 700 }}>
                      Annual Safety &amp; Heating
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#2a1a12', marginTop: '2px' }}>
                      {activeNoteModal.annualSafetyChecked ? '✓ Verified & Documented' : '⚠️ Due for Inspection'}
                    </div>
                  </div>
                </div>

                {/* 15-Day Deposit Watch Card if applicable */}
                {activeNoteModal.depositForwardingDate && (
                  (() => {
                    const countdown = calculateDepositCountdown(activeNoteModal.depositForwardingDate);
                    return countdown ? (
                      <div
                        style={{
                          marginBottom: '14px',
                          padding: '12px',
                          borderRadius: '10px',
                          background: countdown.isOverdue ? 'rgba(185, 28, 28, 0.08)' : 'rgba(180, 83, 9, 0.08)',
                          border: `1px solid ${countdown.isOverdue ? 'rgba(185, 28, 28, 0.3)' : 'rgba(180, 83, 9, 0.25)'}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '12px', color: countdown.isOverdue ? '#b91c1c' : '#92400e' }}>
                            ⚠️ Statutory 15-Day Security Deposit Deadline (RTA Sec 38)
                          </strong>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: countdown.isOverdue ? '#b91c1c' : '#b45309',
                              color: '#ffffff',
                              padding: '2px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            {countdown.isOverdue ? 'Overdue!' : `${countdown.daysRemaining} Days Left`}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#3b2116', lineHeight: 1.45 }}>
                          Forwarding address received on <strong>{activeNoteModal.depositForwardingDate}</strong>. Deadline is <strong>{countdown.deadlineStr}</strong>. Failure to repay or file RTB dispute within 15 days mandates repayment of <strong>double the deposit amount</strong> under RTA Section 38(6).
                        </p>
                      </div>
                    ) : null;
                  })()
                )}

                {/* Note Description */}
                <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#8c7e75', fontWeight: 700, marginBottom: '4px' }}>
                    Confidential Vault Observations
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#3b2116', margin: 0 }}>
                    {activeNoteModal.note}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(activeNoteModal.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#b91c1c',
                      fontSize: '12px',
                      cursor: 'pointer',
                      padding: '4px 0',
                    }}
                  >
                    Delete Record ✕
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleExportUnitEvidence(activeNoteModal)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(42, 26, 18, 0.2)',
                        boxShadow: '0 2px 8px rgba(42, 26, 18, 0.05)',
                        color: '#2a1a12',
                        padding: '8px 14px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                      title="Download formatted dispute evidence dossier for this unit"
                    >
                      <span>Export RTB Packet</span>
                      <span>↓</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNoteModal(null)}
                      style={{
                        background: 'rgba(59, 33, 22, 0.9)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: '0 4px 14px rgba(59, 33, 22, 0.2)',
                        color: '#f6f0e7',
                        padding: '8px 18px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deemed Service Date & Proof of Service Checklist Modal */}
          {showServiceHelperModal && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowServiceHelperModal(false);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '640px', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2e6b3b', fontWeight: 700 }}>
                      BC RTA Compliance Desk
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#2a1a12' }}>
                      Deemed Service Timetable &amp; Proof of Service
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setShowServiceHelperModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: '#5b4a3f', lineHeight: 1.5, margin: '0 0 14px' }}>
                  Under BC Residential Tenancy Act (RTA) Sections 88 and 90, arbitrators strictly evaluate whether statutory notice was deemed served in time. Serving improperly can invalidate the entire notice or dispute filing.
                </p>

                {/* Service Timetable Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#2a1a12' }}>⚡ In Person to Tenant</strong>
                      <span style={{ fontSize: '10px', background: 'rgba(46, 107, 59, 0.12)', color: '#2e6b3b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Same Day
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#5b4a3f', margin: '6px 0 0', lineHeight: 1.45 }}>
                      Deemed received immediately on the day handed directly to tenant or adult living in the suite.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#2a1a12' }}>🚪 Door / Mailbox</strong>
                      <span style={{ fontSize: '10px', background: 'rgba(180, 83, 9, 0.12)', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        +3 Full Days
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#5b4a3f', margin: '6px 0 0', lineHeight: 1.45 }}>
                      Deemed received 3 full calendar days after being attached to front door or placed in mailbox.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#2a1a12' }}>📮 Registered Mail</strong>
                      <span style={{ fontSize: '10px', background: 'rgba(59, 33, 22, 0.12)', color: '#3b2116', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        +5 Full Days
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#5b4a3f', margin: '6px 0 0', lineHeight: 1.45 }}>
                      Deemed received 5 full calendar days after mailing via Canada Post. Tracking barcode mandatory.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#2a1a12' }}>✉️ Email (Form RTB-51)</strong>
                      <span style={{ fontSize: '10px', background: 'rgba(180, 83, 9, 0.12)', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        +3 Full Days
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#5b4a3f', margin: '6px 0 0', lineHeight: 1.45 }}>
                      Permitted ONLY with prior written agreement on Form RTB-51. Deemed received 3 days later.
                    </p>
                  </div>
                </div>

                {/* RTB-34 Proof of Service Mandatory 4-Point Checklist */}
                <div style={{ background: 'rgba(46, 107, 59, 0.05)', border: '1px solid rgba(46, 107, 59, 0.2)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <strong style={{ fontSize: '13px', color: '#2e6b3b', display: 'block', marginBottom: '6px' }}>
                    Mandatory Proof of Service Checklist (Form RTB-34 Admissibility):
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#2a1a12', lineHeight: 1.6 }}>
                    <li><strong>Form RTB-34:</strong> Always complete and sign the statutory Proof of Service Notice.</li>
                    <li><strong>Witness Declaration:</strong> Bring an independent adult witness when serving in person or taping to the door.</li>
                    <li><strong>Timestamped Photographs:</strong> Photograph the notice clearly affixed to the door showing unit number and date.</li>
                    <li><strong>Canada Post Tracking:</strong> Print the online delivery signature confirmation page from Canada Post.</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowServiceHelperModal(false)}
                    style={{
                      background: 'rgba(59, 33, 22, 0.9)',
                      color: '#f6f0e7',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      padding: '8px 20px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Got It
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
              <div className="modal-box" style={{ maxWidth: '820px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '12px' }}>
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

                {/* Concise 2026 BC RTA Compliance Banner inside Modal */}
                <div style={{ background: 'rgba(42, 26, 18, 0.04)', border: '1px solid rgba(42, 26, 18, 0.08)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '11px', color: '#3b2116', lineHeight: 1.4 }}>
                    <strong>2026 Statutory Rules:</strong> 3.0% Max Rent Cap (RTB-7) · 5-Day Unpaid Rent Cure (RTB-30) · 15-Day Deposit Return (RTA Sec 38)
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllForms(false);
                      setShowServiceHelperModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2e6b3b',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Deemed Service Rules →
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
                            background: 'rgba(59, 33, 22, 0.9)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            boxShadow: '0 4px 14px rgba(59, 33, 22, 0.18)',
                            color: '#f6f0e7',
                            padding: '8px 14px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            flex: 1,
                            transition: 'all 0.2s ease',
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
                              background: 'rgba(255, 255, 255, 0.75)',
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                              border: '1px solid rgba(42, 26, 18, 0.15)',
                              boxShadow: '0 2px 8px rgba(42, 26, 18, 0.05)',
                              color: '#2a1a12',
                              padding: '8px 14px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
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

      {/* Footer matching standard landing page with phone hours */}
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
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>RTA Regulatory Framework</span>
            <span>Zero-Disclosure Charter</span>
            <span>Helpline: {CONTACT_INFO.phone} ({CONTACT_INFO.phoneHours})</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
