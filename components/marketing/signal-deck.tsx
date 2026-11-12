"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Lock,
    RefreshCw,
    Sparkles,
    Unlock,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTrading } from "./trading-context";

type Signal = {
    symbol: string;
    name: string;
    headline: string;
    thesis: string;
    price: number;
    change: number;
    confidence: number;
    stance: string;
    catalysts: string[];
    series: number[];
};

const SIGNALS: Signal[] = [
    {
        symbol: "NVDA",
        name: "NVIDIA Corp.",
        headline: "AI is booming.",
        thesis:
            "Hyperscaler AI capex just hit a record and Nvidia still owns roughly 90% of the accelerator market. The Blackwell backlog is sold out into next year.",
        price: 182.44,
        change: 4.8,
        confidence: 94,
        stance: "Strong buy signal",
        catalysts: [
            "Data-center revenue +94% year over year",
            "Record hyperscaler capex this quarter",
            "Blackwell backlog sold out through 2027",
        ],
        series: [24, 26, 25, 31, 34, 33, 41, 46, 44, 53, 58, 62, 61, 72, 78, 83],
    },
    {
        symbol: "MSFT",
        name: "Microsoft Corp.",
        headline: "Cloud + AI compounding.",
        thesis:
            "Azure AI bookings are accelerating while Copilot seats start layering in high-margin recurring revenue. This is the pick-and-shovel play with a balance sheet.",
        price: 428.1,
        change: 1.9,
        confidence: 88,
        stance: "Buy signal",
        catalysts: [
            "Azure AI revenue up 33%",
            "Copilot attach rate climbing",
            "$60B annual AI infrastructure buildout",
        ],
        series: [40, 42, 41, 46, 45, 51, 54, 53, 59, 61, 60, 66, 69, 74, 73, 79],
    },
    {
        symbol: "AMD",
        name: "Advanced Micro Devices",
        headline: "The second source.",
        thesis:
            "Every AI buyer wants a second supplier. MI350 ramps into a market that is supply constrained, and AMD is priced for far less perfection than the leader.",
        price: 162.3,
        change: 3.2,
        confidence: 81,
        stance: "Buy signal",
        catalysts: [
            "MI350 volume ramp underway",
            "New hyperscaler design wins",
            "Data-center share gains for 3 straight quarters",
        ],
        series: [30, 29, 33, 31, 38, 42, 40, 47, 44, 52, 56, 54, 61, 65, 63, 70],
    },
    {
        symbol: "PLTR",
        name: "Palantir Technologies",
        headline: "Momentum is real.",
        thesis:
            "AIP is converting pilots into seven-figure contracts at a pace no enterprise software company has matched. Valuation is rich, but so is the demand curve.",
        price: 74.85,
        change: 6.4,
        confidence: 76,
        stance: "Buy signal",
        catalysts: [
            "US commercial revenue +71%",
            "Record remaining deal value",
            "AIP bootcamps converting to contracts",
        ],
        series: [18, 22, 21, 27, 33, 31, 39, 45, 42, 50, 47, 56, 63, 60, 69, 77],
    },
    {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        headline: "Hype vs. deliveries.",
        thesis:
            "The robotaxi narrative is exciting, but core EV demand is cooling and margins are compressing. The AI upside is real, the near-term setup is not.",
        price: 248.15,
        change: -2.7,
        confidence: 41,
        stance: "Watch — skip signal",
        catalysts: [
            "Deliveries missed consensus last quarter",
            "Auto gross margin below 15%",
            "Robotaxi timeline still unproven",
        ],
        series: [78, 74, 76, 70, 71, 65, 67, 61, 58, 60, 54, 51, 53, 48, 46, 44],
    },
];

