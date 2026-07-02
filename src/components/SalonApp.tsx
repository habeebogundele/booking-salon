'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TIME_SLOTS } from '@/lib/schedule';
import {
  Phone,
  Instagram,
  MapPin,
  Calendar,
  Droplet,
  Leaf,
  Sparkles,
  Trees,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Clock,
  User,
  Mail,
  ChevronLeft,
} from 'lucide-react';

// --- Types ---

type BookingStep = 'service' | 'datetime' | 'details' | 'success';

interface BookingData {
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

// --- Components ---

const BookingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState<BookingStep>('service');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<
    { time: string; available: boolean }[]
  >([]);
  const [dateOpen, setDateOpen] = useState(true);
  const [data, setData] = useState<BookingData>({
    service: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
  });

  const services = [
    { id: 'wash', title: 'Wash & Deep Conditioning', icon: <Droplet size={20} />, price: '₦5,000+' },
    { id: 'detangle', title: 'Detangling Session', icon: <CheckCircle2 size={20} />, price: '₦3,000+' },
    { id: 'protective', title: 'Protective Styling', icon: <ShieldCheck size={20} />, price: '₦10,000+' },
    { id: 'treatment', title: 'Natural Hair Treatment', icon: <Leaf size={20} />, price: '₦7,000+' },
  ];

  const timeSlots = [...TIME_SLOTS];

