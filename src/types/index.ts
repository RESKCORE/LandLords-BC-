export interface HardshipStory {
  id: string;
  caseNumber: string;
  title: string;
  shortDesc: string;
  detail: string;
  body: string;
  image: string;
}

export interface PricingPlan {
  id: string;
  badge: string;
  name: string;
  price: string;
  period: string;
  tag?: string;
  description: string;
  features: string[];
  metaLabel: string;
  metaValue: string;
  ctaText: string;
  featured?: boolean;
}

export type ModalType =
  | 'story'
  | 'story-submit'
  | 'membership'
  | 'resources'
  | 'events-news'
  | 'member-dashboard'
  | 'policy'
  | null;

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  storyId?: string;
  planChoice?: string;
  policyId?: string;
  resourceId?: string;
  initialTab?: string;
}
