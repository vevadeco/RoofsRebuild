import { Shield, Wrench, Home, CheckCircle, Star, Quote } from 'lucide-react';
import { LeadForm } from '@/components/LeadForm';

const services = [
  {
    title: 'Roof Repair',
    description: 'Fast, reliable repairs to protect your home from the elements.',
    image: 'https://images.unsplash.com/photo-1726589004565-bedfba94d3a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwzfHxyb29maW5nJTIwd29ya2VyJTIwcmVwYWlyJTIwc2hpbmdsZXN8ZW58MHx8fHwxNzc0NjU0NjE2fDA&ixlib=rb-4.1.0&q=85',
    icon: Wrench,
  },
  {
    title: 'Shingle Replacement',
    description: 'Premium quality shingles installed by certified professionals.',
    image: 'https://images.pexels.com/photos/9431615/pexels-photo-9431615.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    icon: Shield,
  },
  {
    title: 'New Roofs',
    description: 'Complete roof installation with lifetime warranties available.',
    image: 'https://images.pexels.com/photos/12081268/pexels-photo-12081268.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    icon: Home,
  },
];

const reviews = [
  {
    name: 'Sarah & Michael Chen',
    location: 'Toronto, ON',
    rating: 5,
    review: 'Roofs Canada did an amazing job on our roof replacement. The team was professional, efficient, and cleaned up perfectly. Highly recommend!',
    image: 'https://images.pexels.com/photos/7579360/pexels-photo-7579360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    service: 'New Roof Installation',
  },
  {
    name: 'David Thompson',
    location: 'Vancouver, BC',
    rating: 5,
    review: 'After a storm damaged our roof, Roofs Canada responded within hours. Their emergency repair service saved us from further water damage.',
    image: 'https://images.unsplash.com/photo-1755190897791-7040dfdb988f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwzfHxoYXBweSUyMGhvbWVvd25lciUyMHRlc3RpbW9uaWFsJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzc0NjU3NzYzfDA&ixlib=rb-4.1.0&q=85',
    service: 'Emergency Roof Repair',
  },
  {
    name: 'Jennifer & Robert Martinez',
    location: 'Calgary, AB',
    rating: 5,
    review: 'We got quotes from 3 companies and Roofs Canada offered the best value with premium materials. The installation was flawless.',
    image: 'https://images.pexels.com/photos/8292843/pexels-photo-8292843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    service: 'Shingle Replacement',
  },
];

const areas = [
  { city: 'Burlington', icon: '🏘️' },
  { city: 'Hamilton', icon: '🏭' },
  { city: 'Mississauga', icon: '🏙️' },
  { city: 'Oakville', icon: '🌳' },
  { city: 'Milton', icon: '🏡' },
  { city: 'St. Catharines', icon: '🍇' },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < count ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'}`} />
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-bg min-h-[90vh] flex items-center py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter leading-none text-white mb-6">
                Canada's Trusted
                <span className="block text-red-500 mt-2">Roofing Experts</span>
              </h1>
              <p className="text-base leading-relaxed text-slate-100 mb-8 max-w-xl">
                Professional roofing services for homes and businesses across Canada. Quality workmanship, competitive pricing, and lifetime warranties.
              </p>
              <div className="flex flex-wrap gap-6">
                {['Licensed & Insured', 'Free Estimates', '24/7 Emergency'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="text-green-400 h-5 w-5" />
                    <span className="text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">Our Services</h2>
            <p className="text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
              From minor repairs to complete roof replacements, we handle it all with precision and care.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((s) => (
              <div key={s.title} className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg overflow-hidden card-hover">
                <div className="h-48 overflow-hidden">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <s.icon className="text-red-600 h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-medium tracking-tight text-slate-800">{s.title}</h3>
                  </div>
                  <p className="text-base leading-relaxed text-slate-600">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 fill-yellow-500 text-yellow-500" />)}
              </div>
              <span className="text-2xl font-bold text-slate-900">4.9/5</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">What Our Clients Say</h2>
            <p className="text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
              Trusted by thousands of homeowners across Canada for quality roofing services.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r) => (
              <div key={r.name} className="bg-slate-50 border border-slate-100 p-8 rounded-lg testimonial-card">
                <Quote className="text-red-600 h-8 w-8 mb-4" />
                <div className="mb-4"><Stars count={r.rating} /></div>
                <p className="text-base leading-relaxed text-slate-700 mb-6">"{r.review}"</p>
                <div className="flex items-center gap-4">
                  <img src={r.image} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-slate-900">{r.name}</p>
                    <p className="text-sm text-slate-500">{r.location}</p>
                    <p className="text-xs text-red-600 mt-1">{r.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">Areas We Serve</h2>
            <p className="text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
              Providing professional roofing services across Southern Ontario
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {areas.map((a) => (
              <div key={a.city} className="bg-white border border-slate-200 p-6 rounded-lg text-center card-hover">
                <div className="text-4xl mb-3">{a.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900">{a.city}</h3>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">Don't see your city listed?</p>
            <a href="#" className="text-red-600 font-medium hover:text-red-700 transition-colors">
              Contact us to check if we serve your area →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">Ready to Get Started?</h2>
          <p className="text-base leading-relaxed text-slate-300 mb-8 max-w-2xl mx-auto">
            Contact us today for a free, no-obligation quote. Our team is ready to help protect your home.
          </p>
          <a href="#" className="inline-block bg-red-600 text-white font-medium hover:bg-red-700 transition-colors px-8 py-4 rounded-md shadow-sm">
            Get Free Quote
          </a>
        </div>
      </section>
    </div>
  );
}
