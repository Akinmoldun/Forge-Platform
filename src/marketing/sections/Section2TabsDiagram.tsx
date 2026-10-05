import { useState } from 'react';
import { Section } from '../Section';
import { Frame } from '../Frame';
import {
  Sparkles,
  Video,
  Layers,
  Users,
  Database,
  Cpu,
  Workflow,
  Server,
  ArrowRight,
} from 'lucide-react';

type TabKey = 'agents' | 'webrtc' | 'platforms' | 'multiplayer' | 'data';

interface TabConfig {
  id: TabKey;
  label: string;
  icon: typeof Sparkles;
  quote: string;
  author: string;
  company: string;
  nodes: { label: string; sub: string; color: string; border: string; bg: string; icon: typeof Workflow }[];
}

const TABS: TabConfig[] = [
  {
    id: 'agents',
    label: 'AI Agents',
    icon: Sparkles,
    quote:
      'Cloudflare provided everything from OAuth to out-of-the-box remote MCP support so we could quickly build, secure, and scale a fully operational setup.',
    author: 'Build AI agents on durable objects with code execution, inference, AI gateway all built-in.',
    company: 'Atlassian',
    nodes: [
      { label: 'Workflow', sub: 'Event trigger', color: '#06B6D4', border: 'border-cyan-400', bg: 'bg-cyan-50/60', icon: Workflow },
      { label: 'Compute', sub: 'Sandboxed v8', color: '#3B82F6', border: 'border-blue-500', bg: 'bg-blue-50/60', icon: Cpu },
      { label: 'Workers AI', sub: 'Inference model', color: '#EC4899', border: 'border-pink-500', bg: 'bg-pink-50/60', icon: Sparkles },
      { label: 'Storage', sub: 'Vector & KV', color: '#A855F7', border: 'border-purple-500', bg: 'bg-purple-50/60', icon: Database },
    ],
  },
  {
    id: 'webrtc',
    label: 'WebRTC',
    icon: Video,
    quote:
      'Ultra low-latency media routing across global edge nodes with automated fallback and zero server maintenance.',
    author: 'Real-time media pipelines with programmable tracks and selective forwarding.',
    company: 'Discord',
    nodes: [
      { label: 'Ingest', sub: 'Edge POP', color: '#06B6D4', border: 'border-cyan-400', bg: 'bg-cyan-50/60', icon: Server },
      { label: 'SFU Track', sub: 'Sub-50ms', color: '#3B82F6', border: 'border-blue-500', bg: 'bg-blue-50/60', icon: Cpu },
      { label: 'Transcode', sub: 'Opus / VP9', color: '#EC4899', border: 'border-pink-500', bg: 'bg-pink-50/60', icon: Sparkles },
      { label: 'Egress', sub: 'Multi-peer', color: '#A855F7', border: 'border-purple-500', bg: 'bg-purple-50/60', icon: Users },
    ],
  },
  {
    id: 'platforms',
    label: 'Platforms',
    icon: Layers,
    quote:
      'Multi-tenant orchestration where customer code runs in micro-second isolated sandboxes with strict compliance.',
    author: 'Tenant isolation with programmatic DNS, SSL, and instant rule deployments.',
    company: 'Shopify',
    nodes: [
      { label: 'Tenant DNS', sub: 'Anycast', color: '#06B6D4', border: 'border-cyan-400', bg: 'bg-cyan-50/60', icon: Server },
      { label: 'Dispatch', sub: 'Custom domain', color: '#3B82F6', border: 'border-blue-500', bg: 'bg-blue-50/60', icon: Workflow },
      { label: 'Isolation', sub: 'Secure context', color: '#EC4899', border: 'border-pink-500', bg: 'bg-pink-50/60', icon: Cpu },
      { label: 'Analytics', sub: 'Real-time telemetry', color: '#A855F7', border: 'border-purple-500', bg: 'bg-purple-50/60', icon: Database },
    ],
  },
  {
    id: 'multiplayer',
    label: 'Multiplayer',
    icon: Users,
    quote:
      'Stateful durable objects coordinate user cursors, delta diffs, and WebSocket persistence without Redis.',
    author: 'Synchronized collaborative state machines with single-point authority globally.',
    company: 'Figma',
    nodes: [
      { label: 'Client WS', sub: 'Persistent conn', color: '#06B6D4', border: 'border-cyan-400', bg: 'bg-cyan-50/60', icon: Users },
      { label: 'Durable Obj', sub: 'Single-thread actor', color: '#3B82F6', border: 'border-blue-500', bg: 'bg-blue-50/60', icon: Cpu },
      { label: 'CRDT Sync', sub: 'Conflict-free', color: '#EC4899', border: 'border-pink-500', bg: 'bg-pink-50/60', icon: Workflow },
      { label: 'Snapshot', sub: 'Durable disk', color: '#A855F7', border: 'border-purple-500', bg: 'bg-purple-50/60', icon: Database },
    ],
  },
  {
    id: 'data',
    label: 'Data Platform',
    icon: Database,
    quote:
      'Distributed SQL and hyper-fast key-value storage queried globally with sub-millisecond edge read caches.',
    author: 'Global consistency where you need it, edge caching where you want it.',
    company: 'Stripe',
    nodes: [
      { label: 'Edge Query', sub: 'Read replica', color: '#06B6D4', border: 'border-cyan-400', bg: 'bg-cyan-50/60', icon: Server },
      { label: 'Router', sub: 'Zero-latency query', color: '#3B82F6', border: 'border-blue-500', bg: 'bg-blue-50/60', icon: Cpu },
      { label: 'D1 / KV', sub: 'Transactional ACID', color: '#EC4899', border: 'border-pink-500', bg: 'bg-pink-50/60', icon: Database },
      { label: 'Replication', sub: 'Async pipeline', color: '#A855F7', border: 'border-purple-500', bg: 'bg-purple-50/60', icon: Workflow },
    ],
  },
];

