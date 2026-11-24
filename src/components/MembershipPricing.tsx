import React from 'react';
import { PRICING_PLANS } from '../data/pricing';

interface MembershipPricingProps {
  onSelectPlan: (planId: string) => void;
}

export const MembershipPricing: React.FC<MembershipPricingProps> = ({ onSelectPlan }) => {
  return (
    <section className="s-prod" id="pricing">
      <div className="wrap">
        <div className="prod-shell">
          <div className="sec-head">
            <span className="eyebrow rv">BC Association Membership &amp; Resources</span>
            <h2 className="h2 split" data-split>
              Select Your Level of
              <br />
              <span className="lt">BC Tenancy Support</span>
            </h2>
            <p
              className="lead rv"
              style={{ ['--d' as string]: 3 }}
            >
              Choose an Individual Owner, Property Manager, or Custom Portfolio membership to unlock our cited RTA guide library, private records vault, and advisor helpline.
            </p>
          </div>

          <div className="stage" id="stage">
            {PRICING_PLANS.map((plan, idx) => (
              <div
                key={plan.id}
                className={`g-card ${plan.featured ? 'featured' : ''} rv`}
                style={{ ['--d' as string]: idx + 1 }}
              >
                <div>
                  <div className="lbl-row">
                    <span className="lbl">{plan.badge}</span>
                    {plan.tag && <span className="plan-tag">{plan.tag}</span>}
                  </div>
                  <h5>{plan.name}</h5>
                  <div className="price-line">
                    <strong>{plan.price}</strong>
                    <span>{plan.period}</span>
                  </div>
                  <em>{plan.description}</em>

                  <ul className="checks">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx}>
                        <i>
                          <svg
                            viewBox="0 0 10 10"
                            fill="none"
                            stroke="#3b2116"
                            strokeWidth="1.8"
                          >
                            <path
                              d="M2 5.2L4.2 7.4L8 2.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="plan-meta">
                    <span>{plan.metaLabel}</span>
                    <span>{plan.metaValue}</span>
                  </div>
                  {plan.featured ? (
                    <button
                      type="button"
                      className="btn-white"
                      onClick={() => onSelectPlan(plan.id)}
                    >
                      {plan.ctaText}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="view"
                      onClick={() => onSelectPlan(plan.id)}
                    >
                      <span>{plan.ctaText}</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

