import { Shield, Wrench, Home, CheckCircle, Star, Layers, Sun, Droplets, Leaf, AlignJustify, PanelTop, Clock, Users, Sparkles, BadgeCheck } from 'lucide-react';
import { LeadForm } from '@/components/LeadForm';
import { PublicNavbar } from '@/components/PublicNavbar';
import { ReviewCarousel } from '@/components/ReviewCarousel';

const services = [
  { title: 'Leak & Roof Repair', description: 'Fast diagnosis and reliable repairs to stop leaks and protect your home before damage spreads.', icon: Droplets },
  { title: 'Roof Reshingling', description: 'Full reshingling with premium materials and expert installation for lasting protection.', icon: Layers },
  { title: 'Metal Roof Installation', description: 'Durable, energy-efficient metal roofing built to handle Ontario\'s toughest weather.', icon: Shield },
  { title: 'Flat Roof Installation', description: 'Commercial-grade flat roofing systems installed with precision and long-term performance in mind.', icon: PanelTop },
  { title: 'Euroshield Rubber Shingles', description: 'Eco-friendly rubber shingles made from recycled tires — impact resistant and beautifully designed.', icon: Leaf },
  { title: 'Skylights & Solar Tubes', description: 'Bring natural light into your home with professionally installed skylights and solar tube systems.', icon: Sun },
  { title: 'Gutters & Gutter Guard', description: 'Keep water flowing away from your foundation with new gutters and clog-free gutter guard systems.', icon: AlignJustify },
  { title: 'Siding Installation', description: 'Refresh your home\'s exterior with quality siding that improves curb appeal and insulation.', icon: Home },
  { title: 'New Roof Installation', description: 'Complete new roof builds for new construction or full replacements, done right the first time.', icon: Wrench },
];

const areas = [
  { city: 'Burlington', icon: '🏘️' },
  { city: 'Hamilton', icon: '🏭' },
  { city: 'Mississauga', icon: '🏙️' },
  { city: 'Oakville', icon: '🌳' },
  { city: 'Milton', icon: '🏡' },
  { city: 'St. Catharines', icon: '🍇' },
];

const promises = [
  { icon: Clock, title: 'Prompt Response', description: 'We respond quickly — because a damaged roof can\'t wait.' },
  { icon: Users, title: 'Professional Crew', description: 'Trained, certified, and courteous tradespeople on every job.' },
  { icon: Sparkles, title: 'No Mess', description: 'We clean up completely. You\'ll barely know we were there.' },
  { icon: BadgeCheck, title: 'Limited Lifetime Warranty', description: 'Our workmanship is backed by a limited lifetime warranty for your peace of mind.' },
];

export default function LandingPage() {
  return (
    <div>
      <PublicNavbar />

      {/* Hero */}
      <section id="hero" className="hero-bg min-h-[90vh] flex items-center py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 w-full">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-none text-white mb-6">
                Ontario's Trusted
                <span className="block text-red-500 mt-2">Roofing Experts</span>
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-slate-100 mb-8 max-w-xl">
                Professional roofing services for homes and businesses across Southern Ontario. Quality workmanship, competitive pricing, and lifetime warranties.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Licensed & Insured', 'Free Estimates', '24/7 Emergency'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="text-green-400 h-5 w-5 shrink-0" />
                    <span className="text-white font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-12 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">Our Services</h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
              From minor repairs to complete installations, we handle every roofing need with precision and care.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white border border-slate-100 rounded-lg p-6 flex gap-4 card-hover shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
                <div className="w-11 h-11 bg-red-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <s.icon className="text-red-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-1">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-12 md:py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">Our Promise</h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-400 max-w-2xl mx-auto">
              Every job we take on comes with the same commitment to quality, respect, and results.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {promises.map((p) => (
              <div key={p.title} className="text-center">
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <p.icon className="text-white h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="text-center mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 md:h-6 md:w-6 fill-yellow-500 text-yellow-500" />)}
              </div>
              <span className="text-xl md:text-2xl font-bold text-slate-900">4.9/5</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">What Our Clients Say</h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
              Trusted by homeowners across Southern Ontario for quality roofing services.
            </p>
          </div>
          <ReviewCarousel />
        </div>
      </section>

      {/* Service Areas */}
      <section id="areas" className="py-12 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">Areas We Serve</h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
              Providing professional roofing services across Southern Ontario
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {areas.map((a) => (
              <div key={a.city} className="bg-white border border-slate-200 p-4 md:p-6 rounded-lg text-center card-hover">
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">{a.icon}</div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900">{a.city}</h3>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="text-slate-600 mb-3 text-sm">Don't see your city listed?</p>
            <a href="#hero" className="text-red-600 font-medium hover:text-red-700 transition-colors text-sm">
              Contact us to check if we serve your area →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-24 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">Ready to Get Started?</h2>
          <p className="text-sm sm:text-base leading-relaxed text-red-100 mb-8 max-w-2xl mx-auto">
            Contact us today for a free, no-obligation quote. Our team is ready to help protect your home.
          </p>
          <a href="#hero" className="inline-block bg-white text-red-600 font-semibold hover:bg-red-50 transition-colors px-8 py-4 rounded-md shadow-sm">
            Get Your Free Quote
          </a>
        </div>
      </section>
    </div>
  );
}
