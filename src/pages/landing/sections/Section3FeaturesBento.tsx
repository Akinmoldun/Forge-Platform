import { Reveal } from '../Reveal';
import { WorkflowDiagram } from '../WorkflowDiagram';

export function Section3FeaturesBento() {
  return (
    <section id="features" className="landing-section bg-[#EFEFEF]">
      <div className="landing-container">
        {/* Eyebrow Pill + Heading */}
        <Reveal className="text-center">
          <div className="landing-pill">
            <span>Productivity Features</span>
          </div>

          <h2>Built for how engineering teams actually work.</h2>
          <p className="subtext">
            From fast-moving startups to structured engineering organizations, Forge adapts to your team’s
            real-world workflows — not the other way around.
          </p>
        </Reveal>

        {/* Interactive Workflow Diagram */}
        <Reveal delayMs={100}>
          <WorkflowDiagram />
        </Reveal>
      </div>
    </section>
  );
}