export function Section2TabsDiagram() {
  const [activeId, setActiveId] = useState<TabKey>('agents');
  const current = TABS.find((t) => t.id === activeId) || TABS[0];

  return (
    <Section id="workflows" ariaLabelledby="heading-tabs-diagram">
      {/* Centered H2 & Subtext matching screenshot */}
      <div
        data-reveal-header
        className="reveal-init text-center max-w-3xl mx-auto mb-10"
      >
        <h2
          id="heading-tabs-diagram"
          className="font-['Hanken_Grotesk',sans-serif] font-medium text-[30px] md:text-[44px] text-[#1C130D] leading-[1.12] tracking-[-0.025em]"
        >
          The cloud that works for developers,
          <br className="hidden sm:inline" /> not the other way around
        </h2>
        <p className="mt-3.5 text-[#7A5A47] text-[15px] sm:text-[16px] leading-[1.6] max-w-[580px] mx-auto text-center">
          Deploy serverless functions, frontends, containers, and databases to 330+ cities with one command.
        </p>
      </div>

      {/* 5 Pill Tabs matching screenshot */}
      <div
        data-reveal-group
        className="reveal-init flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={`rounded-full py-2 px-4 sm:px-5 text-[13px] font-medium transition-all duration-200 inline-flex items-center gap-2 cursor-pointer select-none ${
                isActive
                  ? 'bg-[#F36421] text-white shadow-xs'
                  : 'bg-white border border-[#E8D8CA] text-[#7A5A47] hover:text-[#1C130D] hover:border-[#1C130D]/40'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-[#7A5A47]'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Architecture Panel inside Frame with + markers */}
      <Frame className="p-6 sm:p-10 lg:p-12 bg-white/70 backdrop-blur-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left: Interactive Diagram Flow */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {/* Horizontal connected node chain */}
            <div className="py-6 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[520px] gap-3">
                {current.nodes.map((node, i) => {
                  const NodeIcon = node.icon;
                  return (
                    <div key={node.label} className="flex items-center flex-1">
                      {/* Box node */}
                      <div
                        className={`flex-1 min-w-[100px] rounded-xl border-2 ${node.border} ${node.bg} p-3.5 flex flex-col items-center justify-center text-center shadow-2xs transition-all hover:scale-[1.03]`}
                      >
                        <NodeIcon size={20} style={{ color: node.color }} />
                        <span className="mt-1.5 text-[13px] font-semibold text-[#1C130D] leading-tight">
                          {node.label}
                        </span>
                        <span className="text-[10px] text-[#7A5A47] font-mono mt-0.5">
                          {node.sub}
                        </span>
                      </div>

                      {/* Connector arrow */}
                      {i < current.nodes.length - 1 && (
                        <div className="px-2 flex items-center justify-center text-[#E8D8CA]">
                          <ArrowRight size={16} strokeWidth={2} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description & Quote underneath matching screenshot */}
            <div className="mt-6 pt-6 border-t border-[#E8D8CA]/60 text-left">
              <p className="text-[14px] font-medium text-[#1C130D] leading-relaxed">
                {current.author}
              </p>
              <blockquote className="mt-2 text-[13px] text-[#7A5A47] leading-relaxed italic">
                &ldquo;{current.quote}&rdquo;
              </blockquote>

              <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-[#1C130D]">
                <span className="text-[#7A5A47] font-normal">Architecture inspired by</span>
                <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
                  {current.company}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Floating Preview Window Card */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full max-w-[340px] rounded-[18px] border border-[#E8D8CA] bg-white p-4 shadow-sm">
              {/* Window dots header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D8CA]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-xs bg-blue-600" />
                </div>
              </div>

              {/* Wireframe skeleton body matching screenshot */}
              <div className="py-4 space-y-3">
                <div className="w-3/4 h-3 rounded-full bg-[#E8D8CA]/60" />
                <div className="w-1/2 h-2.5 rounded-full bg-[#E8D8CA]/40" />

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <div className="h-14 rounded-lg border border-dashed border-[#E8D8CA] bg-[#FAF7F2] p-2 flex flex-col justify-between">
                    <div className="w-8 h-2 rounded bg-cyan-400/40" />
                    <div className="w-12 h-2 rounded bg-[#E8D8CA]" />
                  </div>
                  <div className="h-14 rounded-lg border border-dashed border-[#E8D8CA] bg-[#FAF7F2] p-2 flex flex-col justify-between">
                    <div className="w-8 h-2 rounded bg-pink-400/40" />
                    <div className="w-12 h-2 rounded bg-[#E8D8CA]" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-200/50 flex items-center justify-between text-[11px] font-mono text-[#F36421]">
                  <span>Status: Operational</span>
                  <span className="w-2 h-2 rounded-full bg-[#27C93F]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
