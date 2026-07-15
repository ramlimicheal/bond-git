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
  { quote: 'Billenty cut our overdue book by 60% in the first quarter. The legal notice flow alone paid for the platform.', name: 'Anjali Rao', role: 'Founder, Studio Kaari' },
  { quote: 'Proposals used to eat my weekends. Now I ship a signed one before lunch.', name: 'Vikram Desai', role: 'Design Lead, Northline' },
  { quote: 'The client portal feels like Stripe for studios. My clients actually pay on time now.', name: 'Priya Menon', role: 'Principal, Menon & Co.' },
];

const Nav: React.FC = () => (
  <div className="sticky top-4 z-40 px-4">
    <header className="max-w-6xl mx-auto bg-white/90 backdrop-blur border border-neutral-200 rounded-full shadow-sm">
      <div className="h-14 pl-6 pr-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-neutral-900 flex items-center justify-center text-white text-[11px] font-bold">B</div>
          <span className="font-display font-semibold tracking-tight text-neutral-900">Billenty</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-600">
          {NAV.map(n => <a key={n.label} href={n.href} className="hover:text-neutral-900 transition-colors">{n.label}</a>)}
        </nav>
        <Link to="/signup" className="bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-neutral-800 transition-colors">
          Get Started
        </Link>
      </div>
    </header>
  </div>
);

const Hero: React.FC = () => (
  <section className="relative pt-16 pb-24 px-6">
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
    <div className="flex animate-[marquee_40s_linear_infinite] gap-16 whitespace-nowrap">
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

const DashboardShowcase: React.FC = () => (
  <section className="relative py-24 px-6 bg-neutral-50">
    <div className="max-w-6xl mx-auto">
      <img
        src={dashboardImg}
        alt="Billenty dashboard preview"
        width={1600}
        height={1104}
        className="w-full rounded-3xl shadow-2xl"
      />
    </div>
  </section>
);

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
      <p className="text-xs font-semibold text-orange-600 tracking-widest uppercase mb-3">Testimonials</p>
      <h2 className="text-4xl md:text-5xl tracking-tight text-neutral-900 max-w-2xl" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
        Loved by <em className="italic">design studios</em>
      </h2>
      <div className="mt-14 grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map(t => (
          <figure key={t.name} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col justify-between">
            <blockquote className="text-neutral-800 leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold">{t.name[0]}</div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{t.name}</div>
                <div className="text-xs text-neutral-500">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

const CTA: React.FC = () => (
  <section id="pricing" className="py-24 px-6 bg-neutral-50">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl md:text-6xl tracking-tight text-neutral-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
        Ready to <em className="italic">automate</em> your revenue?
      </h2>
      <p className="mt-6 text-neutral-600 text-lg">Start your 14-day free trial. No credit card required. Cancel anytime.</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link to="/signup" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-full transition-colors">Get started now</Link>
        <Link to="/login" className="bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-900 font-medium px-6 py-3 rounded-full transition-colors">Sign in</Link>
      </div>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer id="contact" className="py-12 px-6 bg-white border-t border-neutral-200">
    <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-neutral-900 flex items-center justify-center text-white text-[11px] font-bold">B</div>
        <span className="font-display font-semibold text-neutral-900">Billenty</span>
        <span className="text-neutral-500 text-sm ml-2">© {new Date().getFullYear()}</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-neutral-500">
        <a href="#features" className="hover:text-neutral-900">Features</a>
        <a href="#how" className="hover:text-neutral-900">How it works</a>
        <a href="#pricing" className="hover:text-neutral-900">Pricing</a>
        <Link to="/login" className="hover:text-neutral-900">Sign in</Link>
      </div>
    </div>
  </footer>
);

export const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans pt-4">
    <Nav />
    <main className="mt-2 bg-white rounded-t-[2.5rem] overflow-hidden max-w-[1400px] mx-4 md:mx-auto">
      <Hero />
      <LogoMarquee />
      <DashboardShowcase />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  </div>
);

export default LandingPage;