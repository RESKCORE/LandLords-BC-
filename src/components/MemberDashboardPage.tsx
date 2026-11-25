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

  // Card Mini Screen Modal state
  const [activeCardModal, setActiveCardModal] = useState<'passport' | 'forms' | 'billing' | 'vault' | 'calculator' | null>(null);
  const [formsSearchQuery, setFormsSearchQuery] = useState('');

  // Service Helper modal state
  const [showServiceHelperModal, setShowServiceHelperModal] = useState(false);
  const [activeAdvisoryTopic, setActiveAdvisoryTopic] = useState<string>('unpaid_rent');

  // Billing Portal & CRA Tax Receipt state
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // Rent Calculator state
  const [rentInput, setRentInput] = useState<number>(2200);
  const [serviceMethod, setServiceMethod] = useState<'person' | 'door' | 'mail'>('door');
  const [calcLastIncrease, setCalcLastIncrease] = useState<string>('2025-01-01');
  const [copiedRent, setCopiedRent] = useState(false);
  const [copiedRentSchedule, setCopiedRentSchedule] = useState(false);

  // Computed plan pricing & CRA classification
  const isPM =
    membershipPlan.toLowerCase().includes('property') ||
    membershipPlan.toLowerCase().includes('590') ||
    membershipPlan.toLowerCase() === 'property-manager';
  const subtotal = isPM ? 590.0 : 290.0;
  const planTitle = isPM
    ? 'Property Manager Membership'
    : 'Individual Landlord Membership';
  const invoiceNumber = `LBC-INV-${memberId.replace('BC-MEM-', '')}-2026`;

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

    // Keydown listener to close modals with Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCardModal(null);
        setIsAddingNote(false);
        setActiveNoteModal(null);
        setShowServiceHelperModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const getRentScheduleText = () => {
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

    return `========================================================================
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
  };

  const handleCopyRentCalc = () => {
    const text = getRentScheduleText();
    navigator.clipboard.writeText(text);
    setCopiedRent(true);
    setTimeout(() => setCopiedRent(false), 3500);
  };

  const handleDownloadRentSchedule = () => {
    const text = getRentScheduleText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RTB-7-Rent-Increase-Notice-Schedule-${memberId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // Launch Stripe Customer Billing Portal
  const handleOpenStripePortal = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          returnUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'Stripe portal is currently in configuration mode.');
      }
    } catch (err: any) {
      console.warn('Customer portal redirect notice:', err.message);
      setPortalError(
        'Stripe Customer Portal features can be activated in your Stripe Dashboard under Settings > Customer Portal. In the meantime, you can download your official CRA Tax Receipt below.'
      );
    } finally {
      setPortalLoading(false);
    }
  };

  // Download itemized CRA Tax Receipt & Membership Statement
  const handleDownloadTaxReceipt = () => {
    const dateStr = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const taxYear = new Date().getFullYear();

    const receiptContent = `========================================================================
LANDLORDS BC ASSOCIATION — OFFICIAL CRA TAX RECEIPT & MEMBERSHIP INVOICE
Canadian Real Estate Rental Business Expense Documentation
Taxation Year: ${taxYear}
========================================================================

ISSUED TO MEMBER:
Registered Account: ${userEmail}
Member Full Name: ${userName}
Membership ID: ${memberId}
Jurisdiction: British Columbia, Canada

TRANSACTION SUMMARY:
Invoice / Receipt Number: LBC-INV-${memberId.replace('BC-MEM-', '')}-${taxYear}
Date Issued: ${dateStr}
Payment Processor: Stripe Payments Canada (CAD)
Transaction Status: Paid & Active (Annual Subscription)

ITEMIZED CHARGES:
------------------------------------------------------------------------
Description                                                    Amount (CAD)
------------------------------------------------------------------------
1. ${planTitle} (${taxYear})                             $${subtotal.toFixed(2)}
   - BC Residential Tenancy Act (RTA) Compliance Defense
   - Statutory Form & Evidence Access (RTB-30, RTB-27, RTB-7)
   - Priority Tenancy Advisor Line Access
   - Zero-Disclosure Private Property Documentation Vault

Subtotal:                                                      $${subtotal.toFixed(2)} CAD
GST (5.0% - Exempt/Included Non-Profit Association):           $0.00 CAD
PST (Provincial Sales Tax Exempt):                             $0.00 CAD
------------------------------------------------------------------------
TOTAL PAID:                                                    $${subtotal.toFixed(2)} CAD
------------------------------------------------------------------------

CANADA REVENUE AGENCY (CRA) TAX DEDUCTIBILITY NOTICE:
Pursuant to CRA Real Estate Rental Income Guidelines (Form T776 / Guide T4036):
- Association dues and professional legal advisory fees incurred for earning rental income are 100% tax-deductible against gross rental revenues.
- Recommended Tax Return Classification:
  * Form T776, Part 4: Line 8810 ("Legal, accounting and other professional fees")
  * or Line 8871 ("Management and administration fees")
- Retain this official receipt in your accounting tax records for a minimum of 6 years in accordance with CRA audit compliance requirements.

ISSUED BY:
Landlords BC Member Association Legal & Financial Desk
Helpline: ${CONTACT_INFO.phone} (${CONTACT_INFO.phoneHours})
Email: ${CONTACT_INFO.helpEmail}
Vancouver, British Columbia, Canada
© ${taxYear} Landlords BC Association. All rights reserved.
========================================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRA-Tax-Receipt-LandlordsBC-${memberId}-${taxYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            {/* Glass UI Button: Billing & Tax Invoices */}
            <button
              type="button"
              onClick={() => setActiveCardModal('billing')}
              style={{
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 3px 12px rgba(42, 26, 18, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                padding: '7px 14px',
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
              title="Manage Stripe Subscription & Download CRA Tax Receipts"
            >
              <span>🧾 Billing &amp; Tax Invoices</span>
            </button>

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
            <div
              className="card c-big"
              onClick={() => setActiveCardModal('passport')}
              style={{
                background: '#3b2116',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              title="Click to open Member Protection & Legal Defense Passport Mini Screen"
            >
              <img
                src="/assets/landlord/sunlit-facade.svg"
                alt="Protected BC property"
                style={{ objectFit: 'cover', opacity: 0.45 }}
              />

              {/* Mini Screen Pill Hint */}
              <span
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#f6f0e7',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.02em',
                }}
              >
                Mini Screen ↗
              </span>

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
                  <div style={{ fontSize: '11px', color: '#bbf7d0', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>●</span> Annual Billing · RTA Protection Active
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCardModal('billing');
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.16)',
                        border: '1px solid rgba(255, 255, 255, 0.28)',
                        borderRadius: '999px',
                        padding: '3px 8px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        marginTop: '2px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span>Invoices &amp; Portal ↗</span>
                    </button>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadToolkit();
                  }}
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
            <div
              className="card c-pad"
              onClick={() => setActiveCardModal('forms')}
              style={{
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              title="Click to open Official RTB Statutory Gateway Mini Screen"
            >
              {/* Mini Screen Pill Hint */}
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 5,
                  background: 'rgba(42, 26, 18, 0.06)',
                  border: '1px solid rgba(42, 26, 18, 0.12)',
                  color: '#5b4a3f',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                Mini Screen ↗
              </span>

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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFormDocument(FORMS_CATALOGUE[1]);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFormDocument(FORMS_CATALOGUE[2]);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFormDocument(FORMS_CATALOGUE[4]);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFormDocument(FORMS_CATALOGUE[5] || FORMS_CATALOGUE[3]);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardModal('forms');
                    }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowServiceHelperModal(true);
                      }}
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

            {/* Card 3: Membership Billing & CRA Tax Invoices (Replaces former radial gauge) */}
            <div
              className="card c-pad"
              id="billing-card"
              onClick={() => setActiveCardModal('billing')}
              style={{
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              title="Click to open Membership Billing & CRA Tax Invoices Mini Screen"
            >
              {/* Header Badges: CRA Citation & Mini Screen cue */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    background: 'rgba(46, 107, 59, 0.12)',
                    border: '1px solid rgba(46, 107, 59, 0.28)',
                    color: '#1e542c',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    fontSize: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '7px' }}>●</span> CRA Form T776 Line 8810
                </span>
                <span
                  style={{
                    background: 'rgba(42, 26, 18, 0.06)',
                    border: '1px solid rgba(42, 26, 18, 0.12)',
                    color: '#5b4a3f',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  Mini Screen ↗
                </span>
              </div>

              {/* Itemized Billing Box on Card */}
              <div
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.72)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  border: '1px solid rgba(42, 26, 18, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}
              >
                {/* Invoice Ref & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(42, 26, 18, 0.06)', paddingBottom: '5px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b2116' }}>
                    {invoiceNumber}
                  </span>
                  <span style={{ fontSize: '10px', color: '#2e6b3b', fontWeight: 700 }}>
                    ✓ Paid &amp; Active
                  </span>
                </div>

                {/* Member Identity Details */}
                <div style={{ fontSize: '10.5px', color: '#5b4a3f', lineHeight: 1.35 }}>
                  <div><strong>Account:</strong> {userEmail}</div>
                  <div><strong>Member ID:</strong> {memberId} · {planTitle}</div>
                </div>

                {/* Line Items Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: '#5b4a3f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Annual Membership Dues</span>
                    <strong style={{ color: '#2a1a12' }}>${subtotal.toFixed(2)} CAD</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c7e75', fontSize: '10px' }}>
                    <span>GST (5% Exempt Non-Profit)</span>
                    <span>$0.00 CAD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c7e75', fontSize: '10px' }}>
                    <span>PST (Provincial Sales Tax Exempt)</span>
                    <span>$0.00 CAD</span>
                  </div>
                </div>

                {/* Total Paid Row */}
                <div
                  style={{
                    borderTop: '1px dashed rgba(42, 26, 18, 0.15)',
                    paddingTop: '5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#2a1a12' }}>Total Paid (Annual):</span>
                  <strong style={{ fontSize: '14px', color: '#2a1a12', fontWeight: 800 }}>
                    ${subtotal.toFixed(2)} CAD
                  </strong>
                </div>

                {/* In-Card Action Buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenStripePortal();
                    }}
                    disabled={portalLoading}
                    style={{
                      flex: 1,
                      background: 'rgba(59, 33, 22, 0.88)',
                      backdropFilter: 'blur(10px)',
                      color: '#f6f0e7',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '999px',
                      padding: '5px 8px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      cursor: portalLoading ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{portalLoading ? 'Connecting...' : 'Stripe Portal'}</span>
                    <span>↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadTaxReceipt();
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      color: '#2a1a12',
                      border: '1px solid rgba(42, 26, 18, 0.15)',
                      borderRadius: '999px',
                      padding: '5px 8px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>Tax Receipt</span>
                    <span>↓</span>
                  </button>
                </div>
              </div>

              {/* Card Footer Text */}
              <div className="txt" style={{ marginTop: '10px' }}>
                <h4>Membership Billing &amp; CRA Invoices</h4>
                <p>
                  100% tax-deductible rental business expense under CRA Form T776 Line 8810 / Line 8871. Click card to inspect full tax dossier &amp; payment ledger.
                </p>
              </div>
            </div>

            {/* Card 4: Private Property Vault & Unit Ledger (Bottom-Middle Interactive Rows) */}
            <div
              className="card c-pad"
              onClick={() => setActiveCardModal('vault')}
              style={{
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              title="Click to open Private Property Vault & Unit Ledger Mini Screen"
            >
              {/* Mini Screen Pill Hint */}
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 5,
                  background: 'rgba(42, 26, 18, 0.06)',
                  border: '1px solid rgba(42, 26, 18, 0.12)',
                  color: '#5b4a3f',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                Mini Screen ↗
              </span>

              <div className="rows">
                {notes.slice(0, 3).map((note, idx) => (
                  <div
                    key={note.id}
                    className="row"
                    style={{ ['--i' as string]: idx, opacity: 1, transform: 'none' }}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNoteModal(note);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingNote(true);
                    }}
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
            <div
              className="card c-pad"
              onClick={() => setActiveCardModal('calculator')}
              style={{
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              title="Click to open 2026 Statutory Rent Increase Engine Mini Screen"
            >
              {/* Mini Screen Pill Hint */}
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 5,
                  background: 'rgba(42, 26, 18, 0.06)',
                  border: '1px solid rgba(42, 26, 18, 0.12)',
                  color: '#5b4a3f',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                Mini Screen ↗
              </span>

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
                    onClick={(e) => e.stopPropagation()}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyRentCalc();
                    }}
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
                      onClick={(e) => e.stopPropagation()}
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

          {/* MINI SCREEN 1: Member Protection & Legal Defense Passport */}
          {activeCardModal === 'passport' && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setActiveCardModal(null);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '680px', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2e6b3b', fontWeight: 700 }}>
                      ● Active RTA Coverage · Zero-Disclosure Verified
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#2a1a12' }}>
                      Member Protection &amp; Legal Defense Passport
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setActiveCardModal(null)}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: '#5b4a3f', lineHeight: 1.55, margin: '0 0 16px' }}>
                  Welcome back, <strong>{userName}</strong>. As an active member of Landlords BC (<strong>{memberId}</strong>), your residential rental units are protected under our comprehensive statutory defense framework, priority helpline access, and dispute evidence standards.
                </p>

                {/* Member Identity & Plan Card */}
                <div style={{ background: '#3b2116', color: '#ffffff', borderRadius: '14px', padding: '18px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(59, 33, 22, 0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#bbf7d0', fontWeight: 700 }}>
                        Member Association ID: {memberId} ✓
                      </div>
                      <div style={{ fontSize: '17px', fontWeight: 700, marginTop: '2px', color: '#f6f0e7' }}>
                        {userName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '2px' }}>
                        {userEmail}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: 'rgba(46, 107, 59, 0.5)', border: '1px solid rgba(74, 222, 128, 0.6)', color: '#bbf7d0', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                        ● RTA Defense Active
                      </span>
                      <div style={{ fontSize: '12px', color: '#f6f0e7', marginTop: '6px', fontWeight: 600 }}>
                        {planTitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', flexWrap: 'wrap', gap: '8px' }}>
                    <span>Jurisdiction: <strong>British Columbia (RTA SBC 2002 c. 78)</strong></span>
                    <span>Security: <strong>Client-Sealed Device Vault</strong></span>
                    <span>CRA Status: <strong>Form T776 Line 8810 Deductible</strong></span>
                  </div>
                </div>

                {/* The 4 Statutory Defense Pillars */}
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '13px', color: '#2a1a12', display: 'block', marginBottom: '8px' }}>
                    The 4 Pillars of BC Landlord Statutory Defense:
                  </strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '10px', padding: '12px' }}>
                      <strong style={{ fontSize: '12px', color: '#2a1a12', display: 'block' }}>
                        1. RTA Section 5 Non-Contracting Out
                      </strong>
                      <p style={{ fontSize: '11px', color: '#5b4a3f', margin: '4px 0 0', lineHeight: 1.45 }}>
                        Guarantees tenancy agreements comply strictly with statutory protections; prevents landlord liability from unenforceable illegal lease clauses.
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '10px', padding: '12px' }}>
                      <strong style={{ fontSize: '12px', color: '#2a1a12', display: 'block' }}>
                        2. Expedited Notice Defense (RTB-30 / RTB-33)
                      </strong>
                      <p style={{ fontSize: '11px', color: '#5b4a3f', margin: '4px 0 0', lineHeight: 1.45 }}>
                        Pre-vetted 10-day unpaid rent and 1-month cause notice packages verified against common RTB arbitrator dismissal pitfalls.
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '10px', padding: '12px' }}>
                      <strong style={{ fontSize: '12px', color: '#2a1a12', display: 'block' }}>
                        3. Condition Inspection Shield (RTB-27)
                      </strong>
                      <p style={{ fontSize: '11px', color: '#5b4a3f', margin: '4px 0 0', lineHeight: 1.45 }}>
                        Mandatory move-in &amp; move-out condition reporting (RTA Sections 23 &amp; 35) preserving your right to claim against damage deposits.
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '10px', padding: '12px' }}>
                      <strong style={{ fontSize: '12px', color: '#2a1a12', display: 'block' }}>
                        4. 2026 Rent Regulation Engine (RTB-7)
                      </strong>
                      <p style={{ fontSize: '11px', color: '#5b4a3f', margin: '4px 0 0', lineHeight: 1.45 }}>
                        Precise 3.0% maximum allowable annual rent cap execution with RTA Section 42 3-full-calendar-months deemed notice calculation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Priority Advisor Line Banner */}
                <div style={{ background: 'rgba(46, 107, 59, 0.08)', border: '1px solid rgba(46, 107, 59, 0.25)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#2e6b3b', fontWeight: 700 }}>
                        Direct Member Hotline
                      </span>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e542c', marginTop: '2px' }}>
                        📞 {CONTACT_INFO.phone}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5b4a3f', marginTop: '2px' }}>
                        Operating Hours: {CONTACT_INFO.phoneHours} · Mention Member PIN: <strong>{memberId}</strong>
                      </div>
                    </div>
                    <a
                      href={CONTACT_INFO.phoneHref}
                      style={{
                        background: '#2e6b3b',
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      Call Priority Desk
                    </a>
                  </div>
                </div>

                {/* Primary Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleDownloadToolkit}
                    style={{
                      background: 'rgba(59, 33, 22, 0.9)',
                      backdropFilter: 'blur(12px)',
                      color: '#f6f0e7',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 4px 14px rgba(59, 33, 22, 0.2)',
                      padding: '10px 20px',
                      borderRadius: '999px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Download Complete Legal Defense Kit</span>
                    <span>↓</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCardModal(null)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid rgba(42, 26, 18, 0.2)',
                      padding: '10px 20px',
                      borderRadius: '999px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#2a1a12',
                      cursor: 'pointer',
                    }}
                  >
                    Close Passport
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MINI SCREEN 2: Official RTB Statutory Gateway & Forms Repository */}
          {activeCardModal === 'forms' && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setActiveCardModal(null);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '840px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2e6b3b', fontWeight: 700 }}>
                      Official RTB Statutory Repository
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#2a1a12' }}>
                      Official Forms &amp; Practical Templates
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setActiveCardModal(null)}
                  >
                    ✕
                  </button>
                </div>

                {/* Search Bar & Deemed Service Rules Link */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search forms (e.g. RTB-30, RTB-27, RTB-7, notice, deposit)..."
                      value={formsSearchQuery}
                      onChange={(e) => setFormsSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(42, 26, 18, 0.2)',
                        fontSize: '12.5px',
                        background: '#ffffff',
                        color: '#2a1a12',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowServiceHelperModal(true)}
                    style={{
                      background: 'rgba(46, 107, 59, 0.1)',
                      border: '1px solid rgba(46, 107, 59, 0.25)',
                      color: '#2e6b3b',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ⚖️ Deemed Service Rules &amp; Proof Checklist →
                  </button>
                </div>

                {/* Form Cards Grid */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', paddingRight: '4px' }}>
                  {FORMS_CATALOGUE.filter((f) => {
                    if (!formsSearchQuery.trim()) return true;
                    const q = formsSearchQuery.toLowerCase();
                    return (
                      f.code.toLowerCase().includes(q) ||
                      f.title.toLowerCase().includes(q) ||
                      f.description.toLowerCase().includes(q) ||
                      f.badge.toLowerCase().includes(q)
                    );
                  }).map((form) => (
                    <div
                      key={form.id}
                      style={{
                        border: '1px solid rgba(42, 26, 18, 0.1)',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: '#ffffff',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#3b2116' }}>{form.code}</span>
                          <span style={{ fontSize: '10px', background: 'rgba(46, 107, 59, 0.1)', color: '#2e6b3b', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                            {form.badge}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 4px', color: '#2a1a12' }}>{form.title}</h4>
                        <p style={{ fontSize: '11.5px', color: '#5b4a3f', margin: '0 0 10px', lineHeight: 1.45 }}>{form.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadFormDocument(form)}
                          style={{
                            background: 'rgba(59, 33, 22, 0.9)',
                            backdropFilter: 'blur(12px)',
                            color: '#f6f0e7',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            padding: '7px 12px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
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
                              border: '1px solid rgba(42, 26, 18, 0.15)',
                              color: '#2a1a12',
                              padding: '7px 12px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
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

          {/* MINI SCREEN 3: Membership Billing & CRA Tax Invoices */}
          {activeCardModal === 'billing' && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setActiveCardModal(null);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '660px', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2e6b3b', fontWeight: 700 }}>
                      CRA Tax-Deductible Business Expense · T776 Line 8810
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#2a1a12' }}>
                      Membership Billing &amp; CRA Tax Invoices
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setActiveCardModal(null)}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: '#5b4a3f', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Under Canada Revenue Agency (CRA) guidelines for real estate rentals (Form T776 / Guide T4036), landlord association membership dues and legal defense fees are <strong>100% tax-deductible</strong> against your gross rental revenue.
                </p>

                {/* Complete Itemized Statement & Invoice */}
                <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.12)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(42, 26, 18, 0.08)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8c7e75', fontWeight: 700 }}>
                        Official Invoice Ref
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#3b2116', marginTop: '2px' }}>
                        {invoiceNumber}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#5b4a3f', marginTop: '2px' }}>
                        Member: <strong>{userEmail}</strong> ({memberId})
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: 'rgba(46, 107, 59, 0.12)', border: '1px solid rgba(46, 107, 59, 0.3)', color: '#2e6b3b', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                        ✓ Paid &amp; Active
                      </span>
                      <div style={{ fontSize: '11px', color: '#8c7e75', marginTop: '4px' }}>
                        Processed via Stripe Canada (CAD)
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#8c7e75', fontWeight: 700, marginBottom: '6px' }}>
                      Itemized Annual Subscription Charges:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(42, 26, 18, 0.04)' }}>
                        <span>1. {planTitle} (2026 Annual Access)</span>
                        <strong style={{ color: '#2a1a12' }}>${subtotal.toFixed(2)} CAD</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c7e75', fontSize: '11px', paddingLeft: '12px' }}>
                        <span>• BC RTA Statutory Defense &amp; Form Dossiers</span>
                        <span>Included</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c7e75', fontSize: '11px', paddingLeft: '12px' }}>
                        <span>• Priority Tenancy Advisor Line Access</span>
                        <span>Included</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c7e75', fontSize: '11px', paddingLeft: '12px' }}>
                        <span>• Zero-Disclosure Private Property Vault</span>
                        <span>Included</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c7e75', fontSize: '11px', paddingTop: '4px' }}>
                        <span>GST (5.0% - Non-Profit Association Exempt)</span>
                        <span>$0.00 CAD</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8c7e75', fontSize: '11px' }}>
                        <span>PST (Provincial Sales Tax Exempt)</span>
                        <span>$0.00 CAD</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '2px dashed rgba(42, 26, 18, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#2a1a12' }}>Total Paid:</span>
                      <strong style={{ fontSize: '18px', color: '#2a1a12', fontWeight: 800 }}>
                        ${subtotal.toFixed(2)} CAD
                      </strong>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(42, 26, 18, 0.04)', borderRadius: '8px', padding: '10px 12px', fontSize: '11px', color: '#5b4a3f', lineHeight: 1.45 }}>
                    <strong>CRA Tax Filing Citation:</strong> Claim this payment on CRA Form T776 (Statement of Real Estate Rentals) under <strong>Line 8810 ("Legal, accounting and other professional fees")</strong> or <strong>Line 8871 ("Management and administration fees")</strong>.
                  </div>
                </div>

                {/* Error Notice if any */}
                {portalError && (
                  <div style={{ background: 'rgba(180, 83, 9, 0.08)', border: '1px solid rgba(180, 83, 9, 0.25)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '11.5px', color: '#92400e', lineHeight: 1.45 }}>
                    <strong>Stripe Portal Notice:</strong> {portalError}
                  </div>
                )}

                {/* Primary Actions */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <button
                    type="button"
                    onClick={handleOpenStripePortal}
                    disabled={portalLoading}
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      background: 'rgba(59, 33, 22, 0.9)',
                      backdropFilter: 'blur(12px)',
                      color: '#f6f0e7',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 4px 14px rgba(59, 33, 22, 0.2)',
                      padding: '12px 18px',
                      borderRadius: '999px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: portalLoading ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{portalLoading ? 'Connecting to Stripe...' : 'Manage in Stripe Portal'}</span>
                    <span>↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTaxReceipt}
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid rgba(42, 26, 18, 0.2)',
                      boxShadow: '0 3px 12px rgba(42, 26, 18, 0.05)',
                      color: '#2a1a12',
                      padding: '12px 18px',
                      borderRadius: '999px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>Download CRA Tax Receipt</span>
                    <span>↓</span>
                  </button>
                </div>

                <div style={{ background: 'rgba(42, 26, 18, 0.04)', borderRadius: '8px', padding: '10px 12px', fontSize: '11px', color: '#5b4a3f', lineHeight: 1.5 }}>
                  💡 <strong>Audit Compliance Tip:</strong> Retain your downloaded CRA Tax Receipt for a minimum of 6 taxation years pursuant to CRA compliance guidelines. Subscriptions renew annually to guarantee continuous statutory defense coverage.
                </div>
              </div>
            </div>
          )}

          {/* MINI SCREEN 4: Private Property Vault & Complete Unit Ledger */}
          {activeCardModal === 'vault' && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setActiveCardModal(null);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '780px', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2e6b3b', fontWeight: 700 }}>
                      Zero-Disclosure Property Vault · Encrypted on Device
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#2a1a12' }}>
                      Private Property Vault &amp; Complete Unit Ledger
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setActiveCardModal(null)}
                  >
                    ✕
                  </button>
                </div>

                {/* Ledger Statistics & Add Record Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.1)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '18px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#8c7e75', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Units Logged</span>
                      <strong style={{ fontSize: '15px', color: '#2a1a12' }}>{notes.length}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#8c7e75', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>RTB-27 Signed</span>
                      <strong style={{ fontSize: '15px', color: '#2e6b3b' }}>{notes.filter((n) => n.conditionInspectionSigned).length}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#8c7e75', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Deposit Watch</span>
                      <strong style={{ fontSize: '15px', color: '#92400e' }}>{notes.filter((n) => n.depositStatus === 'forwarding_received').length}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    style={{
                      background: 'rgba(59, 33, 22, 0.9)',
                      color: '#f6f0e7',
                      padding: '8px 16px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    + Add Unit Record
                  </button>
                </div>

                {/* All Unit Records Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {notes.map((note) => {
                    const depositCountdown = calculateDepositCountdown(note.depositForwardingDate);
                    return (
                      <div
                        key={note.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid rgba(42, 26, 18, 0.1)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <div>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: '#2a1a12' }}>{note.unit}</span>
                            {note.tenantName && (
                              <span style={{ fontSize: '12px', color: '#5b4a3f', marginLeft: '8px' }}>
                                (Tenant: {note.tenantName})
                              </span>
                            )}
                          </div>
                          {note.complianceTag && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '999px',
                                background: note.complianceTag.includes('Watch') ? 'rgba(180, 83, 9, 0.15)' : 'rgba(46, 107, 59, 0.12)',
                                color: note.complianceTag.includes('Watch') ? '#92400e' : '#2e6b3b',
                              }}
                            >
                              {note.complianceTag}
                            </span>
                          )}
                        </div>

                        {/* 15-Day Countdown Alert if active */}
                        {depositCountdown && (
                          <div
                            style={{
                              background: depositCountdown.isOverdue ? 'rgba(185, 28, 28, 0.08)' : 'rgba(180, 83, 9, 0.08)',
                              border: `1px solid ${depositCountdown.isOverdue ? 'rgba(185, 28, 28, 0.25)' : 'rgba(180, 83, 9, 0.25)'}`,
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '11px',
                              color: depositCountdown.isOverdue ? '#b91c1c' : '#92400e',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>⚠️ 15-Day Return Deadline: <strong>{depositCountdown.deadlineStr}</strong></span>
                            <strong>{depositCountdown.isOverdue ? 'OVERDUE!' : `${depositCountdown.daysRemaining} days remaining`}</strong>
                          </div>
                        )}

                        {/* Details row */}
                        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#5b4a3f', flexWrap: 'wrap' }}>
                          <span>Tenancy: <strong>{note.moveInDate || note.timestamp}</strong></span>
                          <span>Deposit: <strong>{note.depositAmount ? `$${note.depositAmount} CAD` : 'N/A'}</strong></span>
                          <span>RTB-27: <strong>{note.conditionInspectionSigned ? '✓ Signed' : '⚠️ Pending'}</strong></span>
                          <span>Safety Check: <strong>{note.annualSafetyChecked ? '✓ Verified' : 'Scheduled'}</strong></span>
                        </div>

                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#3b2116', lineHeight: 1.45, background: 'rgba(42, 26, 18, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                          {note.note}
                        </p>

                        {/* Card actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            style={{ background: 'none', border: 'none', color: '#b91c1c', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                          >
                            Delete Record ✕
                          </button>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleExportUnitEvidence(note)}
                              style={{
                                background: 'rgba(59, 33, 22, 0.88)',
                                color: '#f6f0e7',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                padding: '5px 12px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Export RTB Dossier ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveNoteModal(note)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.85)',
                                color: '#2a1a12',
                                border: '1px solid rgba(42, 26, 18, 0.15)',
                                padding: '5px 12px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              View Full Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MINI SCREEN 5: 2026 Statutory Rent Increase Engine */}
          {activeCardModal === 'calculator' && (
            <div
              className="modal-backdrop open"
              data-lenis-prevent
              role="dialog"
              onClick={(e) => {
                if (e.target === e.currentTarget) setActiveCardModal(null);
              }}
            >
              <div className="modal-box" style={{ maxWidth: '720px', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>
                <div className="modal-top" style={{ marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2e6b3b', fontWeight: 700 }}>
                      BC Residential Tenancy Act · Section 42 &amp; 43
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#2a1a12' }}>
                      2026 Statutory Rent Increase Engine
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setActiveCardModal(null)}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: '#5b4a3f', lineHeight: 1.5, margin: '0 0 16px' }}>
                  For the calendar year 2026, the maximum allowable annual rent increase in British Columbia is strictly capped at <strong>3.0%</strong>. Landlords must give tenants at least <strong>3 full rental payment months' notice</strong> on official unaltered Form RTB-7.
                </p>

                {/* Interactive Calculator Inputs */}
                <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.12)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#2a1a12', marginBottom: '4px' }}>
                        Current Monthly Rent:
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(42, 26, 18, 0.04)', borderRadius: '8px', border: '1px solid rgba(42, 26, 18, 0.15)', padding: '2px 8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#5b4a3f', marginRight: '4px' }}>$</span>
                        <input
                          type="number"
                          value={rentInput}
                          onChange={(e) => setRentInput(Math.max(0, Number(e.target.value)))}
                          style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 700, color: '#2a1a12', padding: '6px 0' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#2a1a12', marginBottom: '4px' }}>
                        Service Method (Sec 88/90):
                      </label>
                      <select
                        value={serviceMethod}
                        onChange={(e) => setServiceMethod(e.target.value as any)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(42, 26, 18, 0.15)', fontSize: '12px', fontWeight: 600, background: '#ffffff', color: '#2a1a12' }}
                      >
                        <option value="door">Door Posting (+3d deemed)</option>
                        <option value="person">In Person (Same day deemed)</option>
                        <option value="mail">Registered Mail (+5d deemed)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#2a1a12', marginBottom: '4px' }}>
                        Last Rent Increase Date:
                      </label>
                      <input
                        type="date"
                        value={calcLastIncrease}
                        onChange={(e) => setCalcLastIncrease(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(42, 26, 18, 0.15)', fontSize: '12px', background: '#ffffff', color: '#2a1a12' }}
                      />
                    </div>
                  </div>

                  {/* Calculated Results Panel */}
                  <div style={{ background: 'rgba(46, 107, 59, 0.05)', border: '1px solid rgba(46, 107, 59, 0.2)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8c7e75', fontWeight: 700, display: 'block' }}>2026 Allowable Cap</span>
                        <strong style={{ fontSize: '16px', color: '#2e6b3b' }}>3.0%</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8c7e75', fontWeight: 700, display: 'block' }}>Monthly Increase</span>
                        <strong style={{ fontSize: '16px', color: '#2a1a12' }}>+${rentIncreaseAmount.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8c7e75', fontWeight: 700, display: 'block' }}>New Lawful Rent</span>
                        <strong style={{ fontSize: '18px', color: '#3b2116', fontWeight: 800 }}>${newMaxRent.toFixed(2)}/mo</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8c7e75', fontWeight: 700, display: 'block' }}>Earliest Effective</span>
                        <strong style={{ fontSize: '14px', color: '#2a1a12' }}>{rentDates.earliestEffective.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(46, 107, 59, 0.15)', display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#3b2116', flexWrap: 'wrap', gap: '6px' }}>
                      <span>Serve by: <strong>{rentDates.latestServiceDate.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></span>
                      <span>12-Month Rule: <strong>{rentDates.compliant12Months ? '✓ Compliant' : '⚠️ Warning: Under 12 Months'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Form RTB-7 Notice Schedule Text Preview */}
                <div style={{ background: '#ffffff', border: '1px solid rgba(42, 26, 18, 0.12)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '12.5px', color: '#2a1a12' }}>
                      Official Form RTB-7 Notice Schedule:
                    </strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleCopyRentCalc}
                        style={{
                          background: copiedRent ? '#2e6b3b' : 'rgba(59, 33, 22, 0.88)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedRent ? 'Copied ✓' : 'Copy Schedule'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadRentSchedule}
                        style={{
                          background: 'rgba(255, 255, 255, 0.85)',
                          color: '#2a1a12',
                          border: '1px solid rgba(42, 26, 18, 0.2)',
                          padding: '5px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Download (.txt) ↓
                      </button>
                    </div>
                  </div>

                  <pre style={{ margin: 0, padding: '10px', background: 'rgba(42, 26, 18, 0.03)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#3b2116', whiteSpace: 'pre-wrap', maxHeight: '160px', overflowY: 'auto' }}>
                    {getRentScheduleText()}
                  </pre>
                </div>

                {/* 4 Mandatory Rules */}
                <div style={{ background: 'rgba(42, 26, 18, 0.04)', borderRadius: '10px', padding: '12px', fontSize: '11.5px', color: '#5b4a3f', lineHeight: 1.5 }}>
                  <strong>Mandatory RTB Rules (Section 42 &amp; 43):</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '18px' }}>
                    <li>Must use the official, unaltered Form RTB-7 (Notice of Rent Increase - Residential).</li>
                    <li>Notice must give at least 3 full rental payment months before the effective date.</li>
                    <li>A landlord cannot round up rent to an amount exceeding the statutory 3.0% cap.</li>
                    <li>Always retain a completed Form RTB-34 Proof of Service in your Private Property Vault.</li>
                  </ul>
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
