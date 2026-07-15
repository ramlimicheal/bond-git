import React from 'react';
import { Link } from 'react-router-dom';
import dashboardImg from '../src/assets/landing-dashboard.jpg';

const NAV = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const LOGOS = ['Grammarly', 'Mailchimp', 'Framer', 'Gumroad', 'Webflow', 'GitHub', 'Shopify', 'Notion'];

const FEATURES = [
  { icon: '🧾', title: 'GST-Ready Invoicing', desc: 'CGST, SGST, IGST split automatically. Place of supply, HSN/SAC — handled per invoice.' },
  { icon: '✨', title: 'AI Proposals & Quotes', desc: 'Draft studio-grade proposals in seconds. Polish scope, terms, and pricing with one click.' },
  { icon: '⚖️', title: 'Legal Backbone', desc: 'Every overdue invoice ships with an auto-drafted demand notice a real lawyer can sign.' },
  { icon: '🔗', title: 'Client Portal', desc: 'Clients view, e-sign and pay through a branded portal — no more email ping-pong.' },
  { icon: '💳', title: 'UPI & Cards', desc: 'Collect via UPI, cards, and net banking. Reconciliation is automatic, not a spreadsheet.' },
  { icon: '👩‍⚖️', title: 'Lawyer Marketplace', desc: 'On-demand Indian lawyers to send notices, chase payments, and escalate when needed.' },
];

const STEPS = [
  { n: '01', title: 'Set up your studio', desc: 'Add GSTIN, upload your logo, pick a brand accent. Your PDFs go premium in minutes.' },
  { n: '02', title: 'Send invoices & proposals', desc: 'AI-drafted, GST-compliant, e-signable. Track opens, views, and status in real time.' },
  { n: '03', title: 'Get paid — properly', desc: 'Auto reminders, UPI collection, and lawyer-signed notices for anything that goes silent.' },
];

const TESTIMONIALS = [
  {
    quote: 'Billenty recovered ₹42L in overdue invoices in just 3 weeks. Our studio finally sleeps at night.',
    name: 'Anjali Rao',
    role: 'Founder, Studio Kaari',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop',
  },
  {
    quote: 'Used to chase invoices manually — pure stress. Now AI sends perfect reminders. Collections up 58%.',
    name: 'Vikram Desai',
    role: 'Design Lead, Northline',
    img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=600&fit=crop',
  },
  {
    quote: 'The legal notice flow is unreal. One click, real lawyer, signed notice. Clients pay within 48 hours.',
    name: 'Priya Menon',
    role: 'Principal, Menon & Co.',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '₹1,900',
    per: '/mo',
    tag: 'Perfect for solo freelancers just getting started.',
    cta: 'Start 14-day free trial',
    variant: 'outline' as const,
    features: ['Up to 50 invoices / mo', 'GST-ready invoicing', 'Basic reminders', 'Client portal', 'Email support'],
  },
  {
    name: 'Growth',
    price: '₹4,900',
    per: '/mo',
    tag: 'Unlimited invoicing for growing studios.',
    cta: 'Book a demo',
    variant: 'primary' as const,
    features: ['Unlimited invoices', 'AI proposals & quotes', 'Auto-drafted legal notices', 'UPI + card collection', 'Priority support'],
  },
  {
    name: 'Business',
    price: '₹9,900',
    per: '/mo',
    tag: 'For agencies with real recovery needs.',
    cta: 'Talk to sales',
    variant: 'dark' as const,
    features: ['Everything in Growth', 'Lawyer marketplace', 'White-label client portal', 'Dedicated success manager', 'SOC 2 + 99.9% SLA'],
  },
];

