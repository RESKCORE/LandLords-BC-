export interface EventItem {
  id: string;
  title: string;
  schedule: string;
  format: string;
  summary: string;
  topics: string[];
  status: 'active-calendar' | 'members-only';
}

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  body: string[];
}

export const WORKSHOP_PROGRAMS: EventItem[] = [
  {
    id: 'prog-orientation',
    title: 'BC Tenancy Fundamentals & RTA Compliance',
    schedule: 'Quarterly Provincial Cohort Sessions',
    format: 'Live Online Briefing & Interactive Q&A',
    summary:
      'Structured legal orientation covering lawful tenancy agreement drafting (RTB-1), condition inspection compliance (RTB-27), and provincial limits on deposits.',
    topics: [
      'Standard residential lease terms under RTA Section 13',
      'Move-in & move-out condition inspection sequence',
      'Permitted vs void lease clauses under provincial law',
      'Direct member Q&A with experienced tenancy advisors',
    ],
    status: 'active-calendar',
  },
  {
    id: 'prog-records',
    title: 'Evidentiary Standards for RTB Dispute Hearings',
    schedule: 'Bi-Monthly Legal Masterclass',
    format: 'Online & Vancouver In-Person Sessions',
    summary:
      'Admissible evidence preparation for the Residential Tenancy Branch online dispute portal. How to format communication logs, time-stamp inspection photos, and avoid summary technical dismissals.',
    topics: [
      'Digital evidence indexing for the RTB portal',
      'RTA Section 88 valid service proof & Section 90 deemed receipt',
      'Serving unedited Section 46 10-day notices for unpaid rent',
      'Arbitrator evidentiary standards review',
    ],
    status: 'active-calendar',
  },
  {
    id: 'prog-bylaws',
    title: 'Municipal Bylaws & Secondary Suite Licensing',
    schedule: 'Regional Briefing Series (Lower Mainland & Vancouver Island)',
    format: 'Executive Advisory Session',
    summary:
      'Navigating local municipal bylaws alongside the provincial RTA: secondary suite occupancy permits, short-term rental restrictions, and strata council rules.',
    topics: [
      'Municipal secondary suite occupancy permits',
      'Provincial Short-Term Rental Accommodations Act compliance',
      'Strata bylaws vs provincial RTA rights',
      'Insurance considerations for rental suites',
    ],
    status: 'members-only',
  },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-sources',
    title: 'How We Attribute Sources on Every Guide',
    date: '12 September 2026',
    category: 'Editorial Standards',
    summary:
      'Our commitment to grounding every resource in cited provincial statutes, unedited RTB policy guidelines, and dated legislative reviews.',
    body: [
      'From our inception, Landlords BC has operated under a strict editorial standard: reliable landlord education must be verifiable, dated, and directly grounded in the governing statutes of British Columbia.',
      'Every guide, workflow, and checklist published in our Knowledge Centre contains formal citations to the specific sections of the Residential Tenancy Act [SBC 2002] c. 78 and official RTB Policy Guidelines.',
      'We publish the exact review and update dates on all materials. When provincial regulations, allowable rent increase percentages, or notice forms are amended by government, our editorial team updates the corresponding guides immediately.',
      'We do not publish unsubstantiated rumors, unverified tenancy statistics, or unofficial legal commentary. Members deserve absolute confidence that their procedures comply strictly with BC law.',
    ],
  },
  {
    id: 'news-membership',
    title: 'Membership Plans at Launch: Individual and Property Manager',
    date: '5 September 2026',
    category: 'Organization Update',
    summary:
      'Announcing transparent annual CAD pricing, zero-disclosure privacy commitments, and tailored tiers for independent homeowners and portfolio professionals.',
    body: [
      'We are proud to introduce our membership plans, billed transparently in Canadian Dollars without hidden charges: the Individual Plan ($290 CAD/month), the Property Manager Plan ($590 CAD/year), and the Custom Portfolio Plan ($999 CAD/year).',
      'The Individual Plan is engineered specifically for homeowners who personally manage secondary suites, condos, or single-family rental properties. It provides full access to our RTA guides, official form links, condition inspection workflows, and private documentation vaults.',
      'The Property Manager Plan adds multi-portfolio record structures, a dedicated professional community forum, and aggregated advocacy reporting to support provincial submissions to the Residential Tenancy Branch.',
      'In alignment with our privacy charter, account enrollment does not require tenant names, tenant phone numbers, or your property civic address. All payment processing is secured through Stripe with instant email confirmation.',
    ],
  },
  {
    id: 'news-blacklist',
    title: 'Why This Platform Will Not Host a Tenant Blacklist',
    date: '28 August 2026',
    category: 'Privacy & Charter Commitments',
    summary:
      'A clear articulation of our non-adversarial philosophy, legal obligations under BC PIPA, and why public bad-tenant databases harm housing stability.',
    body: [
      'Landlords BC was founded on a professional, lawful, and non-adversarial approach to rental housing. We explicitly state our core principle: Landlords BC does not publish tenant names, and we will never operate a “bad tenant” list or public blacklist.',
      'Public tenant databases violate British Columbia’s Personal Information Protection Act (PIPA), create immense legal liability for property owners who submit unadjudicated claims, and are frequently weaponized through erroneous or retaliatory reports.',
      'Private documentation on our platform is strictly for the member’s own records and dispute resolution preparation. Staff cannot browse members’ private cases, and information submitted through our advocacy desk is anonymized and aggregated exclusively to identify province-wide regulatory patterns.',
      'True landlord protection comes from adherence to statutory procedures, disciplined record-keeping, and fair, transparent tenancy management.',
    ],
  },
];
