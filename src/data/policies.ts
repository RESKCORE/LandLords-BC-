export interface PolicyDoc {
  id: string;
  title: string;
  lastUpdated: string;
  sections: { heading: string; text: string }[];
}

export const POLICIES: Record<string, PolicyDoc> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy & Zero-Disclosure Charter',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '1. Zero-Disclosure Philosophy',
        text: 'Landlords BC operates under a strict Zero-Disclosure Charter. We do not maintain, publish, or sell public tenant registries, “bad tenant” blacklists, or member directories. We strictly respect the privacy of both rental housing providers and tenants in accordance with British Columbia’s Personal Information Protection Act (PIPA).',
      },
      {
        heading: '2. What Information We Collect',
        text: 'When joining the association, we collect member contact details (email and optional phone number) and billing details processed directly by Stripe. We never request or store tenant personal names, credit card numbers on our local servers, or property civic addresses.',
      },
      {
        heading: '3. Tenancy Experience Submissions',
        text: 'Any advocacy report or experience submitted through our private intake desk is encrypted at rest. Identifiers are redacted before advocacy review, and submissions are analyzed only in the aggregate to identify provincial regulatory trends for policy representations to the RTB.',
      },
      {
        heading: '4. Third-Party Disclosures',
        text: 'We do not sell, rent, or trade member information to third-party advertisers. Information is only transferred to payment processors (Stripe) and transactional notification relays (SMTP) strictly to provide account access.',
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms of Service & Educational Disclaimer',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '1. Educational Information, Not Legal Advice',
        text: 'The materials, guides, workflows, and consultation summaries provided by Landlords BC are for general educational and informational purposes only. Landlords BC is not a law firm, and our staff are not acting as your legal counsel. Tenancy laws and RTB dispute rules change periodically; property owners are encouraged to review the current Residential Tenancy Act or consult a qualified legal professional for case-specific matters.',
      },
      {
        heading: '2. Membership Terms & Billing',
        text: 'Membership plans (Individual and Property Manager) are billed annually in Canadian Dollars (CAD) through Stripe. Subscriptions renew annually until canceled. Members may cancel renewal at any time through their member portal or by contacting member services.',
      },
      {
        heading: '3. Permitted Use of Forms and Templates',
        text: 'Members are granted a non-exclusive license to use Landlords BC organization templates and educational guides for managing their own rental units. Official statutory government forms (RTBs) remain the copyright of the Province of British Columbia and are provided for unedited statutory compliance.',
      },
    ],
  },
  community: {
    id: 'community',
    title: 'Community Guidelines & Peer Standards',
    lastUpdated: 'September 2026',
    sections: [
      {
        heading: '1. Professional & Non-Adversarial Focus',
        text: 'The Landlords BC peer community is a respectful, professional space for BC rental property owners to learn provincial procedures, share practical property management insights, and support each other through procedural challenges.',
      },
      {
        heading: '2. Prohibited Content: No Doxxing or Tenant Shaming',
        text: 'Posting tenant names, phone numbers, social media profiles, or identifying unit photographs is strictly prohibited. Any post engaging in doxxing, harassment, discrimination under the BC Human Rights Code, or attempting to compile a tenant blacklist will result in immediate termination of membership without refund.',
      },
      {
        heading: '3. Moderation & Server-Enforced Privacy',
        text: 'Community discussions are private to verified members and are never indexed by search engines. While members may display an alias to peers, staff retain cryptographic audit trails to ensure adherence to safety rules.',
      },
    ],
  },
  retention: {
    id: 'retention',
    title: 'Data Retention & Erasure Policy',
    lastUpdated: 'September 2026',
    sections: [
      {
        heading: '1. Retention Periods',
        text: 'Account information is retained for the active duration of your membership plus statutory tax audit periods (7 years for transaction records). Personal notes in your private vault remain stored until manually deleted by the member.',
      },
      {
        heading: '2. Right to Erasure & Deletion',
        text: 'Members may request the complete deletion of their account records, private notes, and submitted advocacy reports at any time by emailing privacy@landlordsbc.org. Requests are processed within 30 business days in compliance with BC PIPA.',
      },
      {
        heading: '3. Server-Sealed Storage',
        text: 'All case archives and private notes are stored with server-sealed encryption in isolated server data directories. Backups are rotated and purged on a 90-day rolling cycle.',
      },
    ],
  },
  accessibility: {
    id: 'accessibility',
    title: 'Accessibility Statement',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Standards Commitment',
        text: 'Landlords BC is committed to making digital tenancy resources accessible to all British Columbians, including individuals with visual, auditory, motor, or cognitive disabilities. We aim to conform with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.',
      },
      {
        heading: '2. Accessible Features',
        text: 'Our platform supports prefers-reduced-motion settings, high-contrast readable typography (Inter Tight), scalable viewports, ARIA dialog landmarks, full keyboard navigational support (Escape to close modals, tab-indexed navigation), and screen-reader descriptive alternative text on all diagrams.',
      },
      {
        heading: '3. Feedback & Accommodation',
        text: 'If you encounter an accessibility barrier or require an alternate format for any guide or form, please contact our support team at support@landlordsbc.org or call 1-800-555-0199 for direct assistance.',
      },
    ],
  },
};
