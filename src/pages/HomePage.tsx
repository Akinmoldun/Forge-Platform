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
  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#3B1500] font-sans antialiased selection:bg-[#FFE5D6] selection:text-[#FF4801] overflow-x-hidden w-full">
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
