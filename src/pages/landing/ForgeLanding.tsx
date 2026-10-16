import React, { Suspense, lazy } from 'react';
import './landing.css';
import { MotionProvider } from './motion/MotionProvider';
import { ScrollProgressLine } from './motion/ScrollProgressLine';
import { Section1Nav } from './sections/Section1Nav';
import { Section2Hero } from './sections/Section2Hero';

// Lazy-load below-the-fold landing sections to reduce initial bundle size
const Section3FeaturesBento = lazy(() =>
  import('./sections/Section3FeaturesBento').then((m) => ({ default: m.Section3FeaturesBento })),
);
const Section4KeyCapabilities = lazy(() =>
  import('./sections/Section4KeyCapabilities').then((m) => ({ default: m.Section4KeyCapabilities })),
);
const Section5ProofNumbers = lazy(() =>
  import('./sections/Section5ProofNumbers').then((m) => ({ default: m.Section5ProofNumbers })),
);
const ActivityHeatmap = lazy(() =>
  import('./ActivityHeatmap').then((m) => ({ default: m.ActivityHeatmap })),
);
const Section6HandleWorkflows = lazy(() =>
  import('./sections/Section6HandleWorkflows').then((m) => ({ default: m.Section6HandleWorkflows })),
);
const Section7WhatsIncluded = lazy(() =>
  import('./sections/Section7WhatsIncluded').then((m) => ({ default: m.Section7WhatsIncluded })),
);
const Section8RolesComparison = lazy(() =>
  import('./sections/Section8RolesComparison').then((m) => ({ default: m.Section8RolesComparison })),
);
const Section9WhyTeamsChoose = lazy(() =>
  import('./sections/Section9WhyTeamsChoose').then((m) => ({ default: m.Section9WhyTeamsChoose })),
);
const Section10EngineeringDecisions = lazy(() =>
  import('./sections/Section10EngineeringDecisions').then((m) => ({
    default: m.Section10EngineeringDecisions,
  })),
);
const Section11FAQAccordion = lazy(() =>
  import('./sections/Section11FAQAccordion').then((m) => ({ default: m.Section11FAQAccordion })),
);
const Section12FinalCTA = lazy(() =>
  import('./sections/Section12FinalCTA').then((m) => ({ default: m.Section12FinalCTA })),
);
const Section13Footer = lazy(() =>
  import('./sections/Section13Footer').then((m) => ({ default: m.Section13Footer })),
);

export default function ForgeLanding() {
  return (
    <MotionProvider>
      <div className="landing relative w-full min-h-screen">
        <ScrollProgressLine />
        {/* 1. Shell + Nav (immediate) */}
        <Section1Nav />

        {/* Main Content Sections */}
        <main>
          {/* 2. Hero (immediate) */}
          <Section2Hero />

          {/* Below-the-fold sections lazy-loaded in suspense */}
          <Suspense fallback={<div className="min-h-96" />}>
            {/* 3. Features bento (Interactive Workflow Diagram) */}
            <Section3FeaturesBento />

            {/* 4. Key Capabilities (sticky list on left, sticky card pile on right) */}
            <Section4KeyCapabilities />

            {/* 5. Proof in the numbers */}
            <Section5ProofNumbers />

            {/* Activity heatmap audit trail */}
            <ActivityHeatmap />

            {/* 6. Handle complex workflows */}
            <Section6HandleWorkflows />

            {/* 7. What's included (NO pricing, no prices, no toggle) */}
            <Section7WhatsIncluded />

            {/* 8. Roles comparison table */}
            <Section8RolesComparison />

            {/* 9. Why teams choose Forge */}
            <Section9WhyTeamsChoose />

            {/* 10. Engineering decisions */}
            <Section10EngineeringDecisions />

            {/* 11. FAQ Accordion */}
            <Section11FAQAccordion />

            {/* 12. Final CTA (big card, primary action) */}
            <Section12FinalCTA />

            {/* 13. Minimal footer */}
            <Section13Footer />
          </Suspense>
        </main>
      </div>
    </MotionProvider>
  );
}
