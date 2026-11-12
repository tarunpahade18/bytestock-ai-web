"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PRODUCT_APP_HREF, PRODUCT_APP_LABEL } from "@/lib/constants";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/#signals", label: "Signals" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#faq", label: "FAQ" },
];

export const MarketingHeader = () => {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <header className="marketing-header">
            <div className="marketing-header-inner">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/assets/icons/logo.svg"
                        alt="Signalist logo"
                        width={140}
                        height={32}
                        className="h-7 w-auto"
                    />
                </Link>

                <nav className="marketing-nav" aria-label="Primary">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "marketing-nav-link",
                                isActive(href) && "active"
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                    <Link href="/support" className={cn("marketing-nav-link", isActive("/support") && "active")}>
                        Support
                    </Link>
                    <Link href="/privacy" className={cn("marketing-nav-link", isActive("/privacy") && "active")}>
                        Privacy
                    </Link>
                    <Link href="/terms" className={cn("marketing-nav-link", isActive("/terms") && "active")}>
                        Terms
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    <Link href={PRODUCT_APP_HREF} className="marketing-cta !h-10 !px-4 !text-sm">
                        {PRODUCT_APP_LABEL}
                    </Link>
                </div>
            </div>
        </header>
    );
};
