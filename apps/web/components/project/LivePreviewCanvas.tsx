'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Send,
  Star,
  ChevronDown,
} from 'lucide-react';

interface LivePreviewProps {
  brandName?: string;
  projectGoal?: string;
  projectType?: string;
  activeSections: string[];
  files?: Array<{ path: string; language: string; content: string }>;
}

export function LivePreviewCanvas({
  brandName = 'AcmeStore',
  projectGoal = '',
  projectType = 'dynamic',
  activeSections,
  files = [],
}: LivePreviewProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [contactSent, setContactSent] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const htmlFile = files.find((f) => f.path.endsWith('.html') || f.path === 'index.html');
  const [previewMode, setPreviewMode] = useState<'auto' | 'iframe' | 'components'>('auto');

  const showIframe = (previewMode === 'iframe') || (previewMode === 'auto' && Boolean(htmlFile));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="work-card card-specular flex flex-col overflow-hidden border border-zinc-800">
      {/* Browser Chrome Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-950 px-4 py-2.5">
        {/* Window dots & URL */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-[11px] text-zinc-300">
            <span className="text-emerald-400">https://</span>
            <span>{brandName.toLowerCase()}.forgeos.preview</span>
          </div>
        </div>

        {/* Viewport Toggles & Actions */}
        <div className="flex items-center gap-2">
          {htmlFile && (
            <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setPreviewMode('iframe')}
                className={`rounded px-2 py-0.5 transition-colors ${
                  showIframe ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Live HTML Sandbox
              </button>
              <button
                onClick={() => setPreviewMode('components')}
                className={`rounded px-2 py-0.5 transition-colors ${
                  !showIframe ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Components
              </button>
            </div>
          )}

          <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-900 p-0.5">
            <button
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
              className={`rounded p-1 text-zinc-400 transition-colors ${
                viewport === 'desktop' ? 'bg-zinc-800 text-zinc-100' : 'hover:text-zinc-200'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              className={`rounded p-1 text-zinc-400 transition-colors ${
                viewport === 'tablet' ? 'bg-zinc-800 text-zinc-100' : 'hover:text-zinc-200'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
              className={`rounded p-1 text-zinc-400 transition-colors ${
                viewport === 'mobile' ? 'bg-zinc-800 text-zinc-100' : 'hover:text-zinc-200'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={handleRefresh}
            title="Reload Preview"
            className="rounded border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Simulated Render Canvas */}
      <div className="flex justify-center bg-zinc-950/60 p-4 min-h-[620px] overflow-y-auto">
        <div
          className={`${getViewportWidth()} transition-all duration-300 border border-zinc-800/80 bg-[#0d0d10] text-[#fafafa] rounded shadow-2xl flex flex-col`}
        >
          {showIframe && htmlFile ? (
            <div className="flex flex-col h-full min-h-[600px]">
              <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Sandboxed Static HTML Sandbox: {htmlFile.path}</span>
                <span className="text-emerald-400">Live Rendered</span>
              </div>
              <iframe
                title="Live Sandbox View"
                srcDoc={htmlFile.content}
                sandbox="allow-scripts allow-forms allow-same-origin"
                className="w-full flex-1 min-h-[580px] border-0 bg-white"
              />
            </div>
          ) : (
            <>
              {/* Rendered Navbar */}
              <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-[#0d0d10]/90 px-6 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-blue-500" />
              <span className="font-mono text-sm font-bold tracking-tight text-white">{brandName}</span>
            </div>
            <nav className="flex items-center gap-5 text-xs text-zinc-400 font-mono">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              {activeSections.includes('pricing') && (
                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              )}
              {activeSections.includes('contact') && (
                <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              )}
              {activeSections.includes('testimonials') && (
                <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              )}
            </nav>
            <button
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1 font-mono text-xs text-zinc-200 hover:bg-zinc-800"
            >
              Get Started
            </button>
          </header>

          {/* Rendered Hero */}
          <section className="px-6 py-16 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-[10px] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Agent Fleet Active • {projectType ? projectType.toUpperCase() : 'PRODUCTION'}</span>
            </div>
            <h1 className="mt-4 font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {brandName}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {projectGoal || 'Autonomous solution built with strict token compliance, verified by autonomous quality gates.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                className="rounded bg-blue-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors"
              >
                Explore Solution
              </button>
              <button className="rounded border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                Documentation →
              </button>
            </div>
          </section>

          {/* Rendered Feature Grid */}
          <section id="features" className="border-t border-zinc-800/80 px-6 py-12 bg-zinc-950/40">
            <div className="text-center mb-8">
              <h2 className="font-mono text-xl font-bold text-white">Core Architectural Capabilities</h2>
              <p className="text-xs text-zinc-400 mt-1">Four pillars generated by autonomous agents for {brandName}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
                <h3 className="font-mono text-xs font-semibold text-white">Domain-Specific Contracts</h3>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Strict type safety and verified interfaces tailored specifically to this project's requirements.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <CheckCircle2 className="h-5 w-5 text-blue-400 mb-2" />
                <h3 className="font-mono text-xs font-semibold text-white">Design Token Conformance</h3>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  WCAG AAA contrast verified with deterministic cryptographic version locking.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <Star className="h-5 w-5 text-purple-400 mb-2" />
                <h3 className="font-mono text-xs font-semibold text-white">Quality Assurance Gate</h3>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Zero rogue hex colors, verified component bounds, and test execution clearance.
                </p>
              </div>
            </div>
          </section>

          {/* Dynamic Section: Testimonials (if requested by developer) */}
          {activeSections.includes('testimonials') && (
            <section id="testimonials" className="border-t border-zinc-800/80 px-6 py-12 bg-zinc-900/30 animate-fadeIn">
              <div className="text-center mb-6">
                <span className="font-mono text-[10px] text-purple-400 uppercase tracking-widest font-semibold">
                  Customer Stories
                </span>
                <h2 className="font-mono text-xl font-bold text-white mt-1">Loved by 10,000+ Developers</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 space-y-2">
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                  <p className="text-xs text-zinc-300 italic">
                    "ForgeOS cut our product launch time from 3 months down to 4 days. The multi-agent workflow is like having a senior engineer on call 24/7."
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400">— Sarah Lin, CTO at TechVenture</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 space-y-2">
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                  <p className="text-xs text-zinc-300 italic">
                    "The design studio token lock guarantees no UI drift. Our frontends match our Figma specs with mathematical precision."
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400">— Alex Rivera, Lead Architect</p>
                </div>
              </div>
            </section>
          )}

          {/* Rendered Pricing */}
          {(activeSections.includes('pricing') || brandName.toLowerCase().includes('store') || brandName === 'AcmeStore') && (
            <section id="pricing" className="border-t border-zinc-800/80 px-6 py-12">
            <div className="text-center mb-6">
              <h2 className="font-mono text-xl font-bold text-white">Transparent Pricing</h2>
              <div className="mt-3 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 p-1 text-[11px] font-mono">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`rounded-full px-3 py-0.5 transition-colors ${
                    billingCycle === 'monthly' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`rounded-full px-3 py-0.5 transition-colors ${
                    billingCycle === 'yearly' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                  }`}
                >
                  Yearly (Save 20%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl mx-auto">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-mono text-xs font-semibold text-zinc-200">Developer Starter</h3>
                  <div className="mt-2 font-mono text-2xl font-bold text-white">
                    {billingCycle === 'monthly' ? '$29' : '$24'}<span className="text-xs text-zinc-500 font-normal">/mo</span>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-[11px] text-zinc-400 font-mono">
                    <li>✓ 4 Autonomous Fleet Roles</li>
                    <li>✓ 5 Active Sandboxed Runners</li>
                    <li>✓ Full Git Worktree Sync</li>
                  </ul>
                </div>
                <button
                  onClick={() => setCartCount((c) => c + 1)}
                  className="mt-5 w-full rounded border border-zinc-700 bg-zinc-800 py-1.5 font-mono text-xs text-white hover:bg-zinc-700"
                >
                  Select Plan
                </button>
              </div>

              <div className="rounded-lg border border-blue-600/80 bg-zinc-900 p-5 flex flex-col justify-between relative shadow-lg">
                <span className="absolute -top-2.5 right-4 rounded-full bg-blue-600 px-2 py-0.5 font-mono text-[9px] uppercase font-bold text-white">
                  POPULAR
                </span>
                <div>
                  <h3 className="font-mono text-xs font-semibold text-blue-400">Enterprise Team</h3>
                  <div className="mt-2 font-mono text-2xl font-bold text-white">
                    {billingCycle === 'monthly' ? '$99' : '$79'}<span className="text-xs text-zinc-500 font-normal">/mo</span>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-[11px] text-zinc-400 font-mono">
                    <li>✓ Unlimited Fleet Roles</li>
                    <li>✓ Dedicated Cloud Sandboxes</li>
                    <li>✓ Custom Policy Engine Gate</li>
                  </ul>
                </div>
                <button
                  onClick={() => setCartCount((c) => c + 1)}
                  className="mt-5 w-full rounded bg-blue-600 py-1.5 font-mono text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </section>
          )}

          {/* Dynamic Section: Contact Form (if requested by developer) */}
          {activeSections.includes('contact') && (
            <section id="contact" className="border-t border-zinc-800/80 px-6 py-12 bg-zinc-950/60 animate-fadeIn">
              <div className="max-w-md mx-auto text-center">
                <Mail className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <h2 className="font-mono text-lg font-bold text-white">Get in Touch</h2>
                <p className="text-xs text-zinc-400 mt-1">Our engineering team responds within 2 hours</p>

                {contactSent ? (
                  <div className="mt-4 rounded-md border border-emerald-800 bg-emerald-950/60 p-4 text-xs font-mono text-emerald-400">
                    ✓ Message received! Our fleet is dispatching an answer.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSent(true);
                    }}
                    className="mt-4 space-y-3 text-left"
                  >
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="your.email@company.com"
                        className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        required
                        placeholder="Tell us about your project requirements..."
                        className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded bg-zinc-100 py-2 font-mono text-xs font-semibold text-zinc-950 hover:bg-white flex items-center justify-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </div>
            </section>
          )}

          {/* Rendered Footer */}
          <footer className="mt-auto border-t border-zinc-800/80 px-6 py-6 text-center text-[10px] font-mono text-zinc-500">
            © {new Date().getFullYear()} {brandName}. Built autonomously with ForgeOS Multi-Agent Fleet.
          </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
