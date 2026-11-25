export interface FormItem {
  id: string;
  code: string;
  title: string;
  category: 'government' | 'template' | 'example' | 'third-party';
  description: string;
  badge: string;
  source: string;
  link: string;
  isExternal?: boolean;
}

export const FORMS_CATALOGUE: FormItem[] = [
  // 1. Official Government Forms
  {
    id: 'rtb-1',
    code: 'RTB-1',
    title: 'Residential Tenancy Agreement',
    category: 'government',
    description:
      'The standard official agreement establishing rights, responsibilities, rent terms, and standard tenancy terms required by BC law.',
    badge: 'Official RTB Statutory Form',
    source: 'BC Residential Tenancy Branch',
    link: 'https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb1.pdf',
    isExternal: true,
  },
  {
    id: 'rtb-30',
    code: 'RTB-30',
    title: '10-Day Notice to End Tenancy for Unpaid Rent or Utilities',
    category: 'government',
    description:
      'Official statutory notice served when rent is overdue. Sets the 5-day cure window or dispute filing deadline under RTA Section 46.',
    badge: 'Official RTB Statutory Form',
    source: 'BC Residential Tenancy Branch',
    link: 'https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb30.pdf',
    isExternal: true,
  },
  {
    id: 'rtb-27',
    code: 'RTB-27',
    title: 'Condition Inspection Report',
    category: 'government',
    description:
      'Mandatory document for move-in and move-out inspections required to claim against security or pet damage deposits under RTA Sections 23 & 35.',
    badge: 'Official RTB Statutory Form',
    source: 'BC Residential Tenancy Branch',
    link: 'https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb27.pdf',
    isExternal: true,
  },
  {
    id: 'rtb-8',
    code: 'RTB-8',
    title: 'Mutual Agreement to End a Tenancy',
    category: 'government',
    description:
      'Used when landlord and tenant mutually agree to end a tenancy on a specified date without requiring statutory notice.',
    badge: 'Official RTB Statutory Form',
    source: 'BC Residential Tenancy Branch',
    link: 'https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb8.pdf',
    isExternal: true,
  },
  {
    id: 'rtb-7',
    code: 'RTB-7',
    title: 'Notice of Rent Increase (Residential)',
    category: 'government',
    description:
      'Mandatory 3 full months notice required to institute allowable annual allowable rent increases under RTA Section 42.',
    badge: 'Official RTB Statutory Form',
    source: 'BC Residential Tenancy Branch',
    link: 'https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb7.pdf',
    isExternal: true,
  },
  {
    id: 'rtb-33',
    code: 'RTB-33',
    title: 'One Month Notice to End Tenancy for Cause',
    category: 'government',
    description:
      'Official statutory notice served under RTA Section 47 for material breach, repeated late rent payments, significant disturbance, or extraordinary damage.',
    badge: 'Official RTB Statutory Form',
    source: 'BC Residential Tenancy Branch',
    link: 'https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/forms/rtb33.pdf',
    isExternal: true,
  },

  // 2. Organization Templates
  {
    id: 'llbc-t1',
    code: 'LLBC-T1',
    title: 'Move-In Practical Sequence & Key Handover Protocol',
    category: 'template',
    description:
      'Landlords BC proprietary move-in sequence checklist with formal key receipt sign-off and emergency utility shutoff briefing.',
    badge: 'Organization Template',
    source: 'Landlords BC Member Library',
    link: '#member-download',
  },
  {
    id: 'llbc-t2',
    code: 'LLBC-T2',
    title: 'Maintenance Request & Repair Tracking Log',
    category: 'template',
    description:
      'Structured record log for documenting tenant repair requests, access notifications (RTA Section 29), and vendor receipts.',
    badge: 'Organization Template',
    source: 'Landlords BC Member Library',
    link: '#member-download',
  },
  {
    id: 'llbc-t3',
    code: 'LLBC-T3',
    title: 'Annual Rent Increase Calculation & Service Worksheet',
    category: 'template',
    description:
      'Calculation worksheet ensuring rent increase percentage complies with provincial caps and respects 3-calendar-month service timelines.',
    badge: 'Organization Template',
    source: 'Landlords BC Member Library',
    link: '#member-download',
  },

  // 3. Educational Examples
  {
    id: 'llbc-ex1',
    code: 'LLBC-EX1',
    title: 'Annotated RTB Dispute Evidence Index (Model Package)',
    category: 'example',
    description:
      'Step-by-step example illustrating how to index, timestamp, and label photos, text logs, and bank statements for the RTB dispute upload portal.',
    badge: 'Educational Example',
    source: 'Landlords BC Legal Desk',
    link: '#member-download',
  },
  {
    id: 'llbc-ex2',
    code: 'LLBC-EX2',
    title: 'Sample Written Warning: Repeated Disturbance & Noise',
    category: 'example',
    description:
      'Educational sample notice demonstrating lawful non-adversarial wording required to document repeated breach before serving notice for cause.',
    badge: 'Educational Example',
    source: 'Landlords BC Legal Desk',
    link: '#member-download',
  },

  // 4. Third-Party & Official Government Portals
  {
    id: 'gov-portal',
    code: 'GOV-RTB',
    title: 'BC Residential Tenancy Branch Online Dispute Portal',
    category: 'third-party',
    description:
      'Direct link to the official provincial dispute resolution filing portal and evidence submission system.',
    badge: 'Official Government Portal',
    source: 'Government of British Columbia',
    link: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/dispute-resolution',
    isExternal: true,
  },
  {
    id: 'gov-bclaws',
    code: 'GOV-LAW',
    title: 'Residential Tenancy Act [SBC 2002] c. 78 (BC Laws)',
    category: 'third-party',
    description:
      'The complete, codified provincial statutory text governing all residential landlord and tenant relationships across British Columbia.',
    badge: 'Statutory Legislation',
    source: 'BC Laws Official Repository',
    link: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02078_01',
    isExternal: true,
  },
];
