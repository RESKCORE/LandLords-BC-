import React, { useEffect } from 'react';
import { BackgroundVideo } from './common/BackgroundVideo';
import { VIDEOS, POSTERS } from '../data/constants';

export const Hero: React.FC = () => {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const aiElements = document.querySelectorAll<HTMLElement>('#studio .ai-t');
    aiElements.forEach((el) => {
      if (el.querySelector('.ghost')) return;
      el.innerHTML = '<span class="ghost"></span><span class="live"></span>';
      const ghost = el.firstElementChild as HTMLElement;
      if (ghost && el.dataset.text) {
        ghost.textContent = el.dataset.text;
      }
    });

    const typeInto = (el: HTMLElement, text: string, speed = 14) =>
      new Promise<void>((res) => {
        const live = el.querySelector('.live');
        if (!live) return res();
        if (reduce) {
          live.textContent = text;
          return res();
        }
        live.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
        setTimeout(() => {
          live.textContent = '';
          let k = 0;
          const step = () => {
            k += 2;
            live.textContent = text.slice(0, k);
            if (k < text.length) {
              setTimeout(step, speed);
            } else {
              res();
            }
          };
          step();
        }, 650);
      });

    let isCancelled = false;

    const runColumn = async (items: HTMLElement[], done?: () => void) => {
      await wait(reduce ? 0 : 1200);
      for (const m of items) {
        if (isCancelled) return;
        m.classList.add('show');
        if (m.id === 'hero-fig') m.classList.add('in');
        const t = m.querySelector<HTMLElement>('.ai-t');
        if (t && t.dataset.text) {
          await typeInto(t, t.dataset.text);
        } else {
          await wait(reduce ? 0 : 380);
        }
      }
      if (done && !isCancelled) done();
    };

    const chatItems = [
      ...document.querySelectorAll<HTMLElement>('#studio .chat .msg'),
    ];
    const prodItems = [
      ...document.querySelectorAll<HTMLElement>('#studio .prod .msg'),
    ];

    runColumn(chatItems, () => {
      const track = document.getElementById('hero-track');
      if (track) track.style.width = '88%';
    });
    runColumn(prodItems);

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section className="hero" id="product">
      <div className="wrap">
        <div className="hero-head">
          <h1
            className="h-display split"
            data-split
            style={{ ['--base' as string]: '150ms' }}
          >
            BC Tenancy Law,
            <br />
            Privately &amp; Clearly
          </h1>
          <p
            className="hero-sub rv"
            style={{ ['--base' as string]: '700ms' }}
          >
            Education, resources, community, and advocacy for British Columbia rental-property owners under the Residential Tenancy Act (RTA).
          </p>
        </div>

        <div
          id="tenancy-guidance"
          className="hero-card rv rv-scale"
          style={{ ['--base' as string]: '850ms' }}
        >
          <BackgroundVideo
            id="v-hero"
            src={VIDEOS.hero}
            poster={POSTERS.hero}
            alt="Protected British Columbia residential rental showcase"
          />
          <div className="shade"></div>

          <div id="studio" className="studio">
            <div className="chat">
              <div className="chat-top msg">
                <span>BC Member Consultation Desk · File #BC-409</span>
                <svg
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="#4b3a30"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    d="M2 3.5L5 6.5L8 3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="bubble msg">
                My tenant stopped paying rent. How do I serve notice correctly under the BC RTA without making an invalid filing at the RTB?
              </div>

              <div className="ai msg">
                <div className="ai-ic">
                  <svg viewBox="0 0 40 40" fill="#2a1a12">
                    <path d="M5 5h13v13H5zM22 22h13v13H22z" />
                    <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
                  </svg>
                </div>
                <div
                  className="ai-t"
                  data-text="Under RTA Section 46, serve the official unedited 10-Day Notice (RTB-30). Service by registered mail adds 5 days deemed receipt; posting to the door adds 3 days. Do not alter the government form."
                ></div>
              </div>

              <div className="bubble msg">
                Will my tenant's name or my property address ever be published or exposed on a public blacklist?
              </div>

              <div className="ai msg">
                <div className="ai-ic">
                  <svg viewBox="0 0 40 40" fill="#2a1a12">
                    <path d="M5 5h13v13H5zM22 22h13v13H22z" />
                    <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
                  </svg>
                </div>
                <div
                  className="ai-t"
                  data-text="Never. Landlords BC strictly refuses tenant blacklists or public directories. All dispute logs and evidence packets remain sealed in your private documentation vault."
                ></div>
              </div>

              <div className="cd msg">
                <div>
                  <small>TRUST &amp; ETHICS COMMITMENT</small>
                  <strong>No Blacklists · Zero Doxxing</strong>
                </div>
                <div className="slider">
                  <small>100% Private Documentation · RTB Cited</small>
                  <div className="track">
                    <b id="hero-track"></b>
                  </div>
                </div>
              </div>
            </div>

            <div className="prod">
              <span className="msg">Verified BC Tenancy Record</span>
              <figure id="hero-fig" className="msg">
                <img
                  src="/assets/landlord/penthouse-living.svg"
                  alt="Protected BC residential interior"
                />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
