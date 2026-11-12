import Link from "next/link";
import {
    ArrowLeftRight,
    ArrowRight,
    Brain,
    ChevronRight,
    Compass,
    Link2,
    Sparkles,
    Star,
    TrendingUp,
    Wallet,
    Zap,
} from "lucide-react";
import { auth } from "@/lib/auth/server";
import { SignalDeck } from "@/components/marketing/signal-deck";
import { ConnectBroker } from "@/components/marketing/connect-broker";

const STEPS = [
    {
        title: "Create your free account",
        description: "Sign up in under a minute — no credit card, no commitments, just access.",
    },
    {
        title: "Connect your brokerage",
        description: "Link an account via secure OAuth. Trading stays locked until you do.",
    },
    {
        title: "Swipe through AI signals",
        description: "Right to buy the idea, left to skip it. Each signal arrives with a thesis and confidence score.",
    },
    {
        title: "Trade the ones you like",
        description: "Your buy swipes become orders in your connected account — instantly or queued.",
    },
];

const STATS = [
    { value: "8,000+", label: "Tickers tracked" },
    { value: "60+", label: "Markets covered" },
    { value: "<100ms", label: "Quote latency" },
    { value: "24/7", label: "AI coverage" },
];

const TESTIMONIALS = [
    {
        quote: "Connecting my brokerage accounts gave me a complete picture of my portfolio for the first time. The sentiment alerts are a game-changer.",
        author: "Ethan R.",
        role: "Retail Investor",
    },
    {
        quote: "The AI summaries and sentiment scores save me hours every week. It's like having a junior analyst on staff that never sleeps.",
        author: "Priya S.",
        role: "Active Trader",
    },
    {
        quote: "Portfolio tracking, news sentiment, valuations, and backtests — finally in one place. I closed three other apps after switching.",
        author: "Marcus L.",
        role: "Long-term Investor",
    },
];

const FAQS = [
    {
        q: "How does swipe-to-trade work?",
        a: "Each AI signal arrives as a card with a thesis, catalysts, and a confidence score. Swipe right to buy the idea, swipe left to skip it. If no brokerage is connected, your right swipes are saved and can be executed after you connect.",
    },
    {
        q: "When does trading get enabled?",
        a: "Trading is disabled by default. It unlocks only after you connect a brokerage account and turn trading on. You can pause it at any time, and buy swipes made while paused are queued instead of executed.",
    },
    {
        q: "Is Signalist really free?",
        a: "Yes. The core experience — signals, real-time quotes, watchlists, AI summaries, and the swipe demo — is free while we're in beta. Premium add-ons are coming soon.",
    },
    {
        q: "How does brokerage integration work?",
        a: "We use secure OAuth flows to connect to your brokerage. Signalist never sees your login credentials — you authorize read access and, when trading is enabled, order placement.",
    },
    {
        q: "Does Signalist give investment advice?",
        a: "No. We surface data, news, AI-powered analysis, and confidence scores to help you research faster. Swiping right is your decision, not a recommendation from us.",
    },
    {
        q: "Can I track assets outside the US?",
        a: "Yes. Signalist supports equities, ETFs, indices, FX pairs, prediction markets, and more — across North America, Europe, and Asia.",
    },
];

