"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export const DEFAULT_ALLOCATION = 1000;
const STARTING_CASH = 10000;

export type SignalForTrade = {
    symbol: string;
    name: string;
    price: number;
};

export type Position = {
    symbol: string;
    name: string;
    qty: number;
    avgPrice: number;
};

export type PendingOrder = {
    id: string;
    symbol: string;
    name: string;
    qty: number;
    price: number;
};

export type Fill = {
    id: string;
    symbol: string;
    qty: number;
    price: number;
    side: "buy";
};

type TradeResult = {
    status: "filled" | "pending";
    qty: number;
    cost: number;
};

type TradingState = {
    broker: string | null;
    tradingEnabled: boolean;
    cash: number;
    positions: Record<string, { name: string; qty: number; cost: number }>;
    pending: PendingOrder[];
    fills: Fill[];
};

type TradingContextValue = {
    broker: string | null;
    connected: boolean;
    tradingEnabled: boolean;
    cash: number;
    positions: Position[];
    pending: PendingOrder[];
    fills: Fill[];
    connect: (broker: string) => void;
    disconnect: () => void;
    setTradingEnabled: (enabled: boolean) => void;
    submitBuy: (signal: SignalForTrade) => TradeResult;
    executePending: (id?: string) => number;
    reset: () => void;
};

const INITIAL_STATE: TradingState = {
    broker: null,
    tradingEnabled: false,
    cash: STARTING_CASH,
    positions: {},
    pending: [],
    fills: [],
};

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const round = (n: number) => Math.round(n * 100) / 100;

const TradingContext = createContext<TradingContextValue | null>(null);

export function TradingProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<TradingState>(INITIAL_STATE);

    const connect = useCallback((broker: string) => {
        setState((prev) => ({ ...prev, broker, tradingEnabled: true }));
    }, []);

    const disconnect = useCallback(() => {
        setState((prev) => ({ ...prev, broker: null, tradingEnabled: false }));
    }, []);

    const setTradingEnabled = useCallback((enabled: boolean) => {
        setState((prev) => (prev.broker ? { ...prev, tradingEnabled: enabled } : prev));
    }, []);

    const submitBuy = useCallback(
        (signal: SignalForTrade): TradeResult => {
            const qty = Math.max(1, Math.floor(DEFAULT_ALLOCATION / signal.price));
            const cost = round(qty * signal.price);
            const canFill =
                state.broker !== null && state.tradingEnabled && state.cash >= cost;

            if (canFill) {
                setState((prev) => {
                    const existing = prev.positions[signal.symbol];
                    return {
                        ...prev,
                        cash: round(prev.cash - cost),
                        positions: {
                            ...prev.positions,
                            [signal.symbol]: {
                                name: signal.name,
                                qty: (existing?.qty ?? 0) + qty,
                                cost: (existing?.cost ?? 0) + cost,
                            },
                        },
                        fills: [
                            { id: uid(), symbol: signal.symbol, qty, price: signal.price, side: "buy" as const },
                            ...prev.fills,
                        ].slice(0, 8),
                    };
                });
                return { status: "filled", qty, cost };
            }

            setState((prev) => ({
                ...prev,
                pending: [
                    ...prev.pending,
                    { id: uid(), symbol: signal.symbol, name: signal.name, qty, price: signal.price },
                ],
            }));
            return { status: "pending", qty, cost };
        },
        [state.broker, state.cash, state.tradingEnabled]
    );

    const executePending = useCallback(
        (id?: string) => {
            if (!state.broker || !state.tradingEnabled) return 0;

            const targets = id
                ? state.pending.filter((order) => order.id === id)
                : state.pending;
            if (targets.length === 0) return 0;

            let executed = 0;
            let cash = state.cash;
            const positions = { ...state.positions };
            const fills = [...state.fills];
            const executedIds = new Set<string>();

            for (const order of targets) {
                const cost = round(order.qty * order.price);
                if (cost > cash) continue;
                cash = round(cash - cost);
                const existing = positions[order.symbol];
                positions[order.symbol] = {
                    name: order.name,
                    qty: (existing?.qty ?? 0) + order.qty,
                    cost: (existing?.cost ?? 0) + cost,
                };
                fills.unshift({
                    id: uid(),
                    symbol: order.symbol,
                    qty: order.qty,
                    price: order.price,
                    side: "buy",
                });
                executedIds.add(order.id);
                executed += 1;
            }

            if (executed > 0) {
                setState((prev) => ({
                    ...prev,
                    cash,
                    positions,
                    fills: fills.slice(0, 8),
                    pending: prev.pending.filter((order) => !executedIds.has(order.id)),
                }));
            }

            return executed;
        },
        [state.broker, state.cash, state.pending, state.positions, state.fills, state.tradingEnabled]
    );

    const reset = useCallback(() => setState(INITIAL_STATE), []);

    const positions = useMemo<Position[]>(
        () =>
            Object.entries(state.positions).map(([symbol, position]) => ({
                symbol,
                name: position.name,
                qty: position.qty,
                avgPrice: position.qty > 0 ? position.cost / position.qty : 0,
            })),
        [state.positions]
    );

    const value = useMemo<TradingContextValue>(
        () => ({
            broker: state.broker,
            connected: state.broker !== null,
            tradingEnabled: state.tradingEnabled,
            cash: state.cash,
            positions,
            pending: state.pending,
            fills: state.fills,
            connect,
            disconnect,
            setTradingEnabled,
            submitBuy,
            executePending,
            reset,
        }),
        [
            state.broker,
            state.tradingEnabled,
            state.cash,
            state.pending,
            state.fills,
            positions,
            connect,
            disconnect,
            setTradingEnabled,
            submitBuy,
            executePending,
            reset,
        ]
    );

    return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}

export function useTrading() {
    const context = useContext(TradingContext);
    if (!context) {
        throw new Error("useTrading must be used within a TradingProvider");
    }
    return context;
}
