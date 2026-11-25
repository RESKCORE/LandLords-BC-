import { PricingPlan } from '../types';

export interface StripePricingPlan extends PricingPlan {
  paymentLink?: string;
}

export const PRICING_PLANS: StripePricingPlan[] = [
  {
    id: 'individual',
    badge: 'Individual plan',
    name: 'Self-Managing Owner',
    price: '$290 CAD',
    period: '/ month',
    description: 'For individual BC landlords who personally own and manage suites, condos, or homes. Billed monthly.',
    paymentLink: 'https://buy.stripe.com/test_14A00i5i41XN05x3RQgw000',
    features: [
      'Full BC RTA guides & condition inspection workflows',
      'Direct links to official unedited RTB statutory forms',
      'Private documentation vault (staff cannot browse cases)',
      'Access to moderated peer community upon rollout',
      'Strict privacy · No tenant names or street address required',
    ],
    metaLabel: 'Billing Cycle',
    metaValue: 'Monthly CAD Recurring',
    ctaText: 'Choose Individual Plan',
  },
  {
    id: 'property-manager',
    badge: 'Property manager',
    tag: 'Professional Tier',
    name: 'Licensed & Portfolio Manager',
    price: '$590 CAD',
    period: '/ year',
    description: 'For licensed professionals and managers administering rental property portfolios for others. Billed annually.',
    paymentLink: 'https://buy.stripe.com/test_8x28wOfWI7i74lN3RQgw001',
    features: [
      'Everything in Individual Owner Plan included',
      'Dedicated Professional Community space for industry managers',
      'Multi-portfolio private documentation capabilities',
      'Aggregated advocacy reporting to inform provincial RTB submissions',
      'Briefings on municipal bylaws beyond the provincial RTA',
    ],
    metaLabel: 'Billing Cycle',
    metaValue: 'Annual CAD Recurring',
    ctaText: 'Join Property Manager Plan →',
    featured: true,
  },
  {
    id: 'custom',
    badge: 'Custom portfolio',
    name: 'Multi-Unit & Strata Estates',
    price: '$999 CAD',
    period: '/ year',
    description: 'Tailored regulatory support for 6+ units, commercial-residential mixed use, or family trusts. Billed annually.',
    features: [
      'Multi-property private documentation structure',
      'Dedicated tenancy process and RTB dispute liaison',
      'Municipal bylaws & secondary suite compliance review',
      'Direct private line to executive tenancy advisors',
    ],
    metaLabel: 'Billing Cycle',
    metaValue: 'Annual CAD Recurring (6+ Units)',
    ctaText: 'Choose Custom Portfolio Plan',
  },
];
