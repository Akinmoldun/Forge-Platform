import { useEffect } from 'react';
import { StickyNav } from '../marketing/Nav';
import { Footer } from '../marketing/Footer';
import { Section1Hero } from '../marketing/sections/Section1Hero';
import { Section2TabsDiagram } from '../marketing/sections/Section2TabsDiagram';
import { Section3FeatureGrid } from '../marketing/sections/Section3FeatureGrid';
import { Section4WorkspaceIsolated } from '../marketing/sections/Section4WorkspaceIsolated';
import { Section5StackBrowser } from '../marketing/sections/Section5StackBrowser';
import { Section6SignupShipping } from '../marketing/sections/Section6SignupShipping';
import { Section7YouCanUseForgeTo } from '../marketing/sections/Section7YouCanUseForgeTo';
import { Section8RiskAudit } from '../marketing/sections/Section8RiskAudit';
import { Section9QuoteBand } from '../marketing/sections/Section9QuoteBand';
import { Section10WhyTeamsChoose } from '../marketing/sections/Section10WhyTeamsChoose';
import { Section11TailoredToTeam } from '../marketing/sections/Section11TailoredToTeam';
import { Section12PrimitivesTable } from '../marketing/sections/Section12PrimitivesTable';
import { Section13CTA } from '../marketing/sections/Section13CTA';

export default function HomePage() {
  useEffect(() => {
    // Content is visible by default. If reduced motion is requested, keep visible and skip animation.
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    // Enable reveal transitions only after JS has executed
    document.documentElement.classList.add('js-reveal');

    // Observe section headings
    const headerTargets = document.querySelectorAll<HTMLElement>('[data-reveal-header]');
    headerTargets.forEach((el) => {
      el.classList.add('reveal-pending');
    });

    const headerObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.remove('reveal-pending');
            el.classList.add('reveal-visible');
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    headerTargets.forEach((el) => headerObserver.observe(el));

    // Observe card groups with 80ms stagger
    const groupTargets = document.querySelectorAll<HTMLElement>('[data-reveal-group]');
    groupTargets.forEach((group) => {
      const cards = group.querySelectorAll<HTMLElement>('[data-reveal-card]');
      cards.forEach((card, idx) => {
        card.style.setProperty('--reveal-delay', `${idx * 80}ms`);
        card.classList.add('reveal-pending');
      });
    });

    const groupObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const group = entry.target as HTMLElement;
            const cards = group.querySelectorAll<HTMLElement>('[data-reveal-card]');
            cards.forEach((card) => {
              card.classList.remove('reveal-pending');
              card.classList.add('reveal-visible');
            });
            obs.unobserve(group);
          }
        });
      },
      { threshold: 0.15 }
    );
    groupTargets.forEach((group) => groupObserver.observe(group));

    // Standalone cards not inside a group
    const standaloneCards = document.querySelectorAll<HTMLElement>(
      ':not([data-reveal-group]) > [data-reveal-card], [data-reveal-card]:not([data-reveal-group] [data-reveal-card])'
    );
    standaloneCards.forEach((card) => {
      card.classList.add('reveal-pending');
    });

    const cardObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement;
            card.classList.remove('reveal-pending');
            card.classList.add('reveal-visible');
            obs.unobserve(card);
          }
        });
      },
      { threshold: 0.15 }
    );
    standaloneCards.forEach((card) => cardObserver.observe(card));

    return () => {
      headerObserver.disconnect();
      groupObserver.disconnect();
      cardObserver.disconnect();
      document.documentElement.classList.remove('js-reveal');
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBF5] page-dotted-grid text-[#3B1500] font-sans antialiased selection:bg-[#FFE5D6] selection:text-[#F36421] overflow-x-hidden w-full relative">
      {/* Sticky nav that appears on scroll */}
      <StickyNav />

      {/* 1. Hero: large orange rounded panel with nav, H1, subtext, CTA */}
      <Section1Hero />

      {/* 2. Tabs + diagram: H2, 5 pill tabs, dotted panel with inline SVG diagram & SMIL dots */}
      <Section2TabsDiagram />

      {/* 3. 3x2 feature grid with 16px outline icons */}
      <Section3FeatureGrid />

      {/* 4. "Workspace: Isolated": half-globe SVG fading out + 3 overlapping cells */}
      <Section4WorkspaceIsolated />

      {/* 5. "Built on a modern stack": 8 logos in dark brown + browser frame */}
      <Section5StackBrowser />

      {/* 6. "Go from sign-up -> shipping in minutes": 2-column bento with code panel & typing terminal */}
      <Section6SignupShipping />

      {/* 7. "You can use Forge to:": header row + 2x2 grid with 4 static peach illustrations */}
      <Section7YouCanUseForgeTo />

      {/* 8. "Risk you can audit": panel with 5-segment bar + 2 cards (Included and Not built, on purpose) */}
      <Section8RiskAudit />

      {/* 9. Quote band: tinted quote from Forge README with dark Forge mark */}
      <Section9QuoteBand />

      {/* 10. "Why teams choose Forge": left cream dashed panel + right solid orange panel */}
      <Section10WhyTeamsChoose />

      {/* 11. "Tailored to how your team works": wide card with 3 rows + orange card + 3 text cards */}
      <Section11TailoredToTeam />

      {/* 12. "Powerful primitives, seamlessly integrated": 5-column bordered grid */}
      <Section12PrimitivesTable />

      {/* 13. CTA: orange panel with 4 floating outline squares and inside ticker */}
      <Section13CTA />

      {/* 14. Footer: Forge logo + 3 link columns and copyright */}
      <Footer />
    </div>
  );
}
