import { Check, Minus } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section8RolesComparison() {
  const rows = [
    {
      feature: 'Issue creation & state transitions',
      viewer: false,
      member: true,
      admin: true,
      owner: true,
    },
    {
      feature: 'Dependency DAG link creation',
      viewer: false,
      member: true,
      admin: true,
      owner: true,
    },
    {
      feature: 'Transition rule invariant configuration',
      viewer: false,
      member: false,
      admin: true,
      owner: true,
    },
    {
      feature: 'Emergency blocker overrides & approvals',
      viewer: false,
      member: false,
      admin: true,
      owner: true,
    },
    {
      feature: 'Custom project workflow mapping',
      viewer: false,
      member: false,
      admin: true,
      owner: true,
    },
    {
      feature: 'Workspace member invitation management',
      viewer: false,
      member: false,
      admin: true,
      owner: true,
    },
    {
      feature: 'Immutable audit log export & inspection',
      viewer: 'Read only',
      member: 'Read only',
      admin: true,
      owner: true,
    },
    {
      feature: 'Tenant deletion & global settings',
      viewer: false,
      member: false,
      admin: false,
      owner: true,
    },
  ];

  return (
    <section id="security" className="landing-section bg-[#EFEFEF]">
      <div className="landing-container">
        {/* Section Header */}
        <Reveal className="text-center mb-16">
          <div className="landing-pill">
            <span>Access & Governance</span>
          </div>
          <h2>Roles at a glance.</h2>
          <p className="subtext">
            Granular separation of duties across Forge's four native roles: Viewer, Member, Admin, and Owner.
          </p>
        </Reveal>

        {/* Comparison Table Card */}
        <Reveal delayMs={80}>
          <div className="landing-card max-w-[960px] mx-auto overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/8 bg-black/[0.02]">
                    <th className="py-4 px-6 text-sm font-medium text-[#0D0D0D] w-2/5">
                      Permission Scope
                    </th>
                    <th className="py-4 px-3 text-center text-sm font-medium text-[#575657]">
                      Viewer
                    </th>
                    <th className="py-4 px-3 text-center text-sm font-medium text-[#575657]">
                      Member
                    </th>
                    <th className="py-4 px-3 text-center text-sm font-medium text-[#0D0D0D]">
                      Admin
                    </th>
                    <th className="py-4 px-3 text-center text-sm font-medium text-[#0D0D0D] bg-black/[0.03]">
                      Owner
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs text-[#0D0D0D]">
                  {rows.map((row, idx) => (
                    <Reveal
                      as="tr"
                      key={row.feature}
                      index={idx}
                      className="hover:bg-black/[0.01] transition-colors"
                    >
                      <td className="py-3.5 px-6 font-medium text-[#0D0D0D]">{row.feature}</td>

                      {/* Viewer */}
                      <td className="py-3.5 px-3 text-center">
                        {row.viewer === true ? (
                          <Check className="w-4 h-4 text-[#83DD79] mx-auto" />
                        ) : row.viewer === false ? (
                          <Minus className="w-4 h-4 text-black/20 mx-auto" />
                        ) : (
                          <span className="text-[11px] text-[#575657] font-mono">{row.viewer}</span>
                        )}
                      </td>

                      {/* Member */}
                      <td className="py-3.5 px-3 text-center">
                        {row.member === true ? (
                          <Check className="w-4 h-4 text-[#83DD79] mx-auto" />
                        ) : row.member === false ? (
                          <Minus className="w-4 h-4 text-black/20 mx-auto" />
                        ) : (
                          <span className="text-[11px] text-[#575657] font-mono">{row.member}</span>
                        )}
                      </td>

                      {/* Admin */}
                      <td className="py-3.5 px-3 text-center">
                        {row.admin === true ? (
                          <Check className="w-4 h-4 text-[#0D0D0D] mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-black/20 mx-auto" />
                        )}
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-3 text-center bg-black/[0.02]">
                        {row.owner === true ? (
                          <Check className="w-4 h-4 text-[#0D0D0D] mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-black/20 mx-auto" />
                        )}
                      </td>
                    </Reveal>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#F9F9F9] border-t border-black/6 flex items-center justify-between text-xs text-[#575657]">
              <span>Enforced on server-side queries and mutations via workspace token boundaries.</span>
              <span className="font-mono text-[11px] text-[#0D0D0D]">Zero privilege escalation</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
