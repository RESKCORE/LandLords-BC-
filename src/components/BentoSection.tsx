import React from 'react';
import { BackgroundVideo } from './common/BackgroundVideo';
import { VIDEOS, POSTERS } from '../data/constants';
import { HARDSHIP_STORIES } from '../data/stories';

interface BentoSectionProps {
  onOpenStory: (storyId: string) => void;
  onSubmitStory: () => void;
  onOpenResources?: () => void;
}

export const BentoSection: React.FC<BentoSectionProps> = ({
  onOpenStory,
  onSubmitStory,
  onOpenResources,
}) => {
  return (
    <section className="s-bento" id="features">
      <div className="wrap">
        <div className="bento-shell">
          <BackgroundVideo
            id="v-bento"
            src={VIDEOS.bento}
            poster={POSTERS.bento}
            alt="Landlords BC advocacy and resources background"
          />

          <div className="sec-head">
            <span className="eyebrow rv">BC Tenancy Education &amp; Advocacy</span>
            <h2 className="h2 split" data-split>
              Real Owner Challenges Met with
              <br />
              <span className="lt">Lawful Clarity &amp; Privacy</span>
            </h2>
            <p
              className="lead rv"
              style={{ ['--d' as string]: 3 }}
            >
              Behind every rental unit is a homeowner or property manager navigating complex provincial regulations. We provide professional, non-adversarial education while strictly protecting member identities.
            </p>
          </div>

          <div className="bento">
            {/* Card 1: Big Card — Landlords BC Focus Spotlight */}
            <div
              className="card c-big rv"
              style={{ ['--d' as string]: 1 }}
            >
              <img
                src="/assets/landlord/sunlit-facade.svg"
                alt="BC rental housing community"
              />
              <div>
                <h3>
                  Voices of BC landlords
                  <br />
                  <span>navigating tenancy rules.</span>
                </h3>
                <p className="desc">
                  &ldquo;When facing unexpected rent arrears and hearing delays, having access to cited RTA workflows and official RTB forms preserved our financial security without exposing our family name.&rdquo;
                </p>
              </div>
              <div>
                <div className="avatars">
                  <div className="av-stack">
                    <img
                      src="/assets/landlord/landlord-profile.svg"
                      alt="BC property owner"
                    />
                    <img
                      src="/assets/landlord/penthouse-living.svg"
                      alt="BC rental residence"
                    />
                    <img
                      src="/assets/landlord/sunlit-facade.svg"
                      alt="Protected residential building"
                    />
                  </div>
                  <span>2,400+ protected BC property owners</span>
                </div>
                <button
                  className="btn-white"
                  type="button"
                  onClick={onSubmitStory}
                >
                  Share Your Tenancy Experience Privately
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Confidential &amp; Server-Sealed · No tenant names or street address required</span>
                </div>
              </div>
            </div>

            {/* Card 2: Collage — Forms & Documentation */}
            <div
              className="card c-pad rv"
              style={{ ['--d' as string]: 2, cursor: onOpenResources ? 'pointer' : 'default' }}
              onClick={onOpenResources}
            >
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
                    alt="BC rental housing provider"
                  />
                </div>
              </div>
              <div className="txt">
                <h4>Official Forms &amp; Practical Guides</h4>
                <p>
                  Direct links to unedited RTB statutory documents alongside labelled educational templates for condition inspections, rent increases, and dispute evidence.
                </p>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#3b2116', fontWeight: 600 }}>
                  Explore 12+ Official Forms &amp; Guides →
                </div>
              </div>
            </div>

            {/* Card 3: Gauge — Privacy & Server-Sealed Records */}
            <div
              className="card c-pad rv"
              id="gauge-card"
              style={{ ['--d' as string]: 3 }}
            >
              <div className="gauge">
                <svg
                  viewBox="0 0 180 100"
                  style={{ width: '180px', height: '110px', overflow: 'visible' }}
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="gg" x1="0" y1="0" x2="1" y2="0">
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
                    id="g-arc"
                    d="M10 95 A80 80 0 0 1 170 95"
                    fill="none"
                    stroke="url(#gg)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="252"
                    strokeDashoffset="252"
                    style={{
                      transition: 'stroke-dashoffset 2.2s cubic-bezier(.22,1,.36,1)',
                    }}
                  />
                </svg>
                <div className="val">
                  <span data-count="100">0</span>%
                </div>
                <div className="ends">
                  <span>Public Risk</span>
                  <span>Server-Sealed</span>
                </div>
              </div>
              <div className="txt">
                <h4>Strict Member Confidentiality</h4>
                <p>
                  Your name, address, and rental files are never published. In version one, staff cannot browse member cases, and authorization is enforced on the server.
                </p>
              </div>
            </div>

            {/* Card 4: Rows — Clickable Case Scenarios */}
            <div
              className="card c-pad rv"
              style={{ ['--d' as string]: 4 }}
            >
              <div className="rows">
                {Object.values(HARDSHIP_STORIES).map((story, idx) => (
                  <div
                    key={story.id}
                    className="row"
                    style={{ ['--i' as string]: idx }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Read ${story.caseNumber} Scenario`}
                    onClick={() => onOpenStory(story.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenStory(story.id);
                      }
                    }}
                  >
                    <img src={story.image} alt={story.caseNumber} />
                    <div>
                      <b>{story.caseNumber}</b>
                      <em>{story.shortDesc}</em>
                    </div>
                    <span className="ok">
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                      >
                        <path
                          d="M2.5 6.5L5 9L9.5 3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                ))}
              </div>
              <div className="txt">
                <h4>Verified Tenancy Case Scenarios</h4>
                <p>
                  Click any scenario above to read how BC property owners resolved disputes using statutory RTB procedures under full anonymity.
                </p>
              </div>
            </div>

            {/* Card 5: Insight — Non-Adversarial & No Blacklist */}
            <div
              className="card c-pad rv"
              style={{ ['--d' as string]: 5 }}
            >
              <div className="insight">
                <img
                  src="/assets/landlord/penthouse-living.svg"
                  alt="Protected tenancy records vault"
                />
                <div className="chip">
                  <i></i>
                  <span>No Tenant Blacklist</span>
                </div>
              </div>
              <div className="txt">
                <h4>Non-Adversarial Advocacy</h4>
                <p>
                  We refuse to publish tenant names or run &ldquo;bad tenant&rdquo; lists. Instead, we aggregate anonymous dispute data to advocate for faster RTB hearings and clearer municipal bylaws.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

