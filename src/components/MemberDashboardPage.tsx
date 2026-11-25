import React, { useState, useEffect } from 'react';
import { CONTACT_INFO, GOV_LINKS } from '../data/constants';
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
  const [activeTab, setActiveTab] = useState<'vault' | 'calculators' | 'forms' | 'advisory'>('vault');

  // Notes state
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [newUnit, setNewUnit] = useState('');
  const [newNote, setNewNote] = useState('');
  const [searchUnit, setSearchUnit] = useState('');
  const [downloadNotice, setDownloadNotice] = useState(false);

  // Calculators state
  const [rentInput, setRentInput] = useState<number>(2200);
  const [copiedRent, setCopiedRent] = useState(false);
  const [serviceMethod, setServiceMethod] = useState<'person' | 'door' | 'mail' | 'email'>('door');
  const [serviceDate, setServiceDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [copiedService, setCopiedService] = useState(false);

  // Evidence Namer state
  const [evidenceNumber, setEvidenceNumber] = useState('01');
  const [evidenceDocType, setEvidenceDocType] = useState('RTB30_10DayNotice');
  const [evidenceDate, setEvidenceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [copiedFileName, setCopiedFileName] = useState(false);

  // Callback form state
  const [callbackUnit, setCallbackUnit] = useState('');
  const [callbackTopic, setCallbackTopic] = useState('Notice to End Tenancy (Eviction Review)');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackNotes, setCallbackNotes] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  useEffect(() => {
    // Load member info from localStorage
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
          id: 'note-1',
          unit: 'Vancouver Suite #204',
          note: 'Move-in inspection signed with RTB-27. Security deposit $1,150 held in designated trust account. Rent paid via e-transfer on the 1st.',
          timestamp: '15 Oct 2026',
        },
        {
          id: 'note-2',
          unit: 'Burnaby Duplex Unit B',
          note: 'Annual smoke detector and heating inspection completed. Water heater checked with no leaks reported.',
          timestamp: '02 Nov 2026',
        },
      ];
      setNotes(initialNotes);
      localStorage.setItem('landlords_member_notes', JSON.stringify(initialNotes));
    }
  }, []);

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
    // If it's a pure external website link like government portal or BC Laws
    if (form.id === 'gov-portal' || form.id === 'gov-bclaws') {
      window.open(form.link, '_blank');
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let specificContent = '';

    switch (form.id) {
      case 'rtb-1':
        specificContent = `RESIDENTIAL TENANCY AGREEMENT (BC RTA STANDARD CLAUSES)
Statutory Authority: BC Residential Tenancy Act [SBC 2002] c. 78, Sections 12-14

1. PARTIES:
- Landlord Legal Full Name: __________________________________________________
- Tenant(s) Full Name(s): ____________________________________________________
- Rental Unit Address: _______________________________________________________

2. TERM & TENANCY COMMENCEMENT:
- Tenancy Start Date: ________________________
- Tenancy Type: [ ] Month-to-Month Periodic Tenancy   [ ] Fixed Length (ending: __________)
- Note: Under BC law, vacate clauses in fixed-term agreements are prohibited except under Section 13.1 of the Regulations.

3. RENT & UTILITIES:
- Monthly Rent: $_________________ CAD, payable in advance on the 1st of each month.
- Payment Methods: [ ] Interac e-Transfer   [ ] Cheque   [ ] Pre-authorized debit
- Utilities Included: [ ] Heat  [ ] Water  [ ] Electricity  [ ] Sewage  [ ] Internet

4. SECURITY & PET DAMAGE DEPOSIT (RTA Section 19):
- Security Deposit: $_________________ (Maximum 50% of 1 month's rent)
- Pet Damage Deposit: $_________________ (Maximum 50% of 1 month's rent)
- Date Received: ____________________
- Trust Account Location: ____________________________________________________

5. STATUTORY MOVE-IN INSPECTION (RTA Section 23):
- Condition inspection report (Form RTB-27) must be completed on move-in day.`;
        break;

      case 'rtb-30':
        specificContent = `10-DAY NOTICE TO END TENANCY FOR UNPAID RENT OR UTILITIES
Statutory Authority: BC Residential Tenancy Act, Section 46 & Section 90

WARNING TO TENANT:
You have 5 CALENDAR DAYS after receiving this notice to:
1. Pay the overdue rent in full (which cancels this notice); OR
2. Dispute this notice by filing an application for dispute resolution at the RTB.
If you do neither, your tenancy ends 10 days after the deemed date of service, and the landlord may apply for an immediate Order of Possession.

1. NOTICE DETAILS:
- Tenant Legal Name: _________________________________________________________
- Rental Unit Address: _______________________________________________________
- Total Unpaid Rent Overdue: $_________________ CAD (Due on: __________________)
- Total Unpaid Utilities Overdue (if 30-day written demand was served): $________ CAD

2. STATUTORY DEEMED SERVICE CALCULATION (RTA Section 88 & 90):
- Method of Service:
  [ ] Handed in person to adult resident: Deemed served TODAY.
  [ ] Attached to front door or in mailbox: Deemed served 3 FULL DAYS LATER.
  [ ] Sent by registered mail / regular mail: Deemed served 5 FULL DAYS LATER.
  [ ] Emailed (with signed RTB-51 consent): Deemed served 3 FULL DAYS LATER.

- Date Notice Delivered: ____________________
- Legally Deemed Received Date: ____________________
- Earliest Legal Vacate Date (10 days after deemed receipt): ____________________`;
        break;

      case 'rtb-27':
        specificContent = `CONDITION INSPECTION REPORT PROTOCOL & CHECKLIST
Statutory Authority: BC Residential Tenancy Act, Sections 23, 24, 35, 36

CRITICAL LEGAL NOTICE FOR LANDLORD:
Under Section 24 and 36 of the RTA, if a landlord does not offer at least 2 opportunities for inspection (the second in writing using Form RTB-22) and complete this written report, the landlord's right to claim against the security or pet deposit for damage to property is EXTINGUISHED.

ROOM-BY-ROOM INSPECTION PROTOCOL:
Unit Address: ________________________________________________________________
Move-in Inspection Date: ____________________ Time: __________________
Move-out Inspection Date: ___________________ Time: __________________

Condition Key: G = Good | F = Fair | P = Poor | D = Damaged | ST = Stained

ROOM / AREA                    MOVE-IN STATUS       MOVE-OUT STATUS     COMMENTS / PHOTOS
1. Entryway / Front Door       [   ]                [   ]               __________________
2. Living Room Walls/Floors    [   ]                [   ]               __________________
3. Kitchen Appliances/Oven     [   ]                [   ]               __________________
4. Kitchen Sink & Plumbing     [   ]                [   ]               __________________
5. Smoke Detector Tested       [   ] PASS           [   ] PASS          Expiry: __________
6. Master Bedroom & Windows    [   ]                [   ]               __________________
7. Bathroom Shower/Caulking    [   ]                [   ]               __________________
8. Heating / Thermostat        [   ] PASS           [   ] PASS          __________________

SIGN-OFF & SIGNATURES:
Landlord Signature: ___________________________ Date: _______________________
Tenant Signature: _____________________________ Date: _______________________`;
        break;

      case 'rtb-7':
        specificContent = `NOTICE OF RENT INCREASE (STATUTORY FORM RTB-7 PROTOCOL)
Statutory Authority: BC Residential Tenancy Act, Part 3, Sections 41-43

STATUTORY RULES FOR BC RENT INCREASES:
1. Annual Maximum Percentage: 3.0% (for calendar year 2026).
2. Frequency: A landlord may only increase rent once every 12 months.
3. Minimum Notice Period: At least 3 full calendar rental payment months BEFORE the effective date.
   Example: If rent is due on the 1st of the month, notice served on Oct 15 cannot take effect until Feb 1.

CALCULATION WORKSHEET:
- Current Monthly Rent: $_________________ CAD
- Allowable Increase (Max 3.0%): +$_________________ CAD
- New Monthly Rent: $_________________ CAD
- Date Notice Served: _________________________
- Method of Service: [ ] In-person  [ ] Door posting (3 days)  [ ] Mail (5 days)
- Effective Date of Increase: ___________________ (Must be after 3 full rental months)`;
        break;

      case 'rtb-8':
        specificContent = `MUTUAL AGREEMENT TO END A TENANCY (FORM RTB-8 PROTOCOL)
Statutory Authority: BC Residential Tenancy Act, Section 44(1)(c)

This agreement is executed voluntarily between landlord and tenant to end the tenancy without requiring statutory notice, dispute resolution hearings, or eviction filings.

1. TENANCY PARTICULARS:
- Landlord Name: _____________________________________________________________
- Tenant Name(s): ____________________________________________________________
- Rental Unit Address: _______________________________________________________

2. MUTUAL SURRENDER TERMS:
- The landlord and tenant mutually agree that the tenancy will end on:
  Date: ________________________ Time: 1:00 PM (statutory standard)
- The tenant agrees to deliver vacant possession, remove all personal property, and return all keys/fobs to the landlord by this date and time.
- Move-out condition inspection will take place on: _____________________________

3. VOLUNTARY CONSENT:
Both parties acknowledge that they are entering this agreement freely and with full understanding of their statutory rights under the BC Residential Tenancy Act.

Landlord Signature: ___________________________ Date: _______________________
Tenant Signature: _____________________________ Date: _______________________`;
        break;

      case 'llbc-t1':
        specificContent = `MOVE-IN PRACTICAL SEQUENCE & KEY HANDOVER PROTOCOL (LLBC-T1)
Landlords BC Standard Operating Procedure

PHASE 1: PRE-OCCUPANCY SAFETY VERIFICATION
[ ] Smoke and Carbon Monoxide detectors tested and verified working (expiry date noted).
[ ] Main water shut-off valve located and demonstrated to tenant.
[ ] Electrical breaker panel identified with labeled circuits.
[ ] Water heater and plumbing inspected for zero active seepage.
[ ] Keys and access fobs tested on all exterior and suite locks.

PHASE 2: KEY HANDOVER RECEIPT
- Number of Building Access Fobs Issued: _____
- Number of Suite Keys Issued: _____
- Number of Mailbox Keys Issued: _____
- Garage / Parking Remote ID: _____

Tenant Signature Confirming Key Receipt: _____________________ Date: __________`;
        break;

      case 'llbc-t2':
        specificContent = `MAINTENANCE REQUEST & REPAIR TRACKING LOG (LLBC-T2)
Statutory Authority: BC Residential Tenancy Act, Sections 29, 32 & 33

UNIT: __________________________________ TENANT: _____________________________

DATE LOGGED: ___________________________ EMERGENCY REPAIR: [ ] YES  [ ] NO
ISSUE REPORTED:
______________________________________________________________________________
______________________________________________________________________________

NOTICE OF ENTRY (RTA Section 29):
Under Section 29, except in emergencies, landlords must provide at least 24 hours written notice before entering, stating purpose, date, and entry window between 8:00 AM and 9:00 PM.
- Notice of Entry Served Date: ________________ Time: ______________
- Service Method: [ ] Door Posting (3-day rule applies)  [ ] In Person  [ ] Email

REPAIR COMPLETION & INVOICE RECORD:
- Contractor / Vendor: _______________________________________________________
- Work Completed Date: _________________ Cost: $________________ CAD
- Tenant Sign-off / Confirmation: ____________________________________________`;
        break;

      case 'llbc-t3':
        specificContent = `ANNUAL RENT INCREASE CALCULATION & SERVICE WORKSHEET (LLBC-T3)
British Columbia Statutory Rent Formula Verification

1. ELIGIBILITY VERIFICATION:
[ ] Has it been at least 12 months since the tenancy started or since the last rent increase?
    Last Increase / Start Date: ____________________
[ ] Is the proposed increase at or below the 2026 provincial cap (3.0%)?

2. MATHEMATICAL CALCULATION:
- Current Monthly Rent: $_________________ CAD
- Provincial Allowable Rate: 3.0% (Multiply by 0.03)
- Statutory Cap Amount: $_________________ CAD (Round to nearest cent)
- Proposed New Monthly Rent: $_________________ CAD

3. 3-MONTH SERVICE TIMELINE VERIFICATION:
- Service Date: ____________________
- Service Method: ____________________
- Deemed Service Date: ____________________
- Next 3 Full Rental Payment Cycles:
  Month 1: ____________________
  Month 2: ____________________
  Month 3: ____________________
- Valid Legal Effective Date: ____________________ (Must be on or after 1st of Month 4)`;
        break;

      case 'llbc-ex1':
        specificContent = `ANNOTATED RTB DISPUTE EVIDENCE INDEX (MODEL PACKAGE LLBC-EX1)
Residential Tenancy Branch Arbitration Evidence Preparation Standard

RULES FOR SUBMITTING EVIDENCE TO THE RTB DISPUTE ACCESS SITE:
1. File naming must be strictly sequential so arbitrators can navigate easily.
2. Formats accepted: PDF, JPG, PNG, MP4, MP3.
3. Every document must have matching timestamps.

MODEL EVIDENCE PACKAGE STRUCTURE:
File 01: 01_TenancyAgreement_RTB1_Signed_2025-09-01.pdf
File 02: 02_ConditionInspectionReport_RTB27_MoveIn_2025-09-01.pdf
File 03: 03_10DayNotice_RTB30_UnpaidRent_2026-10-15.pdf
File 04: 04_ProofOfService_DoorPostingPhoto_TimeStamped_2026-10-15.jpg
File 05: 05_BankStatement_ProofOfNonPayment_2026-10-20.pdf
File 06: 06_WrittenDemandLetters_SMS_Log_2026-10-12.pdf

PRE-HEARING TIMELINES:
- Applicant evidence must be served to respondent and RTB at least 14 days before hearing.
- Respondent evidence must be served at least 7 days before hearing.`;
        break;

      case 'llbc-ex2':
        specificContent = `SAMPLE WRITTEN WARNING: REPEATED DISTURBANCE & NOISE (LLBC-EX2)
Statutory Pre-Notice Documentation under BC RTA Section 47(1)(d)

DATE: ___________________________
TO TENANT(S): ________________________________________________________________
RENTAL UNIT ADDRESS: _________________________________________________________

RE: FORMAL WRITTEN WARNING — UNREASONABLE DISTURBANCE / BREACH OF MATERIAL TERM

Dear Tenant(s),

This letter serves as formal written notice regarding documented unreasonable disturbance occurring at your rental unit in violation of Section 28 (Quiet Enjoyment) and Section 47 of the BC Residential Tenancy Act.

INCIDENT PARTICULARS:
- Date of Occurrence: ______________________ Time: __________________
- Specific Nature of Incident: ________________________________________________
______________________________________________________________________________

CORRECTIVE ACTION REQUIRED:
You are required to immediately cease the aforementioned activity and adhere to quiet hours. Failure to correct this behavior will result in the immediate issuance of an official One-Month Notice to End Tenancy for Cause (Form RTB-33) under Section 47 of the Residential Tenancy Act.

Sincerely,

Landlord Representative Signature: ___________________________________________
Landlords BC Member ID: ${memberId}`;
        break;

      default:
        specificContent = `${form.title.toUpperCase()}
Document Code: ${form.code}
Category: ${form.category}

OVERVIEW & PURPOSE:
${form.description}

STATUTORY INSTRUCTIONS & COMPLIANCE STEPS:
1. Ensure all dates are recorded in accordance with RTA Section 88 & 90 deemed service rules.
2. Retain completed copies in your Landlords BC Private Documentation Vault.
3. For disputes before the Residential Tenancy Branch, number all evidence files sequentially.`;
        break;
    }

    const documentContent = `========================================================================
LANDLORDS BC — STATUTORY FORM & COMPLIANCE DOSSIER
Document Title: ${form.title} (${form.code})
Category: ${form.category.toUpperCase()}
Active Member ID: ${memberId}
Registered Account: ${userEmail}
Jurisdiction: British Columbia, Canada (RTA SBC 2002, c. 78)
Date Generated: ${dateStr}
Zero-Disclosure Charter: Verified Confidential Association Document
========================================================================

${specificContent}

========================================================================
Landlords BC Priority Advisor Line: 1-800-555-0199
Official RTB Portal: https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies
© 2026 Landlords BC Association. All rights reserved.
========================================================================`;

    const blob = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Landlords-BC-${form.code}-${form.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Rent Increase calculations
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

  // Deemed Service Date calculations
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

  const generatedFileName = `${evidenceNumber}_${evidenceDocType}_${evidenceDate}.pdf`;
  const handleCopyFileName = () => {
    navigator.clipboard.writeText(generatedFileName);
    setCopiedFileName(true);
    setTimeout(() => setCopiedFileName(false), 3000);
  };

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCallbackSubmitted(true);
    setTimeout(() => {
      setCallbackSubmitted(false);
      setCallbackPhone('');
      setCallbackUnit('');
      setCallbackNotes('');
    }, 5000);
  };

  const filteredNotes = notes.filter((n) =>
    searchUnit ? n.unit.toLowerCase().includes(searchUnit.toLowerCase()) || n.note.toLowerCase().includes(searchUnit.toLowerCase()) : true
  );

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
          background: 'rgba(246, 240, 231, 0.88)',
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
              <span style={{ fontSize: '8px' }}>●</span> VERIFIED MEMBER
            </span>
          </div>

          {/* Navigation Pills */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(236, 227, 215, 0.7)',
              padding: '4px',
              borderRadius: '999px',
              border: '1px solid rgba(42, 26, 18, 0.08)',
              overflowX: 'auto',
              maxWidth: '100%',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              style={{
                background: activeTab === 'vault' ? '#3b2116' : 'transparent',
                color: activeTab === 'vault' ? '#f6f0e7' : '#2a1a12',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Property Vault &amp; Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calculators')}
              style={{
                background: activeTab === 'calculators' ? '#3b2116' : 'transparent',
                color: activeTab === 'calculators' ? '#f6f0e7' : '#2a1a12',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Statutory Calculators ⚡
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('forms')}
              style={{
                background: activeTab === 'forms' ? '#3b2116' : 'transparent',
                color: activeTab === 'forms' ? '#f6f0e7' : '#2a1a12',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              RTB Forms Gateway
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advisory')}
              style={{
                background: activeTab === 'advisory' ? '#3b2116' : 'transparent',
                color: activeTab === 'advisory' ? '#f6f0e7' : '#2a1a12',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Hearing Advisory
            </button>
          </nav>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                boxShadow: '0 2px 6px rgba(42, 26, 18, 0.04)',
              }}
            >
              <span>←</span>
              <span>Back to Home</span>
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
              title="Sign out of Member Portal"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '36px 0 60px' }}>
        <div className="wrap" style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Member Hero Header Card */}
          <section
            style={{
              background: 'linear-gradient(135deg, #3b2116 0%, #2a1a12 100%)',
              color: '#f6f0e7',
              borderRadius: '24px',
              padding: '32px 36px',
              marginBottom: '32px',
              boxShadow: '0 12px 36px rgba(42, 26, 18, 0.16)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '240px',
                height: '240px',
                background: 'radial-gradient(circle, rgba(246, 240, 231, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span
                    style={{
                      background: '#2e6b3b',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {memberId} ✓
                  </span>
                  <span
                    style={{
                      background: 'rgba(246, 240, 231, 0.15)',
                      color: '#f6f0e7',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    BC RTA Coverage Active
                  </span>
                </div>

                <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', margin: '4px 0 8px', color: '#f6f0e7' }}>
                  {userName}
                </h1>

                <div style={{ fontSize: '14px', color: 'rgba(246, 240, 231, 0.8)', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  <span>✉ {userEmail}</span>
                  <span>•</span>
                  <span>Plan: {membershipPlan}</span>
                  <span>•</span>
                  <span>Zero-Disclosure Protection: Enabled</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleDownloadToolkit}
                  style={{
                    background: '#f6f0e7',
                    color: '#2a1a12',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <span>Download Complete Legal Kit</span>
                  <span>↓</span>
                </button>

                <a
                  href={CONTACT_INFO.phoneHref}
                  style={{
                    background: 'rgba(246, 240, 231, 0.12)',
                    color: '#f6f0e7',
                    border: '1px solid rgba(246, 240, 231, 0.25)',
                    padding: '10px 18px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                  }}
                >
                  <span>📞 Call Priority Helpline: {CONTACT_INFO.phone}</span>
                </a>
              </div>
            </div>

            {downloadNotice && (
              <div
                style={{
                  marginTop: '16px',
                  background: 'rgba(46, 107, 59, 0.3)',
                  border: '1px solid rgba(74, 222, 128, 0.4)',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#bbf7d0',
                }}
              >
                ✓ Complete Statutory Legal Defense Kit downloaded successfully! Check your downloads folder.
              </div>
            )}
          </section>

          {/* Member Subscription Plan & Coverage Details */}
          <section
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid rgba(42, 26, 18, 0.12)',
              padding: '24px 28px',
              marginBottom: '28px',
              boxShadow: '0 4px 20px rgba(42, 26, 18, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ flex: '1 1 340px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    background: 'rgba(46, 107, 59, 0.12)',
                    color: '#2e6b3b',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  ● Active Subscription Plan
                </span>
                <span style={{ fontSize: '12px', color: '#8c7b6f' }}>
                  Annual CAD Billing · Auto-Renew Active
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#2a1a12', margin: '2px 0 6px' }}>
                {membershipPlan}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#5b4a3f', margin: 0, lineHeight: 1.5 }}>
                Full statutory coverage under the BC Residential Tenancy Act (RTA), including 1-800-555-0199 priority advisor helpline, official RTB evidence indexing, pre-formatted legal kits, and private documentation vault.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div
                style={{
                  background: 'rgba(246, 240, 231, 0.8)',
                  border: '1px solid rgba(42, 26, 18, 0.08)',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8c7b6f', fontWeight: 600 }}>
                  Billing Currency
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#2a1a12' }}>
                  CAD ($)
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(246, 240, 231, 0.8)',
                  border: '1px solid rgba(42, 26, 18, 0.08)',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8c7b6f', fontWeight: 600 }}>
                  Membership Status
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#2e6b3b' }}>
                  Verified Active ✓
                </div>
              </div>

              {onOpenMembershipModal && (
                <button
                  type="button"
                  onClick={() => onOpenMembershipModal('property-manager')}
                  style={{
                    background: 'rgba(42, 26, 18, 0.06)',
                    border: '1px solid rgba(42, 26, 18, 0.12)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#3b2116',
                    cursor: 'pointer',
                  }}
                  title="Upgrade or manage plan tier"
                >
                  Manage Tier
                </button>
              )}
            </div>
          </section>

          {/* 3 Pillar Summary Cards */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            {/* Card 1 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid rgba(42, 26, 18, 0.08)',
                borderRadius: '18px',
                padding: '22px 24px',
                boxShadow: '0 4px 16px rgba(42, 26, 18, 0.04)',
              }}
            >
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5b4a3f', fontWeight: 700, marginBottom: '6px' }}>
                Priority Member Helpline
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2a1a12', marginBottom: '6px' }}>
                {CONTACT_INFO.phone}
              </div>
              <p style={{ fontSize: '13px', color: '#5b4a3f', lineHeight: 1.5, margin: 0 }}>
                Direct, confidential telephone consultations with experienced BC tenancy specialists prior to notice delivery or RTB hearings.
              </p>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid rgba(42, 26, 18, 0.08)',
                borderRadius: '18px',
                padding: '22px 24px',
                boxShadow: '0 4px 16px rgba(42, 26, 18, 0.04)',
              }}
            >
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5b4a3f', fontWeight: 700, marginBottom: '6px' }}>
                RTB Evidence Indexing
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2a1a12', marginBottom: '6px' }}>
                Statutory Dossier Format
              </div>
              <p style={{ fontSize: '13px', color: '#5b4a3f', lineHeight: 1.5, margin: 0 }}>
                Dispute upload portals require strict sequential naming conventions. Arbitrators can dismiss unindexed or disorganized submissions.
              </p>
            </div>

            {/* Card 3 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid rgba(42, 26, 18, 0.08)',
                borderRadius: '18px',
                padding: '22px 24px',
                boxShadow: '0 4px 16px rgba(42, 26, 18, 0.04)',
              }}
            >
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2e6b3b', fontWeight: 700, marginBottom: '6px' }}>
                Zero-Disclosure Vault
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2a1a12', marginBottom: '6px' }}>
                Encrypted &amp; Non-Public
              </div>
              <p style={{ fontSize: '13px', color: '#5b4a3f', lineHeight: 1.5, margin: 0 }}>
                Your unit documentation and dispute notes are locked solely to your account. We never operate or share tenant blacklist databases.
              </p>
            </div>
          </section>

          {/* Tab 1: Private Property Ledger & Notes */}
          {activeTab === 'vault' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid rgba(42, 26, 18, 0.08)',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(42, 26, 18, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2a1a12', margin: '0 0 4px' }}>
                    Private Unit Documentation Vault
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5b4a3f', margin: 0 }}>
                    Keep time-stamped inspection records, condition notes, and repair communications for dispute defense.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Search unit or note..."
                    value={searchUnit}
                    onChange={(e) => setSearchUnit(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '999px',
                      border: '1px solid rgba(42, 26, 18, 0.15)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <span
                    style={{
                      background: 'rgba(42, 26, 18, 0.06)',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#3b2116',
                    }}
                  >
                    {notes.length} Private Records
                  </span>
                </div>
              </div>

              {/* Add Note Form */}
              <form
                onSubmit={handleAddNote}
                style={{
                  background: 'rgba(246, 240, 231, 0.5)',
                  border: '1px solid rgba(42, 26, 18, 0.08)',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Unit Identifier (e.g. Vancouver Suite #204)"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    style={{
                      flex: '1 1 240px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(42, 26, 18, 0.15)',
                      background: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Enter confidential observation, inspection date, or repair note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    style={{
                      flex: '3 1 360px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(42, 26, 18, 0.15)',
                      background: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    required
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#3b2116',
                      color: '#f6f0e7',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    SAVE NOTE +
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredNotes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#5b4a3f', fontSize: '14px' }}>
                    No notes matching your search. Add your first private unit entry above.
                  </div>
                ) : (
                  filteredNotes.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid rgba(42, 26, 18, 0.08)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '16px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: '#2a1a12' }}>
                            {item.unit}
                          </span>
                          <span style={{ fontSize: '11px', color: '#8c7e75', background: 'rgba(42, 26, 18, 0.05)', padding: '2px 8px', borderRadius: '999px' }}>
                            {item.timestamp}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#3b2116', lineHeight: 1.5 }}>
                          {item.note}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#b91c1c',
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Delete note"
                      >
                        Delete ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Statutory Calculators Suite */}
          {activeTab === 'calculators' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* Rent Increase Calculator */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid rgba(42, 26, 18, 0.08)',
                  padding: '28px',
                  boxShadow: '0 4px 20px rgba(42, 26, 18, 0.04)',
                }}
              >
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b2116', fontWeight: 700, marginBottom: '6px' }}>
                  BC RTA SECTION 43 FORMULA
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#2a1a12', margin: '0 0 14px' }}>
                  2026 Allowable Rent Increase Calculator
                </h3>
                <p style={{ fontSize: '13px', color: '#5b4a3f', lineHeight: 1.5, marginBottom: '20px' }}>
                  The 2026 British Columbia statutory cap is fixed at <strong>3.0%</strong>. Landlords must give at least 3 full rental payment months notice using official Form RTB-7.
                </p>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2a1a12', marginBottom: '6px' }}>
                    Current Monthly Rent ($ CAD):
                  </label>
                  <input
                    type="number"
                    value={rentInput}
                    onChange={(e) => setRentInput(Math.max(0, Number(e.target.value)))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(42, 26, 18, 0.15)',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  />
                </div>

                <div
                  style={{
                    background: 'rgba(246, 240, 231, 0.65)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: '#5b4a3f' }}>Statutory Provincial Cap:</span>
                    <strong style={{ color: '#2e6b3b' }}>3.0%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: '#5b4a3f' }}>Maximum Increase Allowed:</span>
                    <strong style={{ color: '#2a1a12' }}>+${rentIncreaseAmount.toFixed(2)} CAD / month</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', paddingTop: '8px', borderTop: '1px solid rgba(42, 26, 18, 0.08)' }}>
                    <span style={{ fontWeight: 700, color: '#2a1a12' }}>New Maximum Rent:</span>
                    <strong style={{ fontWeight: 800, color: '#3b2116' }}>${newMaxRent.toFixed(2)} CAD / month</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyRentCalc}
                  style={{
                    width: '100%',
                    background: '#3b2116',
                    color: '#f6f0e7',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedRent ? '✓ Rent Calculation Copied!' : 'Copy Form RTB-7 Notice Text'}
                </button>
              </div>

              {/* Deemed Service Date Calculator */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid rgba(42, 26, 18, 0.08)',
                  padding: '28px',
                  boxShadow: '0 4px 20px rgba(42, 26, 18, 0.04)',
                }}
              >
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b2116', fontWeight: 700, marginBottom: '6px' }}>
                  BC RTA SECTION 88 &amp; 90
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#2a1a12', margin: '0 0 14px' }}>
                  Deemed Service Date &amp; Notice Timeline
                </h3>
                <p style={{ fontSize: '13px', color: '#5b4a3f', lineHeight: 1.5, marginBottom: '20px' }}>
                  Under BC tenancy laws, legal notices do not count as served immediately unless handed in person. Incorrect service date invalidates eviction notices.
                </p>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2a1a12', marginBottom: '6px' }}>
                    Notice Delivery Date:
                  </label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(42, 26, 18, 0.15)',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2a1a12', marginBottom: '6px' }}>
                    Service Method Used:
                  </label>
                  <select
                    value={serviceMethod}
                    onChange={(e) => setServiceMethod(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(42, 26, 18, 0.15)',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  >
                    <option value="door">Attached to Door or In Mailbox (Deemed 3 days later)</option>
                    <option value="mail">Registered or Regular Mail (Deemed 5 days later)</option>
                    <option value="email">Email with Written Consent (Deemed 3 days later)</option>
                    <option value="person">In-Person to Tenant (Immediate, same day)</option>
                  </select>
                </div>

                <div
                  style={{
                    background: 'rgba(246, 240, 231, 0.65)',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '18px',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5b4a3f' }}>Legally Deemed Received:</span>
                    <strong style={{ color: '#2a1a12' }}>{formatDate(deemedDate)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5b4a3f' }}>Tenant 5-Day Dispute Deadline:</span>
                    <strong style={{ color: '#b91c1c' }}>{formatDate(disputeDeadlineDate)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(42, 26, 18, 0.08)' }}>
                    <span style={{ color: '#5b4a3f' }}>10-Day Notice (RTB-30) Earliest Vacate:</span>
                    <strong style={{ color: '#2e6b3b' }}>{formatDate(endTenancyDate)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyServiceCalc}
                  style={{
                    width: '100%',
                    background: '#3b2116',
                    color: '#f6f0e7',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedService ? '✓ Service Affidavit Copied!' : 'Copy Service Timeline Record'}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Official RTB Forms Gateway */}
          {activeTab === 'forms' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid rgba(42, 26, 18, 0.08)',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(42, 26, 18, 0.04)',
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2a1a12', margin: '0 0 6px' }}>
                  Official BC Residential Tenancy Branch (RTB) Forms Gateway
                </h2>
                <p style={{ fontSize: '13px', color: '#5b4a3f', margin: 0 }}>
                  Statutory forms required under the Residential Tenancy Act. Arbitrators enforce strict compliance with official templates.
                </p>
              </div>

              {/* Evidence Namer Utility */}
              <div
                style={{
                  background: 'rgba(246, 240, 231, 0.75)',
                  border: '1px solid rgba(42, 26, 18, 0.1)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  marginBottom: '28px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#2e6b3b', marginBottom: '4px' }}>
                  RTB Dispute Evidence Formatter
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#2a1a12', marginBottom: '8px' }}>
                  Generate Admissible Evidence Filename for Upload Portal:
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Num (e.g. 01)"
                    value={evidenceNumber}
                    onChange={(e) => setEvidenceNumber(e.target.value)}
                    style={{ width: '80px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}
                  />
                  <select
                    value={evidenceDocType}
                    onChange={(e) => setEvidenceDocType(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}
                  >
                    <option value="RTB30_10DayNotice">RTB-30 10-Day Notice</option>
                    <option value="RTB27_InspectionReport">RTB-27 Condition Inspection</option>
                    <option value="RTB7_NoticeOfRentIncrease">RTB-7 Rent Increase Notice</option>
                    <option value="ProofOfServiceAffidavit">Proof of Service Photo</option>
                    <option value="BankStatement_UnpaidRent">Bank Record of Unpaid Rent</option>
                    <option value="RepairCommunicationLog">Repair Communication Log</option>
                  </select>
                  <input
                    type="date"
                    value={evidenceDate}
                    onChange={(e) => setEvidenceDate(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}
                  />
                  <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: '1px solid #e0e0e0', flex: 1 }}>
                      {generatedFileName}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyFileName}
                      style={{
                        background: '#3b2116',
                        color: '#f6f0e7',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {copiedFileName ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Forms Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {FORMS_CATALOGUE.map((form) => (
                  <div
                    key={form.id}
                    style={{
                      border: '1px solid rgba(42, 26, 18, 0.08)',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px', color: '#3b2116' }}>
                          {form.code}
                        </span>
                        <span style={{ fontSize: '11px', background: 'rgba(46, 107, 59, 0.1)', color: '#2e6b3b', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                          {form.badge}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#2a1a12', margin: '0 0 6px' }}>
                        {form.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#5b4a3f', lineHeight: 1.5, margin: '0 0 14px' }}>
                        {form.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => handleDownloadFormDocument(form)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: '#3b2116',
                          color: '#f6f0e7',
                          border: 'none',
                          padding: '9px 16px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          flex: '1 1 140px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          transition: 'opacity 0.15s ease',
                        }}
                      >
                        <span>{form.category === 'third-party' ? 'Open Portal' : 'Download Document'}</span>
                        <span>{form.category === 'third-party' ? '↗' : '↓'}</span>
                      </button>

                      {form.isExternal && form.link && form.link.startsWith('http') && form.category !== 'third-party' && (
                        <a
                          href={form.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            background: 'rgba(42, 26, 18, 0.05)',
                            border: '1px solid rgba(42, 26, 18, 0.12)',
                            color: '#2a1a12',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                          }}
                          title="Open official government PDF directly"
                        >
                          <span>Official PDF</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Hearing Advisory & Confidential Callback */}
          {activeTab === 'advisory' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid rgba(42, 26, 18, 0.08)',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(42, 26, 18, 0.04)',
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2a1a12', margin: '0 0 6px' }}>
                  RTB Dispute Hearing Preparation &amp; Private Callback
                </h2>
                <p style={{ fontSize: '13px', color: '#5b4a3f', margin: 0 }}>
                  Request confidential guidance from a senior BC tenancy coordinator before serving critical notices or participating in an RTB dispute hearing.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
                {/* Callback Form */}
                <form
                  onSubmit={handleCallbackSubmit}
                  style={{
                    background: 'rgba(246, 240, 231, 0.5)',
                    border: '1px solid rgba(42, 26, 18, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#2a1a12', fontWeight: 700 }}>
                    Schedule Private Advisor Callback
                  </h4>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2a1a12', marginBottom: '4px' }}>
                      Advisory Topic:
                    </label>
                    <select
                      value={callbackTopic}
                      onChange={(e) => setCallbackTopic(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px', background: '#fff' }}
                    >
                      <option value="Notice to End Tenancy (Eviction Review)">Notice to End Tenancy (Eviction Review)</option>
                      <option value="RTB Dispute Resolution Hearing Prep">RTB Dispute Resolution Hearing Prep</option>
                      <option value="Unpaid Rent or Late Payment Protocol">Unpaid Rent or Late Payment Protocol</option>
                      <option value="Condition Inspection & Security Deposit Claim">Condition Inspection &amp; Security Deposit Claim</option>
                      <option value="Landlord Use of Property (2-Month Notice)">Landlord Use of Property (2-Month Notice)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2a1a12', marginBottom: '4px' }}>
                      Unit / Property Identifier:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vancouver Suite #204"
                      value={callbackUnit}
                      onChange={(e) => setCallbackUnit(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2a1a12', marginBottom: '4px' }}>
                      Direct Phone Number:
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. (604) 555-0199"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#2a1a12', marginBottom: '4px' }}>
                      Brief Summary of Situation:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Brief details regarding notice dates or dispute issues..."
                      value={callbackNotes}
                      onChange={(e) => setCallbackNotes(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: '#3b2116',
                      color: '#f6f0e7',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    SUBMIT PRIORITY CALLBACK REQUEST
                  </button>

                  {callbackSubmitted && (
                    <div
                      style={{
                        background: 'rgba(46, 107, 59, 0.15)',
                        border: '1px solid #2e6b3b',
                        color: '#1e4626',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    >
                      ✓ Request received. A BC Landlord advisor will contact you within 1 business day.
                    </div>
                  )}
                </form>

                {/* Pre-Hearing Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#2a1a12', fontWeight: 700 }}>
                    Arbitration Hearing Preparation Checklist
                  </h4>
                  <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '16px', fontSize: '13px', lineHeight: 1.6, color: '#3b2116' }}>
                    <p style={{ margin: '0 0 10px' }}>
                      <strong>1. Strict Timelines:</strong> Evidence must be submitted to the RTB and served to the tenant at least 14 days before the dispute hearing (or 7 days for respondent evidence).
                    </p>
                    <p style={{ margin: '0 0 10px' }}>
                      <strong>2. Proof of Service:</strong> Always retain registered mail tracking numbers and signed door posting affidavits (Form RTB-34).
                    </p>
                    <p style={{ margin: '0 0 10px' }}>
                      <strong>3. Digital Audio / Video:</strong> Video evidence must be accompanied by a written one-page summary specifying timestamps of critical events.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>4. Mandatory Condition Reports:</strong> Without an RTB-27 move-in report signed by both parties, security deposit claims are extinguished.
                    </p>
                  </div>
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
            maxWidth: '1180px',
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
