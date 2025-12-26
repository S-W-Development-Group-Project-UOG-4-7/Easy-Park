<<<<<<< HEAD
import Link from 'next/link';
import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-[#F3F4F6] to-[#E5E7EB] dark:from-[#0F172A] dark:via-[#0A0F1C] dark:to-[#020617] transition-colors duration-300">
      <Navbar />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-lime-400 via-lime-300 to-lime-400 bg-clip-text text-transparent animate-pulse">
              EasyPark
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
              Your Smart Parking Solution
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Book your parking slots online with ease. Choose from EV slots, Car Wash slots, or Normal parking spaces.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/customer/view-bookings"
              className="px-8 py-4 bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Book Now →
            </Link>
            <Link
              href="/customer/my-bookings"
              className="px-8 py-4 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-slate-600"
            >
              My Bookings
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#0A0F1C] rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-3xl mb-3">🚗</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Easy Booking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Quick and simple slot selection process</p>
            </div>
            <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#0A0F1C] rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">EV Charging</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Dedicated slots for electric vehicles</p>
            </div>
            <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#0A0F1C] rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-3xl mb-3">🧼</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Car Wash</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Premium slots with car wash service</p>
            </div>
          </div>
        </div>
      </main>
=======
import Image from "next/image";
import Link from "next/link";
import { Navigation } from "./components/Navigation";

const stats = [
  { label: "Parking Spots", value: "10,000+" },
  { label: "Cities", value: "50+" },
  { label: "Happy Users", value: "100K+" },
];

const steps = [
  { title: "Search Location", icon: "M4 11h16M12 3v6m0 6v6" },
  { title: "Select Time & Date", icon: "M6 8h12M8 4h8M7 12h10M9 16h6" },
  { title: "Park Your Car", icon: "M5 16h14l-1.5-7H6.5L5 16Z" },
  { title: "Enjoy Your Day", icon: "M12 4v9m0 0-3-3m3 3 3-3M4 20h16" },
];

const gallery = [
  { title: "City Center", subtitle: "Premium downtown hubs" },
  { title: "Smart Technology", subtitle: "Sensors & automation" },
  { title: "Indoor Garage", subtitle: "Secure multi-level" },
  { title: "Outdoor Lot", subtitle: "Wide & accessible" },
];

const contactInfo = [
  { title: "Hotline", value: "24/7 Priority Support" },
  { title: "Telephone", value: "+1 (800) 555-0182" },
  { title: "E-mail", value: "hello@easypark.com" },
  { title: "Address", value: "1200 Market St, San Francisco, CA" },
];

const badges = [
  "Trusted by 100K+ Users",
  "Award-Winning Service",
  "Instant Confirmation",
  "Eco-Friendly Operations",
];

const features = [
  { title: "Secure & Safe", subtitle: "24/7 monitoring and insured lots." },
  { title: "Save Time", subtitle: "Reserve ahead and skip circling blocks." },
  { title: "Best Prices", subtitle: "Transparent rates without surprises." },
  { title: "Customer Support", subtitle: "Real people when you need help." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <Navigation />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <section
          id="home"
          className="grid scroll-mt-24 items-center gap-12 lg:grid-cols-2 lg:gap-16"
        >
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#1E293B]/60 to-[#0F172A]/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 ring-1 ring-slate-700 backdrop-blur">
                Find & Reserve Parking Spots Instantly
              </span>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                Smart Parking Made Simple
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                EasyPark connects you to thousands of secure parking spots
                across the city. Search, reserve, and park with real-time
                availability and instant confirmation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264] px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-200/60 transition hover:-translate-y-0.5 hover:shadow-lime-300/70 focus:outline-none focus:ring-2 focus:ring-lime-300"
              >
                Get Started
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-lime-300 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                Talk to Us
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 p-4 shadow-lg ring-1 ring-slate-900/60 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <p className="text-sm font-medium text-slate-300">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] border border-slate-800/70 bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 p-6 shadow-2xl ring-1 ring-slate-900/60 backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#84CC16_0%,transparent_35%)] opacity-30" />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      Premium Garage
                    </p>
                    <h3 className="text-2xl font-semibold text-white">
                      Downtown Hub
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Secure, monitored, and EV-ready.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-[#84CC16] to-[#BEF264] p-3 text-slate-900 shadow-inner shadow-lime-200/60">
                    <svg
                      className="h-7 w-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M5 16h14l-1.5-7H6.5L5 16Z" />
                      <path d="M7 16v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
                      <path d="M9 11h6" />
                    </svg>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/60 bg-[#0F172A]/80 p-4 shadow-lg ring-1 ring-slate-900/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#84CC16] to-[#BEF264] text-slate-900">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M5 12h4l2 5 2-10 2 5h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                        Availability
                      </p>
                      <div className="mt-1 flex items-center justify-between text-sm font-semibold text-white">
                        <span>Real-time spots</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                        24/7 open
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="space-y-10 scroll-mt-24 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
            <p className="text-base text-slate-300">
              Four simple steps to reserve your perfect parking spot.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="group rounded-3xl border border-slate-800/70 bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 p-6 text-left shadow-lg ring-1 ring-slate-900/60 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#84CC16] to-[#BEF264] text-slate-900 shadow-inner shadow-lime-200/60 transition group-hover:scale-105">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d={step.icon} />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Seamless flow designed to get you parked faster than ever.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="space-y-8 scroll-mt-24">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold text-white">Our Parking Locations</h2>
            <p className="text-base text-slate-300">
              Explore modern, secure spaces built for every journey.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {gallery.map((item, idx) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-800/70 bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 shadow-xl ring-1 ring-slate-900/60 backdrop-blur transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20 opacity-60 transition duration-300 group-hover:opacity-40" />
                <div className="h-40 w-full bg-gradient-to-br from-slate-800 to-slate-900" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#84CC16_0%,transparent_40%)] opacity-30" />
                <div className="relative space-y-1 p-5">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-300">{item.subtitle}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264]" />
                    Premium
                  </div>
                </div>
                <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F172A]/80 text-white shadow-md ring-1 ring-slate-900/60 backdrop-blur">
                  <span className="text-sm font-semibold">0{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="scroll-mt-24 rounded-[28px] border border-slate-800/70 bg-gradient-to-br from-[#0F172A] to-[#020617] p-8 shadow-2xl ring-1 ring-slate-900/60"
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">
                  Get In Touch
                </p>
                <h2 className="text-3xl font-bold text-white">Contact Us</h2>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur">
                <div className="space-y-4">
                  {contactInfo.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/5 bg-[#0B1220]/60 p-4 text-white shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-slate-900">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M5 4h14v16H5z" />
                            <path d="M8 8h8M8 12h8M8 16h4" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">
                            {item.title}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl shadow-black/30">
              <iframe
                title="LNBTI Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.3773226315598!2d79.93389307646132!3d6.8452892931529385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae250799e3dd38f%3A0xf3161192fd56fd2c!2sLNBTI%20-%20Japanese%20IT%20University%20(%20Main%20Campus%20)!5e0!3m2!1sen!2slk!4v1765794165938!5m2!1sen!2slk"
                className="block h-[320px] w-full border-0 md:h-[380px] lg:h-[530px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="grid scroll-mt-24 gap-10 lg:grid-cols-2 lg:gap-14"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">
                About EasyPark
              </p>
              <h2 className="text-3xl font-bold text-white">
                Built for drivers, powered by technology.
              </h2>
              <p className="text-base text-slate-300">
                EasyPark delivers a frictionless parking experience with live
                availability, secure payments, and guided navigation to your
                reserved spot.
              </p>
              <p className="text-base text-slate-300">
                Our network spans premium garages, indoor/outdoor lots, and
                EV-ready stations—bringing reliability to every trip.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-slate-800 bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 px-4 py-2 text-sm font-semibold text-slate-100 shadow-sm ring-1 ring-slate-900/60 backdrop-blur"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] border border-slate-800/70 bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 p-6 shadow-2xl ring-1 ring-slate-900/60 backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#84CC16_0%,transparent_40%)] opacity-30" />
              <div className="relative flex h-64 flex-col items-center justify-center">
                <div className="absolute inset-6 rounded-3xl border-2 border-dashed border-slate-700" />xxxx
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#84CC16] to-[#BEF264] text-slate-900 shadow-xl shadow-lime-200/60">
                  <svg
                    className="h-12 w-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M7 15h10l-1-5H8l-1 5Z" />
                    <path d="M9 10V7a3 3 0 0 1 6 0v3" />
                    <path d="M12 3v2" />
                  </svg>
                </div>
                <p className="mt-6 text-center text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Modern Automotive UI
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 p-5 shadow-lg ring-1 ring-slate-900/60 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#84CC16] to-[#BEF264] text-slate-900 shadow-inner shadow-lime-200/60">
                <span className="text-sm font-bold">★</span>
              </div>
              <p className="text-lg font-semibold text-white">{feature.title}</p>
              <p className="mt-2 text-sm text-slate-300">{feature.subtitle}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mt-12 border-t border-slate-900 bg-[#000000] py-8 text-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#84CC16] to-[#BEF264] text-slate-900 shadow-lg shadow-lime-200/60">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M5 16h14l-1.5-7H6.5L5 16Z" />
                <path d="M7 16v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">EasyPark</span>
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                Parking Made Simple
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-300">
            <Link href="#home" className="hover:text-lime-300">
              Home
            </Link>
            <Link href="#how-it-works" className="hover:text-lime-300">
              How It Works
            </Link>
            <Link href="#gallery" className="hover:text-lime-300">
              Gallery
            </Link>
            <Link href="#contact" className="hover:text-lime-300">
              Contact
            </Link>
            <Link href="#about" className="hover:text-lime-300">
              About
            </Link>
          </div>
          <p className="text-sm font-semibold text-slate-400">© 2025 EasyPark</p>
        </div>
      </footer>
>>>>>>> d9e2d7111374b6e76e3dbc20add936cf18c5bf86
    </div>
  );
}
