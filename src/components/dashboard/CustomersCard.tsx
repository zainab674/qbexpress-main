import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const CustomersCard = ({ data }: { data?: any }) => {
    const navigate = useNavigate();

    const unpaidTotal = data?.unpaidAmount || 0;
    const overdue = data?.overdueAmount || 0;
    const notDueYet = data?.notDueYetAmount || 0;

    const paidTotal = data?.paidAmount || 0;
    const deposited = data?.depositedAmount || 0;
    const notDeposited = data?.notDepositedAmount || 0;

    const unpaidRatio = unpaidTotal > 0 ? (overdue / unpaidTotal) * 100 : 0;
    const paidRatio = paidTotal > 0 ? (notDeposited / paidTotal) * 100 : 0;

    return (
        <Card
            className="border-none shadow-sm cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all active:scale-[0.98]"
            onClick={() => navigate("/dashboard/detail/customers")}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[13px] font-bold text-gray-700 uppercase tracking-tight">CUSTOMERS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-2">
                {/* Unpaid Section */}
                <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">${unpaidTotal.toLocaleString()} Unpaid</span>
                        <span className="text-xs text-gray-500 font-medium">Last 365 days</span>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <div className="text-2xl font-bold text-gray-900">${overdue.toLocaleString()}</div>
                            <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Overdue</div>
                        </div>
                        <div className="space-y-0.5 text-right">
                            <div className="text-2xl font-bold text-gray-900">${notDueYet.toLocaleString()}</div>
                            <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Not due yet</div>
                        </div>
                    </div>

                    <div className="h-5 w-full flex bg-gray-200 rounded-sm overflow-hidden mt-2">
                        <div
                            className="h-full bg-[#ef6c00] transition-all duration-500"
                            style={{ width: `${unpaidRatio}%` }}
                        />
                        <div
                            className="h-full bg-gray-200 transition-all duration-500"
                            style={{ width: `${100 - unpaidRatio}%` }}
                        />
                    </div>
                </div>

                {/* Paid Section */}
                <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">${paidTotal.toLocaleString()} Paid</span>
                        <span className="text-xs text-gray-500 font-medium">Last 30 days</span>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <div className="text-2xl font-bold text-gray-900">${notDeposited.toLocaleString()}</div>
                            <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Not deposited</div>
                        </div>
                        <div className="space-y-0.5 text-right">
                            <div className="text-2xl font-bold text-gray-900">${deposited.toLocaleString()}</div>
                            <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Deposited</div>
                        </div>
                    </div>

                    <div className="h-5 w-full flex bg-[#2e7d32] rounded-sm overflow-hidden mt-2">
                        <div
                            className="h-full bg-[#66bb6a] transition-all duration-500 border-r border-[#ffffff33]"
                            style={{ width: `${paidRatio}%` }}
                        />
                        <div
                            className="h-full bg-[#2e7d32] transition-all duration-500"
                            style={{ width: `${100 - paidRatio}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
