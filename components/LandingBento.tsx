import React from 'react';
import {
  Compass,
  IndianRupee,
  Receipt,
  Bot,
  Bell,
  Gavel,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

/* ---------- shared bento cell ---------- */

type CellProps = {
  className?: string;
  kicker: string;
  title: string;
  desc: string;
  cta?: string;
  children: React.ReactNode;
};

const Cell: React.FC<CellProps> = ({ className = '', kicker, title, desc, cta, children }) => (
  <div
    className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-all duration-300 hover:border-neutral-300 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] ${className}`}
  >
    {/* visual */}
    <div className="relative h-56 overflow-hidden bg-[#faf9f4] border-b border-neutral-100">
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </div>

    {/* copy */}
    <div className="p-7">
      <p className="text-[10px] font-semibold text-orange-600 tracking-[0.18em] uppercase mb-2">
        {kicker}
      </p>
      <h4
        className="text-2xl text-neutral-900 leading-tight mb-2"
        style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}
      >
        {title}
      </h4>
      <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
      {cta && (
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 opacity-70 group-hover:opacity-100 group-hover:gap-2.5 transition-all">
          {cta} <ArrowRight className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  </div>
);

/* ---------- cell 1: Fair Price Engine (marquee of scope→price) ---------- */

const priceRows = [
  { scope: 'Logo & identity system', low: '18k', high: '42k' },
  { scope: 'Landing page — 6 sections', low: '35k', high: '90k' },
  { scope: 'Mobile app UI — 20 screens', low: '85k', high: '2.4L' },
  { scope: 'Packaging — 3 SKUs', low: '22k', high: '58k' },
  { scope: 'Brand guidelines doc', low: '28k', high: '75k' },
  { scope: 'Motion reel — 30s', low: '40k', high: '1.1L' },
];

const PricePill: React.FC<{ scope: string; low: string; high: string }> = ({ scope, low, high }) => (
  <div className="shrink-0 flex items-center gap-4 rounded-xl border border-neutral-200 bg-white/90 backdrop-blur px-4 py-2.5 shadow-sm">
    <span className="text-xs font-medium text-neutral-700 whitespace-nowrap">{scope}</span>
    <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 whitespace-nowrap">
      <IndianRupee className="w-3 h-3" />
      {low} – {high}
    </span>
  </div>
);

const FairPriceVisual: React.FC = () => (
const MarqueeRow: React.FC<{ reverse?: boolean; duration: number; rows: typeof priceRows }> = ({
  reverse = false,
  duration,
  rows,
}) => (
  <div className="relative flex overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
    <div
      className="flex gap-3 pr-3 shrink-0 will-change-transform"
      style={{
        animation: `${reverse ? 'bento-marquee-rev' : 'bento-marquee'} ${duration}s linear infinite`,
      }}
    >
      {rows.map((r, i) => (
        <PricePill key={`x${i}`} {...r} />
      ))}
    </div>
    <div
      aria-hidden
      className="flex gap-3 pr-3 shrink-0 will-change-transform"
      style={{
        animation: `${reverse ? 'bento-marquee-rev' : 'bento-marquee'} ${duration}s linear infinite`,
      }}
    >
      {rows.map((r, i) => (
        <PricePill key={`y${i}`} {...r} />
      ))}
    </div>
  </div>
);

const FairPriceVisual: React.FC = () => (
  <div className="absolute inset-0 flex flex-col justify-center gap-3">
    <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full bg-neutral-900 text-white px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase shadow-sm">
      <Compass className="w-3 h-3" /> Live market rates
    </div>
    <MarqueeRow duration={38} rows={priceRows} />
    <MarqueeRow reverse duration={44} rows={priceRows.slice().reverse()} />
  </div>
);

/* ---------- cell 2: UPI auto-reconciliation (beam) ---------- */

const Node: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <div
    className={`absolute flex items-center justify-center rounded-full bg-white border border-neutral-200 shadow-sm text-[10px] font-semibold text-neutral-800 tracking-wide ${className}`}
  >
    {label}
  </div>
);

const ReconcileVisual: React.FC = () => (
  <div className="absolute inset-0">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 220" preserveAspectRatio="none">
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[
        'M 40 40 C 120 40, 130 110, 220 110',
        'M 40 110 L 220 110',
        'M 40 180 C 120 180, 130 110, 220 110',
      ].map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#e5e5e5" strokeWidth="1.5" fill="none" />
          <path d={d} stroke="url(#beam)" strokeWidth="2" fill="none" strokeDasharray="60 240">
            <animate attributeName="stroke-dashoffset" from="300" to="0" dur={`${2.4 + i * 0.4}s`} repeatCount="indefinite" />
          </path>
        </g>
      ))}
    </svg>
    <Node label="UPI" className="left-3 top-4 w-14 h-14" />
    <Node label="Razorpay" className="left-2 top-[45%] w-16 h-16 -translate-y-1/2" />
    <Node label="HDFC" className="left-3 bottom-4 w-14 h-14" />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 rounded-2xl bg-neutral-900 text-white px-4 py-3 shadow-lg">
      <span className="text-[9px] tracking-widest opacity-70">INV-0421</span>
      <span className="flex items-center text-sm font-semibold">
        <IndianRupee className="w-3.5 h-3.5" />
        1,20,000
      </span>
      <span className="flex items-center gap-1 text-[9px] text-emerald-300">
        <CheckCircle2 className="w-2.5 h-2.5" /> Matched
      </span>
    </div>
  </div>
);

/* ---------- cell 3: GST invoice card ---------- */

const GstVisual: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6">
    <div className="w-full max-w-[240px] rounded-xl bg-white border border-neutral-200 shadow-lg p-4 rotate-[-3deg] transition-transform group-hover:rotate-0 duration-500">
      <div className="flex items-center justify-between">
        <span className="text-[9px] tracking-widest text-neutral-500 uppercase">Tax Invoice</span>
        <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
          GSTIN ✓
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          ['Subtotal', '1,00,000'],
          ['CGST 9%', '9,000'],
          ['SGST 9%', '9,000'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px] text-neutral-600">
            <span>{k}</span>
            <span className="tabular-nums">₹{v}</span>
          </div>
        ))}
        <div className="pt-2 mt-2 border-t border-dashed border-neutral-200 flex justify-between">
          <span className="text-xs font-semibold text-neutral-900">Total</span>
          <span className="text-xs font-semibold text-neutral-900 tabular-nums">₹1,18,000</span>
        </div>
      </div>
      <div className="mt-3 rounded-md bg-[#faf9f4] px-2 py-1.5 text-[9px] text-neutral-500">
        HSN 998314 · Place of supply: KA
      </div>
    </div>
  </div>
);

/* ---------- cell 4: Auto-notice scheduler (animated list) ---------- */

const timeline = [
  { icon: Bell, tint: 'text-neutral-700 bg-neutral-100', label: 'Polite reminder sent', meta: 'Day 3 · Email' },
  { icon: Bell, tint: 'text-amber-700 bg-amber-50', label: 'Firm reminder sent', meta: 'Day 10 · WhatsApp' },
  { icon: Bot, tint: 'text-orange-700 bg-orange-50', label: 'AI drafted demand notice', meta: 'Day 15 · Section 138' },
  { icon: Gavel, tint: 'text-neutral-900 bg-neutral-900/5', label: 'Lawyer signed & dispatched', meta: 'Day 16 · Menon & Co.' },
  { icon: CheckCircle2, tint: 'text-emerald-700 bg-emerald-50', label: 'Paid — ₹1,20,000', meta: 'Day 18 · UPI' },
];

const SchedulerVisual: React.FC = () => (
  <div className="absolute inset-0 p-5 flex flex-col justify-center gap-2 overflow-hidden">
    {timeline.map((step, i) => (
      <div
        key={i}
        className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white/90 backdrop-blur px-3 py-2 shadow-sm opacity-0 animate-[bento-rise_0.6s_ease-out_forwards]"
        style={{ animationDelay: `${i * 0.15}s` }}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${step.tint}`}>
          <step.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-neutral-900 truncate">{step.label}</p>
          <p className="text-[9px] text-neutral-500">{step.meta}</p>
        </div>
      </div>
    ))}
  </div>
);

