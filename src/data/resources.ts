export interface ResourceGuide {
  id: string;
  title: string;
  category: string;
  updatedDate: string;
  access: 'public' | 'members';
  readTime: string;
  summary: string;
  citations: string[];
  content: string[];
}

export const RESOURCE_GUIDES: ResourceGuide[] = [
  {
    id: 'security-deposits',
    title: 'Security & Pet Damage Deposits in BC',
    category: 'Tenancy Rules',
    updatedDate: '1 September 2026',
    access: 'public',
    readTime: '6 min read',
    summary:
      'Statutory limits on deposit collection, interest calculations, holding rules, and the strict 15-day move-out return deadline under RTA Section 38.',
    citations: ['BC RTA Section 19', 'BC RTA Section 38', 'RTB Policy Guideline 17'],
    content: [
      'Under the British Columbia Residential Tenancy Act (RTA), Section 19 strictly limits security deposits to a maximum of one-half of one month’s rent payable under the tenancy agreement.',
      'If pets are allowed, a landlord may also collect a pet damage deposit of up to one-half of one month’s rent, regardless of the number of pets.',
      'A landlord cannot collect a deposit after the tenancy agreement has been entered into, nor can they increase the deposit amount when rent increases.',
      'At move-out, the landlord has exactly 15 days from the later of: (a) the date the tenancy ends, or (b) the date the landlord receives the tenant’s written forwarding address, to either return the full deposit with statutory interest, or file an Application for Dispute Resolution with the RTB.',
      'Failing to meet the 15-day statutory window without a signed agreement from the tenant forfeits the landlord’s right to claim against the deposit and may result in an order to pay double the deposit amount back to the tenant.',
    ],
  },
  {
    id: 'serving-notice',
    title: 'Serving a Lawful Notice to End Tenancy',
    category: 'Dispute & Notices',
    updatedDate: '18 August 2026',
    access: 'public',
    readTime: '8 min read',
    summary:
      'General service considerations under RTA Section 88, approved methods of delivery, deemed receipt calculation rules, and why unedited official RTB forms are mandatory.',
    citations: ['BC RTA Section 46', 'BC RTA Section 88', 'BC RTA Section 90'],
    content: [
      'Serving notice is one of the most critical legal procedures for a BC rental property owner. An invalid method of service or an incorrectly calculated deemed-receipt date can invalidate an entire eviction filing at dispute resolution.',
      'Under RTA Section 88, allowable service methods include: in-person delivery to the tenant or an adult residing with them, posting securely to the door, placing in the mailbox, sending via registered mail, or sending by email only if the tenant has provided written consent for electronic service.',
      'Deemed receipt periods under Section 90: Notices posted to the door or left in a mailbox are deemed received 3 days later. Notices sent by registered mail are deemed received 5 days after mailing. The effective date of the notice must factor in these additional days.',
      'Crucially, landlords must always use the official, unedited government form (such as RTB-30 for 10-Day Unpaid Rent). Handwritten notes, text messages, or third-party restyled notices are legally void at the Residential Tenancy Branch.',
    ],
  },
  {
    id: 'condition-inspection',
    title: 'Condition Inspection Reports (Move-In & Move-Out)',
    category: 'Property Records',
    updatedDate: '4 August 2026',
    access: 'members',
    readTime: '7 min read',
    summary:
      'A practical sequence for move-in and move-out documentation, the mandatory two-opportunity rule (RTB-22), and preserving deposit claims.',
    citations: ['BC RTA Section 23', 'BC RTA Section 35', 'BC RTA Section 36'],
    content: [
      'Conducting move-in and move-out condition inspections using the official RTB-27 report is not optional—it is a statutory prerequisite for a landlord to claim against a security deposit for property damage.',
      'The landlord must offer the tenant at least two opportunities to complete the inspection: the first being standard scheduling, and the second being a formal Notice of Final Opportunity to Schedule a Condition Inspection (Form RTB-22) in writing.',
      'If the landlord fails to offer these opportunities or fails to complete and provide a copy of the report, the landlord’s right to claim against the deposit for damage is extinguished under RTA Section 24 and Section 36.',
      'Photographs and video evidence should be dated, indexed by room, and cross-referenced with line items in the inspection report to ensure complete admissibility in RTB dispute resolution.',
    ],
  },
  {
    id: 'official-forms-guide',
    title: 'Finding and Using Official RTB Forms Correctly',
    category: 'Government Resources',
    updatedDate: '22 July 2026',
    access: 'public',
    readTime: '5 min read',
    summary:
      'Why Landlords BC never alters official statutory forms, where to obtain verified government templates, and how to verify version codes.',
    citations: ['BC Residential Tenancy Branch Policy Guideline 1', 'BC Laws RTA'],
    content: [
      'The Residential Tenancy Branch periodically updates forms to reflect legislative amendments passed by the provincial government.',
      'Landlords BC explicitly maintains a strict editorial standard: we link directly to unedited, official government PDFs rather than re-branding or altering form templates as our own.',
      'Using altered or outdated forms risks summary dismissal of dispute applications by RTB adjudicators. Always verify that the form version code located in the bottom-left corner matches the latest release on the official BC government portal.',
      'Members have access to guidance annotations explaining how to complete each section of official forms without making procedural errors.',
    ],
  },
];
