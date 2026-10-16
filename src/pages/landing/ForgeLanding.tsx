import React from 'react';
import './landing.css';
import { MotionProvider } from './motion/MotionProvider';
import { ScrollProgressLine } from './motion/ScrollProgressLine';
import { Section1Nav } from './sections/Section1Nav';
import { Section2Hero } from './sections/Section2Hero';
import { Section3FeaturesBento } from './sections/Section3FeaturesBento';
import { Section4KeyCapabilities } from './sections/Section4KeyCapabilities';
import { Section5ProofNumbers } from './sections/Section5ProofNumbers';
import { ActivityHeatmap } from './ActivityHeatmap';
import { Section6HandleWorkflows } from './sections/Section6HandleWorkflows';
import { Section7WhatsIncluded } from './sections/Section7WhatsIncluded';
import { Section8RolesComparison } from './sections/Section8RolesComparison';
import { Section9WhyTeamsChoose } from './sections/Section9WhyTeamsChoose';
import { Section10EngineeringDecisions } from './sections/Section10EngineeringDecisions';
import { Section11FAQAccordion } from './sections/Section11FAQAccordion';
import { Section12FinalCTA } from './sections/Section12FinalCTA';
import { Section13Footer } from './sections/Section13Footer';

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
        </main>
      </div>
    </MotionProvider>
  );
}