const FAQS = [
  { q: 'How does Billenty\u2019s AI help me get paid faster?', a: 'Billenty drafts polished proposals, invoices and reminders automatically. It flags overdue invoices, escalates them to a signed legal notice, and reconciles UPI payments the moment they land.' },
  { q: 'Does Billenty work for Indian businesses?', a: 'Billenty is built for India first. GSTIN, CGST/SGST/IGST split, HSN/SAC, place of supply, e-invoicing and UPI collection are native \u2014 not bolted on.' },
  { q: 'Is Billenty easy to set up for non-techies?', a: 'Yes. Add your GSTIN, upload a logo, pick an accent colour and you can send your first branded invoice in under five minutes. No accounting jargon.' },
  { q: 'Can I try Billenty for free?', a: 'Every plan starts with a 14-day free trial. No credit card required. You can send real invoices during the trial and cancel any time.' },
  { q: 'What integrations does Billenty support?', a: 'Razorpay, UPI, Zoho Books, Tally, Google Drive, WhatsApp, Gmail and more \u2014 with an open API for anything custom.' },
  { q: 'Is my data safe with Billenty?', a: 'End-to-end encrypted, hosted in Indian data centres, SOC 2 Type II ready, and every legal document is stored under attorney-client workflows.' },
];

const NAV_TOP_OFFSET = 25;
const HERO_BAND_GAP = 24;

const Nav: React.FC = () => {
  const ref = React.useRef<HTMLElement | null>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--nav-h', `${h}px`);
      document.documentElement.style.setProperty('--nav-top', `${NAV_TOP_OFFSET}px`);
      document.documentElement.style.setProperty('--hero-band-gap', `${HERO_BAND_GAP}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener('resize', apply);
    return () => { ro.disconnect(); window.removeEventListener('resize', apply); };
  }, []);
  return (
  <div className="sticky top-0 z-40 bg-neutral-100 pt-[25px] pb-6">
    <div className="max-w-[1400px] mx-4 md:mx-auto">
    <header ref={ref} className="bg-white border border-neutral-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="h-[72px] pl-6 pr-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-neutral-900 flex items-center justify-center text-white text-[12px] font-bold">B</div>
          <span className="font-semibold tracking-tight text-neutral-900 text-lg">Billenty</span>
        </Link>
        <nav className="hidden md:flex items-center gap-10 text-[15px] text-neutral-700 absolute left-1/2 -translate-x-1/2">
          {NAV.map(n => <a key={n.label} href={n.href} className="hover:text-neutral-900 transition-colors">{n.label}</a>)}
        </nav>
        <Link to="/signup" className="bg-neutral-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors">
          Get Started
        </Link>
      </div>
    </header>
    </div>
  </div>
  );
};

const Hero: React.FC = () => (
  <section
    className="relative pb-24 px-6"
    style={{ paddingTop: 'clamp(72px, 8vw, 112px)' }}
  >
    <div
      className="absolute inset-0 pointer-events-none opacity-40"
      style={{
        backgroundImage: 'linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
      }}
    />
    <div className="relative max-w-6xl mx-auto grid md:grid-cols-[1.55fr_1fr] gap-10 items-end pt-8">
      <div>
        <h1 className="text-[56px] md:text-[88px] leading-[0.98] tracking-tight text-neutral-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
          Revenue <em className="italic">Automation</em><br />
          for India&rsquo;s Studios
        </h1>
      </div>
      <div className="md:pb-6">
        <p className="text-neutral-600 text-lg leading-relaxed max-w-md">
          Bill, collect, and enforce payment automatically. GST-compliant invoices, AI proposals, and lawyer-signed demand notices — all in one platform.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/signup" className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-6 py-3 rounded-full transition-colors">
            Get started now
          </Link>
          <a href="#pricing" className="inline-flex items-center bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-900 font-medium text-sm px-6 py-3 rounded-full transition-colors">
            See pricing
          </a>
        </div>
      </div>
    </div>
  </section>
);

const LogoMarquee: React.FC = () => (
  <section className="relative py-8 border-y border-neutral-200 bg-white overflow-hidden">
    <div className="flex animate-[marquee_14s_linear_infinite] gap-16 whitespace-nowrap">
      {[...LOGOS, ...LOGOS, ...LOGOS].map((l, i) => (
        <div key={i} className="flex items-center gap-3 text-neutral-500 text-lg">
          <span className="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">{l[0]}</span>
          <span className="lowercase font-medium">{l}</span>
        </div>
      ))}
    </div>
    <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }`}</style>
  </section>
);

const DashboardShowcase: React.FC = () => null;

