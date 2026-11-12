import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { TradingProvider } from "@/components/marketing/trading-context";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <TradingProvider>
            <div className="marketing-shell">
                <MarketingHeader />
                <div className="flex-1">{children}</div>
                <MarketingFooter />
            </div>
        </TradingProvider>
    );
};

export default Layout;
