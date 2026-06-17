import React from 'react';
import { Link } from 'react-router-dom';

const Nav: React.FC = () => (
  <header className="sticky top-0 z-40 backdrop-blur bg-black/70 border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-mint rounded-md flex items-center justify-center text-black">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <span className="text-white font-display font-bold tracking-tight">Billenty</span>
        <span className="ml-2 text-[10px] uppercase tracking-widest text-mint/80 border border-mint/30 rounded px-1.5 py-0.5">India</span>
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
        <a href="#problem" className="hover:text-white">Why</a>
        <a href="#pillars" className="hover:text-white">Product</a>
        <a href="#how" className="hover:text-white">How it works</a>
        <a href="#pricing" className="hover:text-white">Pricing</a>
        <a href="#faq" className="hover:text-white">FAQ</a>
      </nav>
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm text-gray-300 hover:text-white">Sign in</Link>
        <Link to="/signup" className="text-sm font-semibold bg-mint text-black px-4 py-2 rounded-lg hover:bg-mint/90">Start free</Link>
      </div>
    </div>
  </header>
);

const Hero: React.FC = () => (
  <section className="relative overflow-hidden bg-black text-white">
    <div className="absolute inset-0 opacity-[0.18]" style={{
      backgroundImage: 'radial-gradient(rgba(110,231,183,0.5) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    }} />
    <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-mint/20 blur-3xl pointer-events-none" />
    <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-28">
      <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-mint/90 border border-mint/30 rounded-full px-3 py-1 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
        Invoicing with a legal backbone
      </div>
      <h1 className="font-display font-bold tracking-tight text-5xl md:text-7xl leading-[1.02] max-w-5xl">
        Send the invoice.<br />
        <span className="text-mint">Attach the lawyer.</span><br />
        Get paid — properly.
      </h1>
      <p className="mt-8 text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
        Billenty is the invoicing OS built for Indian design studios and freelancers. GST handled. Proposals drafted by AI. And every overdue invoice ships with a demand notice your lawyer can sign — automatically.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link to="/signup" className="bg-mint text-black font-semibold px-6 py-3.5 rounded-lg hover:bg-mint/90 transition">Start free — no card</Link>
        <a href="#how" className="text-gray-300 hover:text-white px-4 py-3.5 inline-flex items-center gap-2">
          See how it works
          <span className="material-icons-outlined text-base">arrow_forward</span>
        </a>
      </div>
      <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
        {[
          { k: '₹2.1L', v: 'avg. unpaid per Indian freelancer' },
          { k: '54 days', v: 'median delay to get paid' },
          { k: '18% GST', v: 'auto-split CGST/SGST/IGST' },
          { k: '15 days', v: 'standard notice period built-in' },
        ].map(s => (
          <div key={s.v}>
            <p className="text-2xl font-display font-bold text-white">{s.k}</p>
            <p className="text-xs text-gray-400 mt-1 leading-snug">{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Problem: React.FC = () => (
  <section id="problem" className="bg-[#0a0a0b] text-white border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 py-24">
      <p className="text-mint text-xs uppercase tracking-[0.2em] mb-4">The Indian creative payment problem</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl leading-tight">Every studio in India is owed money. Nobody wants to ask for it twice.</h2>
      <div className="grid md:grid-cols-3 gap-6 mt-16">
        {[
          { n: '01', t: 'Polite follow-ups don\'t work', d: 'The 3rd "just checking in" email gets ignored. Without a legal cover, clients learn that your deadline is optional.' },
          { n: '02', t: 'Lawyers are expensive to involve early', d: 'Drafting a single demand notice costs ₹5,000–₹15,000. So freelancers wait. And wait. And eventually write off the invoice.' },
          { n: '03', t: 'GST + interstate is a tax minefield', d: 'CGST/SGST for intra-state, IGST for inter-state, SAC 9983, reverse charge — getting it wrong invites scrutiny you can\'t afford.' },
        ].map(p => (
          <div key={p.n} className="border border-white/10 rounded-2xl p-7 hover:border-mint/40 transition">
            <p className="font-display text-mint/70 text-sm mb-4">{p.n}</p>
            <h3 className="font-display text-xl font-semibold mb-3">{p.t}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{p.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Pillars: React.FC = () => {
  const items = [
    {
      tag: 'Money in',
      title: 'Invoices, quotes & proposals — GST-native',
      body: 'SAC 9983 by default. CGST+SGST when client and you share a state, IGST otherwise. Rupees, lakhs, and crores formatted the way India reads them.',
      bullets: ['Recurring invoices', 'Razorpay-ready', 'PDF that survives forwarding'],
    },
    {
      tag: 'The differentiator',
      title: 'A lawyer attached to every invoice',
      body: 'Add your lawyer once. When an invoice goes 30 days overdue, Billenty drafts a formal demand notice citing the Contract Act, MSME Act and CPC — your lawyer reviews, signs, and sends.',
      bullets: ['AI-drafted notice in seconds', 'Lawyer gets read-only login', 'Audit trail per invoice'],
    },
    {
      tag: 'AI assist',
      title: 'Proposals that read like you wrote them — better',
      body: 'Generate a scope of work from a brief. Polish a line item. Draft a watertight agreement. Built on Gemini, tuned for Indian design contracts.',
      bullets: ['One-click scope', 'Tone matches your brand', 'Agency vs freelancer voice'],
    },
    {
      tag: 'Studio ops',
      title: 'Clients, products, reports — in one quiet place',
      body: 'No 9-tab CRM. Sales overview, ageing, who owes you what, and which proposal is sitting unsigned. The dashboard you\'d design for yourself.',
      bullets: ['Multi-seat for agencies (5)', 'Single-seat for freelancers', 'Dark mode, properly'],
    },
  ];
  return (
    <section id="pillars" className="bg-black text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <div>
            <p className="text-mint text-xs uppercase tracking-[0.2em] mb-4">Four pillars</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-2xl leading-tight">Everything an Indian studio needs. Nothing it doesn't.</h2>
          </div>
          <Link to="/signup" className="text-sm text-mint hover:text-white inline-flex items-center gap-2">Explore the product <span className="material-icons-outlined text-base">arrow_outward</span></Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((it, i) => (
            <div key={i} className="relative border border-white/10 rounded-3xl p-8 overflow-hidden group hover:border-mint/40 transition">
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-mint/5 blur-2xl group-hover:bg-mint/10 transition" />
              <span className="relative text-[11px] uppercase tracking-[0.18em] text-mint/80">{it.tag}</span>
              <h3 className="relative font-display text-2xl font-semibold mt-3 leading-snug">{it.title}</h3>
              <p className="relative text-sm text-gray-400 mt-4 leading-relaxed">{it.body}</p>
              <ul className="relative mt-6 space-y-2">
                {it.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="material-icons-outlined text-mint text-base">check_circle</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const How: React.FC = () => (
  <section id="how" className="bg-[#0a0a0b] text-white border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 py-24">
      <p className="text-mint text-xs uppercase tracking-[0.2em] mb-4">How it works</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl leading-tight">Three steps. The third one runs while you sleep.</h2>
      <div className="mt-16 grid md:grid-cols-3 gap-10">
        {[
          { n: '01', t: 'Set up in 90 seconds', d: 'Tell us if you\'re a freelancer or agency, your state, and (optional) GSTIN. We pre-fill the rest.' },
          { n: '02', t: 'Send invoices & proposals', d: 'Use templates that look like a brand asset. GST splits itself. PDFs ship with your logo and signature.' },
          { n: '03', t: 'Let the legal layer chase', d: '30 days overdue → AI drafts a demand notice → your lawyer signs → client pays. You barely touched it.' },
        ].map(s => (
          <div key={s.n} className="relative">
            <div className="text-6xl font-display font-bold text-mint/20 leading-none">{s.n}</div>
            <h3 className="font-display text-xl font-semibold mt-4">{s.t}</h3>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Compare: React.FC = () => {
  const rows = [
    ['GST-native (CGST/SGST/IGST split)', true, 'manual', 'manual'],
    ['Indian Rupee + lakh/crore formatting', true, 'partial', false],
    ['Auto-drafted legal demand notice', true, false, false],
    ['Lawyer read-only login per invoice', true, false, false],
    ['AI proposal & scope generation', true, false, 'add-on'],
    ['Designed for studios, not accountants', true, false, false],
  ];
  const Cell = ({ v }: { v: boolean | string }) =>
    v === true ? <span className="material-icons-outlined text-mint">check</span>
    : v === false ? <span className="text-gray-700">—</span>
    : <span className="text-xs text-gray-400 italic">{v}</span>;
  return (
    <section className="bg-black text-white border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-mint text-xs uppercase tracking-[0.2em] mb-4">Why not the others</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">Spreadsheets are free. Generic tools are global. Billenty is yours.</h2>
        <div className="mt-12 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03]">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4 font-medium">Capability</th>
                <th className="px-6 py-4 font-medium text-mint">Billenty</th>
                <th className="px-6 py-4 font-medium">Zoho / QuickBooks</th>
                <th className="px-6 py-4 font-medium">Spreadsheets</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="px-6 py-4 text-gray-200">{r[0] as string}</td>
                  <td className="px-6 py-4"><Cell v={r[1] as any} /></td>
                  <td className="px-6 py-4"><Cell v={r[2] as any} /></td>
                  <td className="px-6 py-4"><Cell v={r[3] as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const Pricing: React.FC = () => (
  <section id="pricing" className="bg-[#0a0a0b] text-white border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 py-24">
      <p className="text-mint text-xs uppercase tracking-[0.2em] mb-4">Pricing</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold max-w-2xl leading-tight">Honest pricing in INR. No "starting from $".</h2>
      <div className="grid md:grid-cols-2 gap-6 mt-14 max-w-4xl">
        <div className="border border-white/10 rounded-3xl p-8">
          <p className="text-xs uppercase tracking-widest text-gray-400">Freelancer</p>
          <p className="font-display text-5xl font-bold mt-4">₹0<span className="text-base font-normal text-gray-400">/mo</span></p>
          <p className="text-sm text-gray-400 mt-2">Forever. While we're in early access.</p>
          <ul className="mt-8 space-y-3 text-sm text-gray-300">
            <li className="flex gap-2"><span className="material-icons-outlined text-mint text-base">check</span> Unlimited invoices, quotes, proposals</li>
            <li className="flex gap-2"><span className="material-icons-outlined text-mint text-base">check</span> 1 lawyer attached</li>
            <li className="flex gap-2"><span className="material-icons-outlined text-mint text-base">check</span> AI assist (fair use)</li>
          </ul>
          <Link to="/signup" className="mt-8 inline-block text-mint hover:text-white">Start free →</Link>
        </div>
        <div className="relative border border-mint/40 rounded-3xl p-8 bg-mint/[0.04]">
          <span className="absolute -top-3 left-8 bg-mint text-black text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full">For studios</span>
          <p className="text-xs uppercase tracking-widest text-mint">Agency</p>
          <p className="font-display text-5xl font-bold mt-4">₹1,499<span className="text-base font-normal text-gray-400">/mo</span></p>
          <p className="text-sm text-gray-400 mt-2">Up to 5 seats. Billed monthly, cancel anytime.</p>
          <ul className="mt-8 space-y-3 text-sm text-gray-300">
            <li className="flex gap-2"><span className="material-icons-outlined text-mint text-base">check</span> Everything in Freelancer</li>
            <li className="flex gap-2"><span className="material-icons-outlined text-mint text-base">check</span> Multi-seat (5), shared clients</li>
            <li className="flex gap-2"><span className="material-icons-outlined text-mint text-base">check</span> Unlimited lawyers & engagements</li>
            <li className="flex gap-2"><span className="material-icons-outlined text-mint text-base">check</span> Agency-branded proposal templates</li>
          </ul>
          <Link to="/signup" className="mt-8 inline-block bg-mint text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-mint/90">Start 14-day trial</Link>
        </div>
      </div>
    </div>
  </section>
);

const FAQ: React.FC = () => {
  const qs = [
    { q: 'Do I need to bring my own lawyer?', a: 'You can — and most studios do. Or pick from our partner roster (rolling out). Either way, the lawyer gets a read-only invoice login, not your whole account.' },
    { q: 'Is the AI-drafted notice legally valid?', a: 'It\'s a draft. A human lawyer must review, edit, sign and send it. We surface the relevant Indian provisions (Contract Act, MSME Act, CPC Order XXXVII) so the lawyer\'s 30 minutes of work becomes 5.' },
    { q: 'Does Billenty file e-invoices on the GST portal?', a: 'Not yet. We generate GST-compliant invoices with correct CGST/SGST/IGST splits and SAC codes. IRP filing is on the roadmap for Q3.' },
    { q: 'Can I migrate from Zoho Books or Refrens?', a: 'Yes — CSV import for clients and invoices is live. Full Zoho sync (clients, products, invoices, payments) is in private beta.' },
    { q: 'What about international clients?', a: 'You can invoice in USD/EUR/GBP with FIRC-friendly templates. The legal layer is India-specific today; export-payment notices are next.' },
  ];
  return (
    <section id="faq" className="bg-black text-white border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <p className="text-mint text-xs uppercase tracking-[0.2em] mb-4">FAQ</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">Questions Indian studios actually ask.</h2>
        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {qs.map(({ q, a }, i) => (
            <details key={i} className="group py-6">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-6">
                <span className="font-display text-lg font-semibold">{q}</span>
                <span className="material-icons-outlined text-mint transition group-open:rotate-45">add</span>
              </summary>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed pr-10">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA: React.FC = () => (
  <section className="bg-mint text-black">
    <div className="max-w-6xl mx-auto px-6 py-24 text-center">
      <h2 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] max-w-3xl mx-auto">Stop chasing. Start collecting.</h2>
      <p className="mt-6 text-base md:text-lg text-black/70 max-w-xl mx-auto">Join the early-access studios using Billenty to send invoices that arrive with consequences.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link to="/signup" className="bg-black text-mint font-semibold px-7 py-3.5 rounded-lg hover:bg-gray-900">Create my workspace</Link>
        <Link to="/login" className="text-black/80 hover:text-black px-4 py-3.5">I already have an account →</Link>
      </div>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="bg-black text-gray-400 border-t border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap items-center justify-between gap-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-mint rounded-md flex items-center justify-center text-black">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <span className="text-white font-display font-bold">Billenty</span>
        <span className="text-gray-600">· Made in India for Indian studios</span>
      </div>
      <div className="flex gap-6">
        <a href="#problem" className="hover:text-white">Why</a>
        <a href="#pricing" className="hover:text-white">Pricing</a>
        <a href="#faq" className="hover:text-white">FAQ</a>
        <Link to="/login" className="hover:text-white">Sign in</Link>
      </div>
      <p className="text-xs text-gray-600">© 2026 Billenty. All rights reserved.</p>
    </div>
  </footer>
);

export const LandingPage: React.FC = () => {
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
    document.title = 'Billenty — Invoicing with a legal backbone, for Indian studios';
  }, []);
  return (
    <div className="min-h-screen bg-black font-body antialiased">
      <Nav />
      <Hero />
      <Problem />
      <Pillars />
      <How />
      <Compare />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;