const Features: React.FC = () => (
  <section id="features" className="py-24 px-6 bg-white">
    <div className="max-w-6xl mx-auto">
      <p className="text-xs font-semibold text-orange-600 tracking-widest uppercase mb-3">Features</p>
      <h2 className="text-4xl md:text-5xl tracking-tight text-neutral-900 max-w-2xl" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
        Everything you need to <em className="italic">get paid</em>
      </h2>
      <p className="mt-4 text-neutral-600 max-w-2xl">One platform to bill clients, collect payments, and enforce them — built for Indian designers.</p>
      <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="p-8 rounded-2xl border border-neutral-200 bg-white hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl mb-5">{f.icon}</div>
            <h3 className="font-display text-lg font-semibold text-neutral-900 mb-2">{f.title}</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorks: React.FC = () => (
  <section id="how" className="py-24 px-6 bg-neutral-50">
    <div className="max-w-6xl mx-auto">
      <p className="text-xs font-semibold text-orange-600 tracking-widest uppercase mb-3">How it works</p>
      <h2 className="text-4xl md:text-5xl tracking-tight text-neutral-900 max-w-2xl" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
        Live in <em className="italic">three</em> simple steps
      </h2>
      <div className="mt-14 grid md:grid-cols-3 gap-8">
        {STEPS.map(s => (
          <div key={s.n} className="bg-white border border-neutral-200 rounded-2xl p-8">
            <div className="text-5xl font-display text-neutral-300 font-bold mb-6">{s.n}</div>
            <h3 className="font-display text-xl font-semibold text-neutral-900 mb-2">{s.title}</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials: React.FC = () => (
  <section className="py-24 px-6 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="text-center">
        <h2 className="text-4xl md:text-6xl tracking-tight text-neutral-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
          Our customer reviews
        </h2>
        <p className="mt-5 text-neutral-500 max-w-2xl mx-auto">
          Studios handle 3\u00d7 the invoice volume with the same team, cut aged receivables by 92%, and close their books 12 days faster.
        </p>
      </div>
      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TESTIMONIALS.map(t => (
          <figure key={t.name} className="bg-[#faf9f4] rounded-3xl p-5 flex flex-col">
            <div className="flex gap-4 items-start">
              <img src={t.img} alt={t.name} className="w-40 h-48 object-cover rounded-2xl flex-shrink-0" loading="lazy" />
              <blockquote className="text-neutral-900 leading-snug" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: '20px' }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
            </div>
            <figcaption className="mt-6 pt-4 border-t border-neutral-200/70">
              <div className="text-sm font-semibold text-neutral-900">{t.name}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{t.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

const Pricing: React.FC = () => {
  const [yearly, setYearly] = React.useState(false);
  return (
    <section id="pricing" className="py-24 px-6 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl tracking-tight text-neutral-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
            Simple pricing that grows with you
          </h2>
          <p className="mt-5 text-neutral-500">No hidden fees. No per-invoice charges. Unlimited users.</p>
          <div className="mt-8 inline-flex items-center gap-3 text-sm">
            <span className={yearly ? 'text-neutral-400' : 'text-neutral-900 font-medium'}>Monthly</span>
            <button
              onClick={() => setYearly(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? 'bg-orange-500' : 'bg-neutral-300'}`}
              aria-label="Toggle billing period"
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${yearly ? 'left-6' : 'left-0.5'}`} />
            </button>
            <span className={yearly ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>Yearly</span>
            <span className="ml-1 text-xs bg-neutral-200 text-neutral-700 rounded-full px-2 py-0.5">Save 20%</span>
          </div>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {PLANS.map(p => {
            const price = yearly
              ? '\u20b9' + Math.round(parseInt(p.price.replace(/[^0-9]/g, ''), 10) * 0.8).toLocaleString('en-IN')
              : p.price;
            const btn =
              p.variant === 'primary'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : p.variant === 'dark'
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                : 'bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-900';
            return (
              <div key={p.name} className="bg-[#faf9f4] rounded-3xl p-3">
                <div className="text-center pt-8 pb-6 px-6">
                  <h3 className="text-3xl text-neutral-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>{p.name}</h3>
                  <p className="mt-3 text-sm text-neutral-500 max-w-[240px] mx-auto">{p.tag}</p>
                </div>
                <div className="bg-white rounded-2xl p-6">
                  <div className="text-center py-6">
                    <span className="text-5xl text-neutral-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>{price}</span>
                    <span className="text-neutral-500 ml-1">{p.per}</span>
                  </div>
                  <Link to="/signup" className={`block text-center font-medium py-3 rounded-full transition-colors ${btn}`}>
                    {p.cta}
                  </Link>
                  <div className="mt-8">
                    <p className="text-sm font-semibold text-neutral-900 mb-4">Everything you need</p>
                    <ul className="space-y-3">
                      {p.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                          <svg className="w-4 h-4 mt-0.5 text-neutral-900 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FAQ: React.FC = () => {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl tracking-tight text-neutral-900 leading-[1.05]" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
            Got Questions? Don&rsquo;t worry,<br />we&rsquo;ve got the Answers.
          </h2>
          <p className="mt-5 text-neutral-500">Everything you need to know before getting started</p>
        </div>
        <div className="mt-14 grid md:grid-cols-2 gap-4">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <button
                key={i}
                onClick={() => setOpen(isOpen ? null : i)}
                className="text-left bg-[#faf9f4] rounded-2xl p-5 flex items-start justify-between gap-4 hover:bg-[#f4f2eb] transition-colors"
              >
                <div>
                  <div className="font-medium text-neutral-900">{f.q}</div>
                  {isOpen && <div className="mt-3 text-sm text-neutral-600 leading-relaxed">{f.a}</div>}
                </div>
                <span className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center flex-shrink-0 text-lg leading-none">
                  {isOpen ? '\u2013' : '+'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
const CTA: React.FC = () => (
  <section id="pricing" className="py-24 px-6 bg-white">
    <div className="max-w-6xl mx-auto">
      <div
        className="relative rounded-3xl px-6 py-24 text-center overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ececec 1px, transparent 1px), linear-gradient(to bottom, #ececec 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          backgroundColor: '#fafafa',
        }}
      >
        <h2 className="text-4xl md:text-6xl tracking-tight text-neutral-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
          Ready to <em className="italic">automate</em> your revenue?
        </h2>
        <p className="mt-6 text-neutral-600 text-lg">Start your 14-day free trial. No credit card required. Cancel anytime.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-full transition-colors">Get started now</Link>
          <a href="#pricing" className="bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-900 font-medium px-6 py-3 rounded-full transition-colors">View pricing</a>
        </div>
      </div>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer id="contact" className="bg-neutral-950 text-neutral-300 rounded-t-3xl">
    <div className="max-w-6xl mx-auto px-8 py-16 grid md:grid-cols-4 gap-10">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-neutral-900 text-[11px] font-bold">B</div>
          <span className="font-display font-semibold text-white">Billenty</span>
        </div>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
          Bill, collect and enforce payment automatically. Revenue automation built for India&rsquo;s design studios.
        </p>
      </div>
      {[
        { title: 'Product', links: ['Features', 'How it works', 'Pricing', 'Integrations', 'Changelog'] },
        { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact', 'Press'] },
        { title: 'Resources', links: ['Documentation', 'Help center', 'Community', 'Guides', 'API'] },
      ].map(col => (
        <div key={col.title}>
          <h4 className="text-white font-semibold mb-4">{col.title}</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            {col.links.map(l => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-neutral-800">
      <div className="max-w-6xl mx-auto px-8 py-6 flex flex-wrap items-center justify-between text-sm text-neutral-500 gap-3">
        <span>© {new Date().getFullYear()} Billenty. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export const LandingPage: React.FC = () => (
  <div className="landing-light min-h-screen bg-neutral-100 text-neutral-900 font-sans">
    <Nav />
    <main className="bg-white rounded-t-xl overflow-hidden max-w-[1400px] mx-4 md:mx-auto">
      <Hero />
      <LogoMarquee />
      <DashboardShowcase />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  </div>
);

export default LandingPage;