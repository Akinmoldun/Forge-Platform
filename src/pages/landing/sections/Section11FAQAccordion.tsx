import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section11FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Forge prevent circular dependency loops?',
      a: 'Whenever an engineer links an issue as a blocker, the server executes a depth-first traversal of all reachable downstream issues. If the target node connects back to the source issue, the transaction is rejected with an explainable diagnostic error.',
    },
    {
      q: 'Can I try Forge without creating an account or providing credentials?',
      a: 'Yes. Forge provides an instant 1-click anonymous guest session. You receive an isolated temporary workspace with pre-populated projects, issues, dependency DAGs, and risk models to test all capabilities immediately.',
    },
    {
      q: 'How does real-time synchronization work under the hood?',
      a: 'Forge is powered by Convex reactive subscriptions. Every UI view subscribes to live queries over persistent WebSockets. When any teammate updates an issue status, assigns a ticket, or creates a dependency, changes sync across all active sessions in real time without manual refresh.',
    },
    {
      q: 'What did you not build?',
      a: 'We deliberately did not build billing, SSO, mobile apps, Kubernetes-style infrastructure, or an integrations marketplace. We focused entirely on core engineering workflow guarantees: multi-tenant isolation, custom state transitions, cycle-free dependency DAGs, explainable risk scoring, and immutable audit logs.',
    },
    {
      q: 'Can we enforce custom transition rules per project?',
      a: 'Yes. Each project can define custom workflows with tailored invariants — such as requiring an assignee before moving to In Progress, demanding a review comment before Review, or forbidding closing issues while upstream blockers remain open.',
    },
    {
      q: 'How does immutable activity tracking work?',
      a: 'Every mutation — including state transitions, blocker additions, comment postings, and membership invitations — writes an immutable, append-only record to the activity_events ledger with user ID, timestamps, and previous state. History cannot be modified, reordered, or deleted.',
    },
  ];

  const handleToggle = (idx: number) => {
    // Only one item open at a time
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="landing-section bg-[#EFEFEF]">
      <div className="landing-container">
        {/* Section Header */}
        <Reveal className="text-center mb-16">
          <div className="landing-pill">
            <span>FAQ</span>
          </div>
          <h2>Answers to help you get started faster.</h2>
          <p className="subtext">
            Everything you need to know about Forge's workflow engine, security invariants, and real-time architecture.
          </p>
        </Reveal>

        {/* Accordion List */}
        <div className="max-w-[800px] mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={faq.q} delayMs={idx * 80}>
                <div className="landing-card border border-black/[0.06] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleToggle(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggle(idx);
                      }
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    id={`faq-question-${idx}`}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 bg-white hover:bg-black/[0.01] transition-colors cursor-pointer select-none"
                  >
                    <span className="text-[15px] sm:text-[16px] font-medium text-[#0D0D0D]">
                      {faq.q}
                    </span>
                    <div
                      style={{ transitionDuration: '300ms', transitionTimingFunction: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }}
                      className={`w-7 h-7 rounded-full bg-black/5 flex items-center justify-center shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 bg-[#0D0D0D] text-white' : 'rotate-0 text-[#575657]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Smooth height transition using grid-template-rows 0fr to 1fr */}
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className={`faq-accordion-grid ${isOpen ? 'open' : 'closed'}`}
                  >
                    <div className="overflow-hidden">
                      <div
                        style={{
                          transitionDuration: '300ms',
                          transitionTimingFunction: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
                        }}
                        className={`px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-[14px] text-[#575657] leading-relaxed border-t border-black/5 bg-[#FAFAFA] transition-opacity ${
                          isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
