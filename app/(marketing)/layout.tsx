import { auth } from "@/lib/auth/server";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { TradingProvider } from "@/components/marketing/trading-context";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const { userId } = await auth();

    return (
        <TradingProvider>
            <div className="marketing-shell">
                <MarketingHeader isAuthenticated={Boolean(userId)} />
                <div className="flex-1">{children}</div>
                <MarketingFooter />
            </div>
        </TradingProvider>
    );
};

export default Layout;