export default async function HomePage() {
    const { userId } = await auth();
    const ctaHref = userId ? "/dashboard" : "/sign-up";
    const ctaLabel = userId ? "Open dashboard" : "Get started — it's free";

    return (
        <main>
            {/* Hero */}
            <section className="marketing-hero">
                <div className="marketing-grid" aria-hidden />
                <div className="marketing-hero-glow" aria-hidden />
                <div className="marketing-hero-glow-teal" aria-hidden />

                <div className="container relative pt-20 pb-28 md:pt-28 md:pb-44">
                    <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
                        <div className="max-w-2xl">
                            <span className="marketing-eyebrow">
                                <Sparkles className="h-3.5 w-3.5" />
                                Swipe signals · now in public beta
                            </span>
                            <h1 className="mt-6 text-[2.75rem] leading-[1.04] sm:text-6xl md:text-7xl font-bold tracking-[-0.035em] text-gray-100">
                                Like the idea?{" "}
                                <span className="font-display font-normal italic tracking-[-0.01em] bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                    Swipe right to buy.
                                </span>
                            </h1>
                            <p className="mt-6 max-w-xl text-lg md:text-xl leading-relaxed text-gray-400">
                                Signalist turns AI research into a deck of trade ideas. NVIDIA riding
                                the AI boom? Swipe right to buy the signal. Not your thesis? Swipe
                                left to skip. Connect your brokerage at the bottom and your right
                                swipes become real orders.
                            </p>

                            <div className="mt-9 flex flex-col sm:flex-row gap-3">
                                <Link href={ctaHref} className="marketing-cta">
                                    {ctaLabel}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href="#how-it-works" className="marketing-ghost">
                                    How it works
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="mt-9 flex flex-wrap items-center gap-2.5">
                                <span className="marketing-pill">
                                    <ArrowLeftRight className="h-3.5 w-3.5 text-yellow-500" />
                                    Right to buy · left to skip
                                </span>
                                <span className="marketing-pill">
                                    <Brain className="h-3.5 w-3.5 text-teal-400" />
                                    AI confidence scores
                                </span>
                                <span className="marketing-pill">
                                    <Link2 className="h-3.5 w-3.5 text-orange-500" />
                                    Trading enabled on connect
                                </span>
                                <span className="marketing-pill">
                                    <Zap className="h-3.5 w-3.5 text-blue-600" />
                                    Live market signals
                                </span>
                            </div>

                            <p className="mt-5 text-xs tracking-wide text-gray-500">
                                Try the live deck — it&apos;s a sandbox, no account needed to swipe.
                            </p>
                        </div>

                        <div className="relative lg:pl-4">
                            <div
                                className="pointer-events-none absolute inset-x-4 top-10 h-64 rounded-full bg-yellow-500/10 blur-3xl"
                                aria-hidden
                            />
                            <SignalDeck />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="border-y border-gray-800 bg-gray-900/40">
                <div className="container py-12 md:py-14 grid grid-cols-2 md:grid-cols-4 gap-5">
                    {STATS.map((s) => (
                        <div key={s.label} className="marketing-stat">
                            <div className="marketing-stat-value">{s.value}</div>
                            <div className="marketing-stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section
                id="how-it-works"
                className="marketing-section bg-gray-900/40 border-y border-gray-800"
            >
                <div className="max-w-2xl">
                    <span className="marketing-eyebrow">
                        <Compass className="h-3.5 w-3.5" />
                        How it works
                    </span>
                    <h2 className="mt-5 marketing-section-title">
                        From sign-up to your first smart alert in minutes.
                    </h2>
                    <p className="marketing-section-subtitle">
                        Signalist is designed to get out of your way. Connect your brokerages, set your
                        preferences, and let AI handle the research.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-2">
                    {STEPS.map((step, idx) => (
                        <div key={step.title} className="marketing-step">
                            <div className="marketing-step-num">{idx + 1}</div>
                            <div>
                                <h3 className="marketing-step-title">{step.title}</h3>
                                <p className="marketing-step-desc">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="marketing-section">
                <div className="text-center max-w-2xl mx-auto">
                    <span className="marketing-eyebrow">
                        <Star className="h-3.5 w-3.5" />
                        Loved by investors
                    </span>
                    <h2 className="mt-5 marketing-section-title">Trusted by thousands of traders.</h2>
                </div>

                <div className="mt-14 grid gap-6 md:grid-cols-3">
                    {TESTIMONIALS.map((t) => (
                        <div
                            key={t.author}
                            className="rounded-2xl border border-gray-800 bg-gray-800/40 p-6"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                ))}
                            </div>
                            <p className="text-gray-200 leading-relaxed">“{t.quote}”</p>
                            <div className="mt-5">
                                <p className="text-sm font-semibold text-gray-100">{t.author}</p>
                                <p className="text-xs text-gray-500">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Connect & enable trading */}
            <ConnectBroker ctaHref={ctaHref} ctaLabel={ctaLabel} />

            {/* CTA */}
            <section className="marketing-section">
                <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-800/60 to-gray-900 p-10 md:p-16 text-center">
                    <div className="marketing-hero-glow" aria-hidden />
                    <TrendingUp className="mx-auto h-10 w-10 text-yellow-500" />
                    <h2 className="mt-5 text-3xl md:text-4xl font-bold text-gray-100 tracking-tight">
                        Swipe your first trade today.
                    </h2>
                    <p className="mt-3 text-base md:text-lg text-gray-400 max-w-xl mx-auto">
                        Join Signalist for free, swipe through AI-ranked ideas, and connect your
                        brokerage when you&apos;re ready to trade.
                    </p>
                    <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href={ctaHref} className="marketing-cta">
                            {ctaLabel}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/support" className="marketing-ghost">
                            Talk to our team
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="marketing-section border-t border-gray-800">
                <div className="max-w-2xl mx-auto text-center">
                    <span className="marketing-eyebrow">
                        <Wallet className="h-3.5 w-3.5" />
                        FAQ
                    </span>
                    <h2 className="mt-5 marketing-section-title">Frequently asked questions</h2>
                    <p className="marketing-section-subtitle mx-auto">
                        Everything you need to know before getting started.
                    </p>
                </div>

                <div className="mt-12 max-w-3xl mx-auto grid gap-5 md:grid-cols-2">
                    {FAQS.map((f) => (
                        <div key={f.q} className="marketing-faq">
                            <p className="marketing-faq-q">{f.q}</p>
                            <p className="marketing-faq-a">{f.a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
