import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Account {
    Id: string;
    Name: string;
    AccountType: string;
    AccountSubType: string;
    qboBalance: number;
    CurrentBalance?: number;
    unmatchedCount?: number;
}

export const AccountDetailsCard = ({ accounts }: { accounts: Account[] }) => {
    const navigate = useNavigate();

    // Filter to show interesting accounts
    const assets = accounts.filter(a =>
        ['Bank', 'Other Current Asset', 'Fixed Asset', 'Accounts Receivable', 'Asset', 'Other Asset'].includes(a.AccountType)
    );
    const liabilities = accounts.filter(a =>
        ['Credit Card', 'Other Current Liability', 'Long Term Liability', 'Accounts Payable', 'Liability'].includes(a.AccountType)
    );

    const totalAssets = assets.reduce((sum, a) => sum + (a.CurrentBalance || a.qboBalance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.CurrentBalance || a.qboBalance || 0), 0);

    return (
        <Card
            className="border-none shadow-sm cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all active:scale-[0.98] flex flex-col"
            onClick={() => navigate("/dashboard/detail/accounts")}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[13px] font-bold text-gray-700 uppercase tracking-tight">ACCOUNT DETAILS</CardTitle>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-end border-b pb-2">
                    <div>
                        <div className="text-[11px] text-gray-500 uppercase font-bold">Total Assets</div>
                        <div className="text-xl font-bold text-gray-900">${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[11px] text-gray-500 uppercase font-bold">Total Liabilities</div>
                        <div className="text-xl font-bold text-gray-900">${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">Top Accounts</div>
                    {accounts.slice(0, 5).sort((a, b) => Math.abs(b.qboBalance) - Math.abs(a.qboBalance)).map(acc => (
                        <div key={acc.Id} className="flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-800 truncate max-w-[150px]">{acc.Name}</span>
                                <span className="text-[10px] text-gray-500">{acc.AccountType}</span>
                            </div>
                            <span className={(acc.CurrentBalance || acc.qboBalance || 0) < 0 ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                                ${(acc.CurrentBalance || acc.qboBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