/* ---------- section ---------- */

const LandingBento: React.FC = () => (
  <section className="py-24 px-6 bg-white">
    <style>{`
      @keyframes bento-marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }
      @keyframes bento-marquee-rev { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      @keyframes bento-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    `}</style>
    <div className="max-w-6xl mx-auto">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-orange-600 tracking-widest uppercase mb-3">
          One canvas, four unfair advantages
        </p>
        <h2
          className="text-4xl md:text-5xl tracking-tight text-neutral-900 leading-[1.05]"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}
        >
          The parts of Billenty other invoicing tools don't have.
        </h2>
        <p className="mt-4 text-neutral-600">
          Not features on a checklist — working systems, on your side, quietly running while you design.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(0,1fr)]">
        <Cell
          className="md:col-span-2"
          kicker="Fair Price Engine"
          title="Never underquote again."
          desc="Type your scope — get a defensible low / median / high range with cited sources from Behance, Upwork and agency rate cards."
          cta="See how pricing works"
        >
          <FairPriceVisual />
        </Cell>

        <Cell
          className="md:col-span-1"
          kicker="Auto reconciliation"
          title="Money finds its invoice."
          desc="UPI, Razorpay and bank payments auto-match to the invoice the moment they land."
          cta="See payments"
        >
          <ReconcileVisual />
        </Cell>

        <Cell
          className="md:col-span-1"
          kicker="GST-native"
          title="India-first invoicing."
          desc="CGST / SGST / IGST splits, HSN codes, place of supply, TDS — all correct, always."
          cta="See GST"
        >
          <GstVisual />
        </Cell>

        <Cell
          className="md:col-span-2"
          kicker="Auto-notice scheduler"
          title="Runs the recovery, so you don't have to."
          desc="Overdue → reminder → firm reminder → AI notice → real lawyer → paid. Set once, sleep well."
          cta="See legal recovery"
        >
          <SchedulerVisual />
        </Cell>
      </div>
    </div>
  </section>
);

export default LandingBento;