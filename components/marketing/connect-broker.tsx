"use client";

import Link from "next/link";
import {
    ArrowRight,
    Check,
    Landmark,
    Lock,
    Pause,
    Play,
    RotateCcw,
    ShieldCheck,
    Unplug,
    Wallet,
    Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTrading } from "./trading-context";

const BROKERS = [
    { name: "Robinhood", blurb: "Commission-free equities" },
    { name: "Alpaca", blurb: "API-first investing" },
    { name: "Interactive Brokers", blurb: "Global market access" },
];

export function ConnectBroker({
    ctaHref,
    ctaLabel,
}: {
    ctaHref: string;
    ctaLabel: string;
}) {
    const {
        broker,
        connected,
        tradingEnabled,
        cash,
        positions,
        pending,
        fills,
        connect,
        disconnect,
        setTradingEnabled,
        executePending,
        reset,
    } = useTrading();

    const canTrade = connected && tradingEnabled;

    const handleConnect = (name: string) => {
        connect(name);
        toast.success(`${name} connected`, {
            description: "Trading is now enabled — swipe right on a signal to buy.",
        });
    };

    const handleDisconnect = () => {
        disconnect();
        toast("Brokerage disconnected", {
            description: "Trading is disabled until you reconnect an account.",
        });
    };

    const handleExecute = (id?: string) => {
        if (!tradingEnabled) {
            toast.error("Trading is paused", {
                description: "Resume trading to execute queued orders.",
            });
            return;
        }
        const count = executePending(id);
        if (count === 0) {
            toast.error("Not enough buying power", {
                description: "Reset the demo to restore your sandbox balance.",
            });
            return;
        }
        toast.success(`${count} order${count === 1 ? "" : "s"} filled`, {
            description: `Executed from your ${broker} account.`,
        });
    };

    const handleReset = () => {
        reset();
        toast("Sandbox reset", { description: "Account disconnected and balance restored." });
    };

    const steps = [
        {
            title: "Create your free account",
            done: true,
            detail: "Explore live signals before you commit.",
        },
        {
            title: "Connect your brokerage",
            done: connected,
            detail: connected ? `${broker} linked via demo OAuth` : "Pick a broker to unlock trading.",
        },
        {
            title: "Trading is enabled",
            done: canTrade,
            detail: canTrade
                ? "Swipe right on a signal to place an order."
                : "Stays locked until an account is connected.",
        },
    ];

    return (
        <section
            id="connect"
            className="marketing-section scroll-mt-20 border-y border-gray-800 !bg-gray-900/40"
        >
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div>
                    <span className="marketing-eyebrow">
                        <Wallet className="h-3.5 w-3.5" />
                        Connect & trade
                    </span>
                    <h2 className="mt-4 marketing-section-title">
                        Connect an account. Then swipe to trade.
                    </h2>
                    <p className="marketing-section-subtitle">
                        Signals are research until you connect a brokerage. Link an account, set
                        trading live, and every right swipe becomes an order — left swipe simply
                        moves on.
                    </p>

                    <ul className="mt-8 space-y-4">
                        {steps.map((step, index) => (
                            <li key={step.title} className="flex gap-4">
                                <div
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                                        step.done
                                            ? "border-teal-400/30 bg-teal-400/10 text-teal-400"
                                            : "border-gray-700 bg-gray-800 text-gray-400"
                                    )}
                                >
                                    {step.done ? <Check className="h-4 w-4" /> : index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-100">{step.title}</p>
                                    <p className="mt-0.5 text-sm text-gray-500">{step.detail}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {!connected && (
                        <Link href={ctaHref} className="marketing-cta mt-8 !h-11 !px-5 !text-sm">
                            {ctaLabel}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>

                <div className="rounded-3xl border border-gray-800 bg-gray-800/40 p-6 shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-base font-semibold text-gray-100">Brokerage connection</p>
                            <p className="mt-1 text-xs text-gray-500">
                                Secure OAuth · trading unlocks after connecting
                            </p>
                        </div>
                        <span
                            className={cn(
                                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                                canTrade
                                    ? "border-teal-400/30 bg-teal-400/10 text-teal-400"
                                    : "border-gray-600 bg-gray-700/50 text-gray-400"
                            )}
                        >
                            <ShieldCheck className="h-3 w-3" />
                            {canTrade ? "Live" : "Locked"}
                        </span>
                    </div>

                    {!connected ? (
                        <div className="mt-5 space-y-3">
                            {BROKERS.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-700 bg-gray-800/60 p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700 text-gray-300">
                                            <Landmark className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-100">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.blurb}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleConnect(item.name)}
                                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-yellow-500 px-3 text-xs font-semibold text-gray-950 transition-colors hover:bg-yellow-400"
                                    >
                                        Connect
                                    </button>
                                </div>
                            ))}

                            <p className="flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs leading-relaxed text-yellow-500/90">
                                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                Trading stays disabled until an account is connected.
                            </p>
                            <p className="text-[11px] leading-relaxed text-gray-600">
                                Demo sandbox: no real brokerage credentials are requested and no live
                                orders are placed.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-teal-400/20 bg-teal-400/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10 text-teal-400">
                                        <Landmark className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-100">{broker}</p>
                                        <p className="text-xs text-teal-400">
                                            Connected · trading {tradingEnabled ? "enabled" : "paused"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDisconnect}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-700 px-2.5 text-xs font-medium text-gray-400 transition-colors hover:border-red-500/40 hover:text-red-500"
                                >
                                    <Unplug className="h-3.5 w-3.5" />
                                    Disconnect
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                        Buying power
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-gray-100">
                                        ${cash.toFixed(2)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                        Positions
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-gray-100">
                                        {positions.length}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-700 bg-gray-800/60 p-4">
                                <div className="flex items-start gap-2">
                                    {tradingEnabled ? (
                                        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                                    ) : (
                                        <Pause className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-100">Trading</p>
                                        <p className="text-xs text-gray-500">
                                            {tradingEnabled
                                                ? "Enabled — buy swipes become orders."
                                                : "Paused — buy swipes are queued."}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={tradingEnabled}
                                    aria-label="Toggle trading"
                                    onClick={() => setTradingEnabled(!tradingEnabled)}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                                        tradingEnabled ? "bg-teal-400" : "bg-gray-600"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 transition-transform",
                                            tradingEnabled ? "translate-x-5" : "translate-x-0.5"
                                        )}
                                    >
                                        {tradingEnabled ? (
                                            <Play className="h-2.5 w-2.5 text-teal-400" />
                                        ) : (
                                            <Pause className="h-2.5 w-2.5 text-gray-400" />
                                        )}
                                    </span>
                                </button>
                            </div>

                            {pending.length > 0 && (
                                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-gray-100">
                                            Queued signals ({pending.length})
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleExecute()}
                                            disabled={!tradingEnabled}
                                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-yellow-500 px-2.5 text-xs font-semibold text-gray-950 transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Execute all
                                        </button>
                                    </div>
                                    <ul className="mt-3 space-y-2">
                                        {pending.map((order) => (
                                            <li
                                                key={order.id}
                                                className="flex items-center justify-between gap-2 text-xs"
                                            >
                                                <span className="text-gray-300">
                                                    {order.qty} × {order.symbol}{" "}
                                                    <span className="text-gray-500">
                                                        @ ${order.price.toFixed(2)}
                                                    </span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleExecute(order.id)}
                                                    disabled={!tradingEnabled}
                                                    className="font-semibold text-yellow-500 transition-colors hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Execute
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {positions.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500">
                                        Portfolio
                                    </p>
                                    <ul className="mt-2 space-y-2">
                                        {positions.map((position) => (
                                            <li
                                                key={position.symbol}
                                                className="flex items-center justify-between gap-2 rounded-lg bg-gray-800/60 px-3 py-2 text-xs"
                                            >
                                                <span className="font-semibold text-gray-200">
                                                    {position.symbol}
                                                    <span className="ml-1.5 font-normal text-gray-500">
                                                        {position.qty} sh
                                                    </span>
                                                </span>
                                                <span className="text-gray-400">
                                                    avg ${position.avgPrice.toFixed(2)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {fills.length > 0 && (
                                <p className="text-[11px] text-gray-500">
                                    Last fill: {fills[0].qty} × {fills[0].symbol} @ $
                                    {fills[0].price.toFixed(2)}
                                </p>
                            )}

                            <div className="flex items-center justify-between gap-2 pt-1">
                                <a
                                    href="#signals"
                                    className="text-xs font-semibold text-yellow-500 transition-colors hover:text-yellow-400"
                                >
                                    ← Back to signals
                                </a>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-red-500"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Reset demo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