  useEffect(() => {
    if (!data.date) {
      setSlotAvailability([]);
      setDateOpen(true);
      return;
    }

    let cancelled = false;

    async function fetchAvailability() {
      setSlotsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookings/availability?date=${data.date}`);
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload?.error ?? 'Unable to load available times.');
        }

        if (!cancelled) {
          setDateOpen(payload.open);
          setSlotAvailability(payload.slots ?? []);
          setData((prev) => {
            if (!payload.open || !payload.slots?.some((s: { available: boolean }) => s.available)) {
              return { ...prev, time: '' };
            }
            if (prev.time && !payload.slots.find((s: { time: string; available: boolean }) => s.time === prev.time && s.available)) {
              return { ...prev, time: '' };
            }
            return prev;
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load available times.');
          setSlotAvailability([]);
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    fetchAvailability();
    return () => { cancelled = true; };
  }, [data.date]);

  const resetAndClose = () => {
    setStep('service');
    setError(null);
    setEmailSent(false);
    setSlotAvailability([]);
    setDateOpen(true);
    setData({ service: '', date: '', time: '', name: '', email: '', phone: '' });
    onClose();
  };

  const nextStep = () => {
    if (step === 'service') setStep('datetime');
    else if (step === 'datetime') setStep('details');
  };

  const prevStep = () => {
    if (step === 'datetime') setStep('service');
    else if (step === 'details') setStep('datetime');
  };

  const submitBooking = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        if (res.status === 409 && data.date) {
          const availRes = await fetch(`/api/bookings/availability?date=${data.date}`);
          const avail = await availRes.json().catch(() => null);
          if (avail?.slots) {
            setSlotAvailability(avail.slots);
            setData((prev) => ({ ...prev, time: '' }));
          }
        }
        throw new Error(payload?.error ?? 'Unable to confirm your appointment.');
      }

      const payload = await res.json();
      setEmailSent(Boolean(payload?.emailSent));
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={resetAndClose}
        className="absolute inset-0 bg-brand-green/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-brand-beige w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-brand-green/5 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
            {step !== 'service' && step !== 'success' && (
              <button
                onClick={prevStep}
                className="w-10 h-10 rounded-full border border-brand-green/10 flex items-center justify-center text-brand-green hover:bg-brand-beige transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h3 className="text-2xl font-serif text-brand-green">
                {step === 'service' && 'Select Service'}
                {step === 'datetime' && 'Pick Date & Time'}
                {step === 'details' && 'Your Information'}
                {step === 'success' && 'Confirmed!'}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">
                {step === 'success' ? 'Appointment Secured' : `Step ${step === 'service' ? 1 : step === 'datetime' ? 2 : 3} of 3`}
              </p>
            </div>
          </div>
          <button onClick={resetAndClose} className="text-brand-green hover:rotate-90 transition-transform p-2">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {step === 'service' && (
              <motion.div
                key="service"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-4"
              >
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setData({ ...data, service: s.title });
                      nextStep();
                    }}
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left ${data.service === s.title ? 'border-brand-green bg-brand-green/5' : 'border-brand-green/5 bg-white hover:border-brand-green/20'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-beige rounded-xl flex items-center justify-center text-brand-green">
                        {s.icon}
                      </div>
                      <div>
                        <p className="font-serif text-lg text-brand-green">{s.title}</p>
                        <p className="text-xs text-brand-dark/50">Starting from {s.price}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-brand-gold" />
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'datetime' && (
              <motion.div
                key="datetime"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <label className="block text-sm font-bold uppercase tracking-widest text-brand-gold mb-3">Preferred Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value, time: '' })}
                    className="w-full p-4 rounded-xl border-2 border-brand-green/10 focus:border-brand-green bg-white outline-hidden font-sans uppercase tracking-widest text-sm"
                  />
                </div>

                {!dateOpen && data.date && (
                  <p className="mb-6 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
                    The salon is closed on this day. Please choose another date.
                  </p>
                )}

                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-brand-gold mb-4">Available Slots</label>
                  {slotsLoading ? (
                    <p className="text-sm text-brand-dark/50">Loading available times…</p>
                  ) : !data.date ? (
                    <p className="text-sm text-brand-dark/50">Select a date to see available times.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(slotAvailability.length > 0 ? slotAvailability : timeSlots.map((t) => ({ time: t, available: true }))).map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available || !dateOpen}
                          onClick={() => setData({ ...data, time: slot.time })}
                          className={`p-4 rounded-xl border-2 font-medium transition-all ${
                            !slot.available || !dateOpen
                              ? 'bg-brand-beige/50 text-brand-dark/30 border-brand-green/5 cursor-not-allowed line-through'
                              : data.time === slot.time
                                ? 'bg-brand-green text-brand-beige border-brand-green'
                                : 'bg-white text-brand-green border-brand-green/10 hover:border-brand-green/30'
                          }`}
                        >
                          {slot.time}
                          {!slot.available && (
                            <span className="block text-[10px] mt-1 no-underline normal-case tracking-wide opacity-60">Booked</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {error && step === 'datetime' && (
                  <p className="mt-6 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
                    {error}
                  </p>
                )}

                <button
                  disabled={!data.date || !data.time || !dateOpen || slotsLoading}
                  onClick={nextStep}
                  className="w-full mt-10 bg-brand-green text-brand-beige py-5 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-brand-green/90 transition-all shadow-lg"
                >
                  Continue to Details
                </button>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                    <User size={14} /> Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full p-4 rounded-xl border-2 border-brand-green/10 focus:border-brand-green bg-white outline-hidden"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                    <Mail size={14} /> Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full p-4 rounded-xl border-2 border-brand-green/10 focus:border-brand-green bg-white outline-hidden"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
                    <Phone size={14} /> Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0812 345 6789"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    className="w-full p-4 rounded-xl border-2 border-brand-green/10 focus:border-brand-green bg-white outline-hidden"
                  />
                </div>

                <div className="p-6 bg-brand-green/5 rounded-2xl border border-brand-green/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-green mb-4 border-b border-brand-green/10 pb-2">Summary</h4>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-brand-dark/50">Service:</span>
                    <span className="font-serif text-brand-green">{data.service}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-dark/50">Schedule:</span>
                    <span className="font-sans font-medium text-brand-green uppercase tracking-wider">{data.date} @ {data.time}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
                    {error}
                  </p>
                )}

                <button
                  disabled={!data.name || !data.email || !data.phone || submitting}
                  onClick={submitBooking}
                  className="w-full mt-4 bg-brand-green text-brand-beige py-5 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-brand-green/90 transition-all shadow-lg"
                >
                  {submitting ? 'Confirming…' : 'Confirm Appointment'}
                </button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-24 h-24 bg-brand-gold rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-4xl font-serif text-brand-green mb-4">You&apos;re all set!</h3>
                <p className="text-brand-dark/60 leading-relaxed mb-10 max-w-sm mx-auto">
                  We&apos;ve received your request for{' '}
                  <span className="font-bold text-brand-green">{data.service}</span>.
                  {emailSent ? (
                    <>
                      {' '}A confirmation email has been sent to{' '}
                      <span className="font-bold text-brand-green">{data.email}</span>.
                    </>
                  ) : (
                    <>
                      {' '}We&apos;ll contact you at{' '}
                      <span className="font-bold text-brand-green">{data.email}</span> to confirm your appointment.
                    </>
                  )}
                </p>
                <button
                  onClick={resetAndClose}
                  className="px-10 py-4 bg-brand-green text-brand-beige rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Return to Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ onOpenBooking, onNavigate }: { onOpenBooking: () => void; onNavigate: (v: 'home' | 'privacy' | 'terms') => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    onNavigate('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-beige/95 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-brand-beige">
            <Trees size={20} />
          </div>
          <div>
            <span className="block text-xl font-serif font-bold tracking-tight text-brand-green leading-none">NATURALLY</span>
            <span className="block text-sm script-text text-brand-gold -mt-1 font-bold">Rooted</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-[0.2em] text-brand-dark/80">
          <button onClick={() => scrollTo('services')} className="hover:text-brand-green transition-colors">Services</button>
          <button onClick={() => scrollTo('about')} className="hover:text-brand-green transition-colors">Our Ethos</button>
          <button onClick={() => scrollTo('contact')} className="hover:text-brand-green transition-colors">Contact</button>
          <button
            onClick={onOpenBooking}
            className="bg-brand-green text-brand-beige px-6 py-2.5 rounded-full hover:bg-brand-gold hover:text-white transition-all shadow-md active:scale-95"
          >
            Book Now
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-brand-green" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-brand-beige border-b border-brand-green/10 md:hidden flex flex-col p-8 gap-6 shadow-2xl"
          >
            <button onClick={() => scrollTo('services')} className="text-2xl font-serif text-brand-green border-b border-brand-green/5 pb-4 text-left">Services</button>
            <button onClick={() => scrollTo('about')} className="text-2xl font-serif text-brand-green border-b border-brand-green/5 pb-4 text-left">Our Ethos</button>
            <button onClick={() => scrollTo('contact')} className="text-2xl font-serif text-brand-green border-b border-brand-green/5 pb-4 text-left">Contact</button>
            <button onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }} className="bg-brand-green text-brand-beige text-center py-5 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl">Book Appointment</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onOpenBooking }: { onOpenBooking: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1621243804936-775306a8f2e3?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=1200',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl animate-pulse" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-[0.3em] rounded-full mb-6">
            Natural Hair Salon & Boutique
          </span>
          <h1 className="text-6xl md:text-8xl font-serif text-brand-green leading-[1.1] mb-6">
            Healthy Hair <br />
            <span className="script-text text-brand-gold font-normal italic lowercase">starts here</span>
          </h1>
          <p className="text-xl text-brand-dark/70 max-w-md mb-10 leading-relaxed font-medium">
            Discover the pinnacle of organic hair care. Expert styling that respects your roots.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button
              onClick={onOpenBooking}
              className="bg-brand-green text-brand-beige px-12 py-6 rounded-full text-lg font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3 group"
            >
              Book My Consultation
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-14 h-14 rounded-full border-4 border-brand-beige bg-brand-gold/20 overflow-hidden shrink-0 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=natural-${i + 10}`}
                    alt="Customer"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex text-brand-gold gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => <Sparkles key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-brand-dark/80 font-bold tracking-tight uppercase text-xs">5-Star Studio Experience</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(45,74,62,0.3)] border-[16px] border-white/80">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 1.5, ease: 'circOut' }}
                src={slides[currentSlide]}
                alt="Natural Hair Mastery"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-green/60 via-transparent to-transparent" />

