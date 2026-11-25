import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  citation?: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'What is BC Landlord Advocacy, and who is it designed for?',
    answer:
      'We are a BC-focused educational, resource, and advocacy platform assisting residential rental property owners—including basement-suite homeowners, condo landlords, multi-unit owners, and licensed property managers—in navigating provincial tenancy regulations under the Residential Tenancy Act (RTA) and RTB framework.',
  },
  {
    question: 'Does this platform publish tenant names or maintain a “bad tenant” list?',
    answer:
      'No. Landlords BC operates on a professional, non-adversarial basis and strictly prohibits public tenant blacklists. Public registries violate British Columbia’s Personal Information Protection Act (PIPA) and expose property owners to substantial legal liability. All member records and advocacy submissions are server-sealed and completely private.',
  },
  {
    question: 'What is the statutory limit on security and pet deposits in BC?',
    answer:
      'Under RTA Section 19, a landlord may collect a security deposit equivalent to a maximum of one-half of one month’s rent payable under the tenancy agreement. If pets are permitted, an additional pet damage deposit of up to one-half of one month’s rent may also be collected. Landlords have 15 days at move-out to return the deposit with statutory interest or file an application with the RTB.',
    citation: 'BC RTA Section 19 & Section 38',
  },
  {
    question: 'How do I ensure a notice to end tenancy is legally valid at the RTB?',
    answer:
      'Notices must always use the official, unedited statutory form (e.g. RTB-30 for unpaid rent). Service must strictly follow RTA Section 88, correctly factoring in RTA Section 90 deemed-receipt rules (3 days for door posting, 5 days for registered mail). Handwritten or restyled notices are legally void at dispute resolution.',
    citation: 'BC RTA Section 46, 88 & 90',
  },
  {
    question: 'Can Landlords BC staff browse my private case notes or tenant records?',
    answer:
      'No. In our version-one architecture, member documentation vaults are stored with server-sealed encryption. Staff cannot browse members’ personal files, and authorization is enforced strictly on the server.',
  },
  {
    question: 'How are membership fees processed, and what currency is used?',
    answer:
      'All membership plans—Individual ($290 CAD/month), Property Manager ($590 CAD/year), and Custom Portfolio ($999 CAD/year)—are processed securely through Stripe in Canadian Dollars (CAD). Members receive immediate automated tax receipts and full access to unedited statutory legal kits.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
            Clear Provincial Answers
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-heading">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-prose mx-auto">
            Practical guidance on British Columbia tenancy legislation, member privacy protections, and lawful dispute resolution.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-base text-slate-900 pr-2">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 bg-slate-900 text-white' : ''
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-white">
                    <p className="m-0">{faq.answer}</p>
                    {faq.citation && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100">
                        <span>Statutory Reference:</span>
                        <span>{faq.citation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