const SWIPE_THRESHOLD = 110;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function Sparkline({
    symbol,
    series,
    positive,
}: {
    symbol: string;
    series: number[];
    positive: boolean;
}) {
    const width = 320;
    const height = 88;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const points = series.map((value, index) => {
        const x = (index / (series.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 12) - 6;
        return [x, y] as const;
    });
    const line = points
        .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
    const area = `${line} L${width},${height} L0,${height} Z`;
    const stroke = positive ? "#0FEDBE" : "#FF495B";
    const gradientId = `spark-${symbol}`;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-24 w-full"
            aria-hidden
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradientId})`} />
            <path
                d={line}
                fill="none"
                stroke={stroke}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function SignalDeck() {
    const { broker, tradingEnabled, cash, positions, submitBuy } = useTrading();
    const [index, setIndex] = useState(0);
    const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
    const [exiting, setExiting] = useState<"left" | "right" | null>(null);
    const [decisions, setDecisions] = useState<{ symbol: string; dir: "left" | "right" }[]>([]);
    const pointer = useRef({ startX: 0, startY: 0, active: false });

    const active = SIGNALS[index];
    const next = SIGNALS[index + 1];
    const afterNext = SIGNALS[index + 2];

    const connected = broker !== null;
    const canTrade = connected && tradingEnabled;

    const scrollToConnect = useCallback(() => {
        document.getElementById("connect")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    const commit = useCallback(
        (dir: "left" | "right") => {
            if (!active || exiting) return;
            const signal = active;
            setExiting(dir);
            setDecisions((prev) => [...prev, { symbol: signal.symbol, dir }]);

            if (dir === "right") {
                const result = submitBuy({
                    symbol: signal.symbol,
                    name: signal.name,
                    price: signal.price,
                });

                if (result.status === "filled") {
                    toast.success(`Order filled · ${result.qty} × ${signal.symbol}`, {
                        description: `$${result.cost.toFixed(2)} from your ${broker} account.`,
                    });
                } else if (!connected) {
                    toast.message(`Saved · ${result.qty} × ${signal.symbol}`, {
                        description: "Connect a brokerage account below to execute your order.",
                    });
                } else if (!tradingEnabled) {
                    toast.message(`Queued · ${result.qty} × ${signal.symbol}`, {
                        description: "Trading is paused — resume it in the connect panel.",
                    });
                } else {
                    toast.error("Order queued — not enough buying power", {
                        description: "Reset the demo or sell nothing: this is a sandbox.",
                    });
                }
            }

            window.setTimeout(() => {
                setIndex((prev) => prev + 1);
                setExiting(null);
                setDrag({ x: 0, y: 0, active: false });
            }, 320);
        },
        [active, broker, connected, exiting, submitBuy, tradingEnabled]
    );

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (
                target &&
                ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName)
            ) {
                return;
            }
            if (event.key === "ArrowRight") {
                event.preventDefault();
                commit("right");
            }
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                commit("left");
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [commit]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!active || exiting) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        pointer.current = { startX: event.clientX, startY: event.clientY, active: true };
        setDrag({ x: 0, y: 0, active: true });
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!pointer.current.active) return;
        const dx = event.clientX - pointer.current.startX;
        const dy = event.clientY - pointer.current.startY;
        setDrag({ x: dx, y: dy * 0.4, active: true });
    };

    const handlePointerEnd = () => {
        if (!pointer.current.active) return;
        pointer.current.active = false;
        if (drag.x > SWIPE_THRESHOLD) {
            commit("right");
        } else if (drag.x < -SWIPE_THRESHOLD) {
            commit("left");
        } else {
            setDrag({ x: 0, y: 0, active: false });
        }
    };

    const offsetX = exiting === "right" ? 620 : exiting === "left" ? -620 : drag.x;
    const offsetY = exiting ? -40 : drag.y;
    const rotate = exiting === "right" ? 22 : exiting === "left" ? -22 : drag.x / 16;
    const likeOpacity = exiting === "right" ? 1 : clamp01(drag.x / SWIPE_THRESHOLD);
    const skipOpacity = exiting === "left" ? 1 : clamp01(-drag.x / SWIPE_THRESHOLD);

    const boughtCount = decisions.filter((decision) => decision.dir === "right").length;
    const skippedCount = decisions.length - boughtCount;

    const restart = () => {
        setIndex(0);
        setDecisions([]);
        setDrag({ x: 0, y: 0, active: false });
        setExiting(null);
    };

    return (
        <div id="signals" className="relative mx-auto w-full max-w-sm scroll-mt-24">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                    </span>
                    Live AI signals
                </div>
                <button
                    type="button"
                    onClick={scrollToConnect}
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors",
                        canTrade
                            ? "border-teal-400/30 bg-teal-400/10 text-teal-400"
                            : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                    )}
                >
                    {canTrade ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {canTrade ? "Trading enabled" : "Trading locked"}
                </button>
            </div>

            <div className="relative">
                {afterNext && (
                    <div
                        aria-hidden
                        className="absolute inset-x-5 top-6 hidden h-full rounded-3xl border border-gray-800 bg-gray-800/30 sm:block"
                        style={{ transform: "scale(0.9)", transformOrigin: "top center" }}
                    />
                )}
                {next && (
                    <div
                        aria-hidden
                        className="absolute inset-x-2 top-3 h-full rounded-3xl border border-gray-800 bg-gray-800/50"
                        style={{ transform: "scale(0.95)", transformOrigin: "top center" }}
                    >
                        <div className="flex items-center justify-between p-5 text-xs text-gray-500">
                            <span className="font-semibold tracking-wide text-gray-400">{next.symbol}</span>
                            <span>{next.change >= 0 ? "+" : ""}{next.change.toFixed(1)}%</span>
                        </div>
                    </div>
                )}

                {active ? (
                    <div
                        role="group"
                        aria-label="Swipeable AI trade signal"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerEnd}
                        onPointerCancel={handlePointerEnd}
                        style={{
                            transform: `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotate}deg)`,
                            transition:
                                drag.active && !exiting
                                    ? "none"
                                    : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease",
                            opacity: exiting ? 0 : 1,
                            touchAction: "none",
                        }}
                        className="relative z-10 cursor-grab select-none rounded-3xl border border-gray-700 bg-gradient-to-b from-gray-800 via-gray-800 to-gray-900 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] active:cursor-grabbing"
                    >
                        <div
                            className="pointer-events-none absolute left-5 top-5 -rotate-12 rounded-lg border-2 border-teal-400 px-3 py-1 text-sm font-black uppercase tracking-wider text-teal-400"
                            style={{ opacity: likeOpacity }}
                        >
                            Buy
                        </div>
                        <div
                            className="pointer-events-none absolute right-5 top-5 rotate-12 rounded-lg border-2 border-red-500 px-3 py-1 text-sm font-black uppercase tracking-wider text-red-500"
                            style={{ opacity: skipOpacity }}
                        >
                            Skip
                        </div>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/15 text-base font-bold text-yellow-500">
                                    {active.symbol.slice(0, 1)}
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-gray-100">{active.symbol}</p>
                                    <p className="text-xs text-gray-500">{active.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-gray-100">
                                    ${active.price.toFixed(2)}
                                </p>
                                <p
                                    className={cn(
                                        "text-xs font-semibold",
                                        active.change >= 0 ? "text-teal-400" : "text-red-500"
                                    )}
                                >
                                    {active.change >= 0 ? "+" : ""}
                                    {active.change.toFixed(1)}% today
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-yellow-500">
                            <Sparkles className="h-3 w-3" />
                            {active.stance}
                        </div>

                        <h3 className="mt-3 text-2xl font-bold leading-tight text-gray-100">
                            {active.headline}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-400">{active.thesis}</p>

                        <div className="mt-4">
                            <Sparkline
                                symbol={active.symbol}
                                series={active.series}
                                positive={active.change >= 0}
                            />
                        </div>

                        <ul className="mt-4 space-y-1.5">
                            {active.catalysts.map((catalyst) => (
                                <li key={catalyst} className="flex items-start gap-2 text-xs text-gray-400">
                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                                    {catalyst}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-5">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500">
                                <span>AI confidence</span>
                                <span className="font-semibold text-gray-300">{active.confidence}%</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-teal-400"
                                    style={{ width: `${active.confidence}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 rounded-3xl border border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 p-8 text-center shadow-2xl">
                        <Sparkles className="mx-auto h-9 w-9 text-yellow-500" />
                        <h3 className="mt-4 text-xl font-bold text-gray-100">That&apos;s the deck.</h3>
                        <p className="mt-2 text-sm text-gray-400">
                            You bought{" "}
                            <span className="font-semibold text-teal-400">{boughtCount}</span> signal
                            {boughtCount === 1 ? "" : "s"} and skipped{" "}
                            <span className="font-semibold text-gray-200">{skippedCount}</span>.
                        </p>
                        <p className="mt-3 text-xs leading-relaxed text-gray-500">
                            {canTrade
                                ? `Your orders are live in the ${broker} sandbox account.`
                                : "Connect a brokerage account below to turn your picks into orders."}
                        </p>
                        <div className="mt-5 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={canTrade ? restart : scrollToConnect}
                                className="marketing-cta !h-10 !px-4 !text-sm"
                            >
                                {canTrade ? "Run it back" : "Connect account"}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            {canTrade && (
                                <button
                                    type="button"
                                    onClick={restart}
                                    className="inline-flex items-center justify-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-300"
                                >
                                    <RefreshCw className="h-3 w-3" /> Replay signals
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-5 flex items-center justify-center gap-5">
                <button
                    type="button"
                    onClick={() => commit("left")}
                    disabled={!active || Boolean(exiting)}
                    aria-label="Skip this signal"
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <X className="h-6 w-6" />
                </button>
                <div className="text-center text-[11px] uppercase tracking-wider text-gray-500">
                    <p className="flex items-center justify-center gap-1">
                        <ArrowLeft className="h-3 w-3" /> Swipe <ArrowRight className="h-3 w-3" />
                    </p>
                    <p className="mt-0.5 text-gray-600">Right to buy · left to skip</p>
                </div>
                <button
                    type="button"
                    onClick={() => commit("right")}
                    disabled={!active || Boolean(exiting)}
                    aria-label="Buy this signal"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-yellow-400 to-yellow-500 text-gray-950 shadow-lg transition-all hover:from-yellow-500 hover:to-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Check className="h-6 w-6" />
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-800/40 px-4 py-3 text-xs">
                {canTrade ? (
                    <>
                        <span className="flex items-center gap-2 text-gray-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                            {broker} · {positions.length} position{positions.length === 1 ? "" : "s"}
                        </span>
                        <span className="font-semibold text-gray-100">${cash.toFixed(2)} buying power</span>
                    </>
                ) : (
                    <>
                        <span className="flex items-center gap-2 text-gray-400">
                            <Lock className="h-3.5 w-3.5 text-yellow-500" /> Trading disabled
                        </span>
                        <button
                            type="button"
                            onClick={scrollToConnect}
                            className="font-semibold text-yellow-500 transition-colors hover:text-yellow-400"
                        >
                            Connect account →
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