            <div className="absolute bottom-12 left-12 right-12 z-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={currentSlide}
                className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl"
              >
                <p className="text-white text-xl italic serif-text font-light leading-relaxed">
                  {currentSlide === 0 && 'Your crown, our craft. Personalized attention for every strand.'}
                  {currentSlide === 1 && 'Organic blends for growth and unparalleled moisture retention.'}
                  {currentSlide === 2 && 'Beautiful styling that protects the future of your hair.'}
                </p>
              </motion.div>
            </div>

            {/* Slider dots */}
            <div className="absolute top-1/2 -right-8 -translate-y-1/2 flex flex-col gap-4 z-30">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-brand-gold h-10' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>

          <motion.div
            animate={{ rotate: [10, -10, 10] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-gold rounded-[3rem] flex flex-col items-center justify-center text-brand-beige shadow-[0_20px_50px_rgba(163,140,93,0.4)] z-30 border-8 border-brand-beige"
          >
            <span className="text-[14px] font-black uppercase tracking-[0.4em] mb-2">Organic</span>
            <span className="text-4xl font-serif italic">Beauty</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Services = ({ onOpenBooking }: { onOpenBooking: () => void }) => {
  const services = [
    {
      icon: <Droplet className="text-brand-green" />,
      title: 'Wash & Deep Conditioning',
      desc: 'Cleanse, hydrate and nourish your natural hair with our specialized organic blends.',
    },
    {
      icon: <CheckCircle2 className="text-brand-green" />,
      title: 'Detangling Sessions',
      desc: 'Gentle care for strong, healthy strands. We take the pain out of natural hair maintenance.',
    },
    {
      icon: <ShieldCheck className="text-brand-green" />,
      title: 'Protective Styling',
      desc: 'Beautiful styles that protect your hair and promote natural growth cycles.',
    },
    {
      icon: <Leaf className="text-brand-green" />,
      title: 'Natural Hair Treatments',
      desc: 'Targeted treatments specifically for growth, moisture balance, and scalp health.',
    },
  ];

  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black text-brand-gold uppercase tracking-[0.4em] mb-4">The Menu</h2>
          <h3 className="text-5xl md:text-6xl font-serif text-brand-green mb-6">Our Services</h3>
          <div className="w-24 h-1.5 bg-brand-gold mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={onOpenBooking}
              className="p-10 rounded-[3rem] bg-brand-beige/20 border border-brand-green/5 hover:bg-white hover:shadow-2xl hover:shadow-brand-green/10 transition-all group cursor-pointer"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand-green group-hover:text-white transition-colors duration-500">
                {React.cloneElement(s.icon as React.ReactElement<{ className?: string }>, { className: 'group-hover:text-white transition-colors' })}
              </div>
              <h4 className="text-2xl font-serif text-brand-green mb-4 group-hover:text-brand-gold transition-colors">{s.title}</h4>
              <p className="text-brand-dark/70 leading-relaxed text-base mb-6">{s.desc}</p>
              <div className="flex items-center gap-2 text-brand-green font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Book This <ChevronRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Ethos = () => {
  const values = [
    { title: 'No Harsh Chemicals', sub: 'Just natural, healthy care.' },
    { title: 'All Hair Types', sub: '4C friendly & beginner friendly.' },
    { title: 'Gentle & Professional', sub: "You're in safe hands." },
    { title: 'Focused on Growth', sub: 'Long term results, not just styles.' },
  ];

  return (
    <section id="about" className="py-24 bg-brand-green text-brand-beige overflow-hidden relative">
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <Trees size={600} strokeWidth={0.5} />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-black text-brand-gold uppercase tracking-[0.4em] mb-4">Our Core Values</h2>
          <h3 className="text-5xl md:text-6xl font-serif mb-8 text-white leading-tight">Crafting Beauty, <br /> Naturally.</h3>
          <p className="text-brand-beige/80 text-xl leading-relaxed mb-12 max-w-xl italic serif-text">
            &quot;We believe that natural hair is a crown to be celebrated. Our approach combines traditional wisdom with modern organic science to ensure your hair receives the best possible care.&quot;
          </p>

          <div className="grid sm:grid-cols-2 gap-10">
            {values.map((v, i) => (
              <div key={i} className="flex gap-5 group">
                <div className="mt-1 shrink-0">
                  <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all">
                    <UserCheck size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="font-serif text-2xl border-b border-brand-gold/30 pb-3 mb-3 text-white">{v.title}</h4>
                  <p className="text-brand-beige/60 text-sm font-medium tracking-wide">{v.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative pt-12 lg:pt-0"
        >
          <div className="aspect-square bg-brand-gold/10 rounded-[4rem] p-6 lg:p-10 border border-white/10 shadow-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800"
              alt="Salon Care"
              className="w-full h-full object-cover rounded-[3rem] shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Floating badge */}
          <div className="absolute top-0 -left-6 bg-white p-8 rounded-[2.5rem] shadow-2xl flex items-center gap-5 border border-brand-green/5">
            <div className="w-14 h-14 bg-brand-gold text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-brand-dark text-[10px] font-black uppercase tracking-[0.2em] mb-1">Clinic Status</p>
              <p className="text-brand-green font-serif text-2xl font-bold">Open Daily</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Contact = ({ onOpenBooking }: { onOpenBooking: () => void }) => {
  return (
    <section id="contact" className="py-24 bg-brand-beige/30 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 border border-brand-green/5">
          <div className="p-10 lg:p-20">
            <h2 className="text-sm font-black text-brand-gold uppercase tracking-[0.4em] mb-4">Talk to us</h2>
            <h3 className="text-5xl font-serif text-brand-green mb-12">Connect With <br /> The Studio</h3>

            <div className="space-y-10">
              <a href="tel:08107651999" className="flex items-center gap-8 group">
                <div className="w-16 h-16 bg-brand-beige rounded-3xl flex items-center justify-center text-brand-green shrink-0 group-hover:bg-brand-green group-hover:text-white transition-all shadow-sm">
                  <Phone size={28} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-gold mb-1">Direct Hotline</p>
                  <p className="text-2xl font-serif text-brand-dark group-hover:text-brand-green transition-colors">0810 765 1999</p>
                  <p className="text-sm text-brand-dark/40 font-medium font-sans">Available 9am — 6pm</p>
                </div>
              </a>

              <a href="https://instagram.com/naturallyrooted_salon" target="_blank" rel="noreferrer" className="flex items-center gap-8 group">
                <div className="w-16 h-16 bg-brand-beige rounded-3xl flex items-center justify-center text-brand-green shrink-0 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
                  <Instagram size={28} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-gold mb-1">Our Portfolio</p>
                  <p className="text-2xl font-serif text-brand-dark group-hover:text-brand-green transition-colors">@naturallyrooted_salon</p>
                </div>
              </a>

              <div className="flex items-center gap-8 group">
                <div className="w-16 h-16 bg-brand-beige rounded-3xl flex items-center justify-center text-brand-green shrink-0 shadow-sm">
                  <MapPin size={28} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-gold mb-1">Location</p>
                  <p className="text-2xl font-serif text-brand-dark">UI, Ibadan</p>
                  <p className="text-sm text-brand-dark/40 font-medium">The Premium Hair Destination</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-green p-12 lg:p-20 flex flex-col justify-center items-center text-center text-brand-beige relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-[5s]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1610444558832-610abb9435b5?auto=format&fit=crop&q=80&w=1000"
                alt="Background Pattern"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-brand-gold rounded-full flex items-center justify-center text-white mx-auto mb-10 shadow-3xl animate-bounce-slow">
                <Calendar size={36} />
              </div>
              <h4 className="text-5xl font-serif mb-6 text-white leading-tight">Ready to <br /> Thrive?</h4>
              <p className="text-brand-beige/70 mb-12 max-w-sm mx-auto text-lg italic serif-text">
                &quot;Experience professional hair care that prioritizes your scalp health and hair growth.&quot;
              </p>
              <button
                onClick={onOpenBooking}
                className="bg-brand-gold text-brand-beige px-14 py-6 rounded-full text-xl font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-brand-green transition-all shadow-2xl active:scale-95"
              >
                Secure My Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onNavigate }: { onNavigate: (v: 'home' | 'privacy' | 'terms') => void }) => {
  const scrollTo = (id: string) => {
    onNavigate('home');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-brand-dark text-brand-beige/40 py-20 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-16 items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-green text-brand-beige rounded-2xl flex items-center justify-center shadow-lg">
              <Trees size={24} />
            </div>
            <div>
              <span className="block text-2xl font-serif font-bold text-white leading-none uppercase tracking-tighter">NATURALLY rooted</span>
              <span className="block text-[10px] uppercase tracking-[0.4em] mt-1 font-black text-brand-gold">Ibadan&apos;s Finest</span>
            </div>
          </div>

          <div className="flex justify-center gap-12 font-bold text-[10px] uppercase tracking-[0.4em]">
            <button onClick={() => scrollTo('services')} className="hover:text-white transition-colors">Services</button>
            <button onClick={() => scrollTo('about')} className="hover:text-white transition-colors">Ethos</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-white transition-colors">Contact</button>
          </div>

          <div className="flex justify-end gap-6">
            <a href="https://instagram.com/naturallyrooted_salon" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-green hover:text-white transition-all group">
              <Instagram size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="tel:08107651999" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-green hover:text-white transition-all group">
              <Phone size={20} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5 text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.2em] font-medium">
            &copy; {new Date().getFullYear()} Naturally Rooted Salon. Designed for Excellence.
          </p>
          <div className="flex gap-8 text-[10px] uppercase font-black tracking-widest">
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms of Care</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const BeforeAfterSlider = () => {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div
      className="relative w-full aspect-video rounded-[3rem] overflow-hidden group cursor-ew-resize select-none border-8 border-white shadow-2xl mb-16"
      onMouseMove={(e) => {
        if (e.buttons === 1) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          setSliderPos(Math.min(Math.max(x, 0), 100));
        }
      }}
      onTouchMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        setSliderPos(Math.min(Math.max(x, 0), 100));
      }}
    >
      {/* Before (Right) */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=1200"
          alt="Before"
          className="w-full h-full object-cover grayscale brightness-75"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-8 right-8 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white uppercase font-black tracking-[0.3em] border border-white/20">Neglected</div>
      </div>

      {/* After (Left) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=1200"
          alt="After"
          className="h-full object-cover max-w-none"
          style={{ width: `calc(100vw * 100 / ${sliderPos})` }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-8 left-8 bg-brand-gold backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white uppercase font-black tracking-[0.3em] border border-white/20 shadow-xl font-sans">Nourished</div>
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center z-10"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-brand-green absolute">
          <div className="flex items-center gap-1">
            <ChevronLeft size={16} className="text-brand-gold" />
            <ChevronRight size={16} className="text-brand-gold" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivacyPolicy = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-32 pb-24 px-6 max-w-4xl mx-auto"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-brand-gold font-bold uppercase tracking-widest mb-12 hover:translate-x-2 transition-transform group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <section className="bg-white rounded-[4rem] p-10 md:p-20 shadow-[0_40px_100px_-20px_rgba(45,74,62,0.15)] border border-brand-green/5 overflow-hidden">
        <h1 className="text-5xl md:text-7xl font-serif text-brand-green mb-12">Privacy Policy</h1>

        <BeforeAfterSlider />

        <div className="prose prose-brand-green max-w-none space-y-10 text-brand-dark/70">
          <p className="text-xl serif-text italic text-brand-green">At Naturally Rooted, your privacy is as precious as your curls. This policy outlines how we handle your personal data when you book a session or interact with our studio.</p>

          <div>
            <h2 className="text-2xl font-serif text-brand-green mb-4">1. Information We Collect</h2>
            <p>To provide personalized hair care, we collect your name, phone number, and email. During consultations, we may also note hair history and preferences to ensure optimal results.</p>
          </div>

          <div>
            <h2 className="text-2xl font-serif text-brand-green mb-4">2. How We Use Your Data</h2>
            <p>Your details are used exclusively for booking confirmations, growth track monitoring, and studio updates. We never sell or share your information with third-party marketers.</p>
          </div>

          <div>
            <h2 className="text-2xl font-serif text-brand-green mb-4">3. Security</h2>
            <p>All digital records are encrypted and stored securely. Physical consultation notes are kept in an authorized-access-only area of our Ibadan studio.</p>
          </div>

          <div className="pt-8 border-t border-brand-green/10">
            <p className="text-sm font-medium">Last updated: May 2026. For questions, contact privacy@naturallyrooted.com</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const TermsOfCare = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-32 pb-24 px-6 max-w-4xl mx-auto"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-brand-gold font-bold uppercase tracking-widest mb-12 hover:translate-x-2 transition-transform group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <section className="bg-white rounded-[4rem] p-10 md:p-20 shadow-[0_40px_100px_-20px_rgba(45,74,62,0.15)] border border-brand-green/5 overflow-hidden">
        <h1 className="text-5xl md:text-7xl font-serif text-brand-green mb-12">Terms of Care</h1>

        <BeforeAfterSlider />

        <div className="prose prose-brand-green max-w-none space-y-10 text-brand-dark/70">
          <p className="text-xl serif-text italic text-brand-green whitespace-pre-line">Our studio is a sanctuary for healthy hair growth. By booking with us, you agree to our philosophy of patience, organic integrity, and professional respect.</p>

          <div>
            <h2 className="text-2xl font-serif text-brand-green mb-4">1. Booking & Cancellations</h2>
            <p>A non-refundable commitment fee matches our dedication to your hair. Cancellations must be made 24 hours in advance to reschedule without forfeit.</p>
          </div>

          <div>
            <h2 className="text-2xl font-serif text-brand-green mb-4">2. Hair History Disclosure</h2>
            <p>For your safety, you must disclose previous chemical treatments (relaxers, dyes, etc.) before any session. Naturally Rooted is not liable for complications arising from undisclosed hair history.</p>
          </div>

          <div>
            <h2 className="text-2xl font-serif text-brand-green mb-4">3. The Natural Cycle</h2>
            <p>We focus on growth and health. Results vary based on individual hair cycles and post-salon maintenance routines which are your responsibility to follow.</p>
          </div>

          <div className="pt-8 border-t border-brand-green/10">
            <p className="text-sm font-medium">By entering the studio, you trust our hands with your crown.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default function SalonApp() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [view, setView] = useState<'home' | 'privacy' | 'terms'>('home');

  // Handle cross-navigation scrolling
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  return (
    <div className="relative selection:bg-brand-gold/30 selection:text-brand-green bg-brand-beige min-h-screen">
      <Navbar
        onOpenBooking={() => setIsBookingOpen(true)}
        onNavigate={(v) => setView(v)}
      />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Hero onOpenBooking={() => setIsBookingOpen(true)} />

            {/* Trust bar */}
            <div className="bg-brand-green py-10 overflow-hidden whitespace-nowrap border-y border-white/5 relative z-10">
              <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="inline-flex gap-24"
              >
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex items-center gap-6 text-brand-beige text-sm font-bold uppercase tracking-[0.5em] opacity-40">
                    <Trees size={18} /> NATURALLY ROOTED SALON
                  </div>
                ))}
              </motion.div>
            </div>

            <Services onOpenBooking={() => setIsBookingOpen(true)} />
            <Ethos />
            <Contact onOpenBooking={() => setIsBookingOpen(true)} />
          </motion.div>
        )}

        {view === 'privacy' && <PrivacyPolicy key="privacy" onBack={() => setView('home')} />}
        {view === 'terms' && <TermsOfCare key="terms" onBack={() => setView('home')} />}
      </AnimatePresence>

      <Footer onNavigate={(v) => setView(v)} />

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
}
