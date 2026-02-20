import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from "recharts";

interface AgingCardProps {
    title: string;
    data?: any;
    type: 'AP' | 'AR';
    onViewDetail?: () => void;
}

export const AgingCard = ({ title, data, type, onViewDetail }: AgingCardProps) => {
    let total = 0;

    // Default empty segments to ensure all 5 are shown as in screenshot
    const colors = {
        current: '#43a047', // Green
        '1-30': '#00acc1',  // Teal
        '31-60': '#7e57c2', // Purple
        '61-90': '#1e88e5', // Blue
        '91+': '#26c6da'    // Light Teal
    };

    let segmentValues = {
        'Current': 0,
        '1 - 30': 0,
        '31 - 60': 0,
        '61 - 90': 0,
        '91 and over': 0
    };

    const parseAmount = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const clean = val.replace(/[^0-9.-]+/g, "");
        return parseFloat(clean) || 0;
    };

    if (data && data.Rows) {
        // Detect Report Type
        const isDetail = data.Header?.ReportName?.includes('Detail');
        const columns = data.Columns?.Column || [];

        if (isDetail) {
            // Calculate from Detail Report structure
            // In Detail report, each bracket is a Section
            const sections = data.Rows.Row || [];
            sections.forEach((section: any) => {
                if (section.type === 'Section' && section.Header && section.Header.ColData) {
                    const bracketName = section.Header.ColData[0]?.value;
                    // Find matching bucket
                    let bucketKey: keyof typeof segmentValues | null = null;
                    if (bracketName.toLowerCase().includes('current')) bucketKey = 'Current';
                    else if (bracketName.includes('1 - 30')) bucketKey = '1 - 30';
                    else if (bracketName.includes('31 - 60')) bucketKey = '31 - 60';
                    else if (bracketName.includes('61 - 90')) bucketKey = '61 - 90';
                    else if (bracketName.includes('91 and over') || bracketName.includes('91+')) bucketKey = '91 and over';

                    // Use Summary row of the section if available
                    if (bucketKey && section.Summary && section.Summary.ColData) {
                        const amt = parseAmount(section.Summary.ColData[section.Summary.ColData.length - 1]?.value);
                        segmentValues[bucketKey] += amt;
                    }
                    // Fallback: Sum data rows if no summary row
                    else if (bucketKey && section.Rows && section.Rows.Row) {
                        section.Rows.Row.forEach((r: any) => {
                            if (r.type === 'Data' && r.ColData) {
                                // Assume amount is in one of the columns (usually last or by ColType)
                                const amt = parseAmount(r.ColData[r.ColData.length - 1]?.value);
                                segmentValues[bucketKey]! += amt;
                            }
                        });
                    }
                }
            });
            // Total is sum of segments for Detail
            total = Object.values(segmentValues).reduce((a, b) => a + b, 0);
        } else {
            // Calculate from Summary Report structure (Original logic refined)
            const findColIdx = (text: string) => columns.findIndex((c: any) =>
                c.ColTitle?.toLowerCase().includes(text.toLowerCase()) || c.ColType?.toLowerCase().includes(text.toLowerCase())
            );

            const currentIdx = findColIdx("current");
            const idx1_30 = findColIdx("1 - 30") !== -1 ? findColIdx("1 - 30") : findColIdx("1-30");
            const idx31_60 = findColIdx("31 - 60") !== -1 ? findColIdx("31 - 60") : findColIdx("31-60");
            const idx61_90 = findColIdx("61 - 90") !== -1 ? findColIdx("61 - 90") : findColIdx("61-90");
            const idx91_plus = findColIdx("91 and over") !== -1 ? findColIdx("91 and over") : findColIdx("91+");

            const findSummaryRow = (rows: any[]): any => {
                for (const row of rows) {
                    if (row.id === 'TOTAL' || (row.Summary && row.Summary.ColData && row.Summary.ColData[0]?.value?.toLowerCase().includes('total'))) {
                        return row;
                    }
                    if (row.Rows && row.Rows.Row) {
                        const found = findSummaryRow(row.Rows.Row);
                        if (found) return found;
                    }
                }
                return null;
            };

            const summaryRow = findSummaryRow(data.Rows.Row || []);
            if (summaryRow && summaryRow.Summary && summaryRow.Summary.ColData) {
                const cols = summaryRow.Summary.ColData;

                // More robust column mapping
                const totalColIdx = findColIdx("total");
                const currentIdx = findColIdx("current");
                const idx1_30 = findColIdx("1 - 30") !== -1 ? findColIdx("1 - 30") : findColIdx("1-30");
                const idx31_60 = findColIdx("31 - 60") !== -1 ? findColIdx("31 - 60") : findColIdx("31-60");
                const idx61_90 = findColIdx("61 - 90") !== -1 ? findColIdx("61 - 90") : findColIdx("61-90");
                const idx91_plus = findColIdx("91 and over") !== -1 ? findColIdx("91 and over") : findColIdx("91+");

                const totalIdx = totalColIdx !== -1 ? totalColIdx : columns.length - 1;
                total = parseAmount(cols[totalIdx]?.value);

                if (currentIdx !== -1 && cols[currentIdx]) segmentValues['Current'] = parseAmount(cols[currentIdx]?.value);
                if (idx1_30 !== -1 && cols[idx1_30]) segmentValues['1 - 30'] = parseAmount(cols[idx1_30]?.value);
                if (idx31_60 !== -1 && cols[idx31_60]) segmentValues['31 - 60'] = parseAmount(cols[idx31_60]?.value);
                if (idx61_90 !== -1 && cols[idx61_90]) segmentValues['61 - 90'] = parseAmount(cols[idx61_90]?.value);
                if (idx91_plus !== -1 && cols[idx91_plus]) segmentValues['91 and over'] = parseAmount(cols[idx91_plus]?.value);
            } else if (data.Rows.Row && data.Rows.Row.length > 0) {
                // Last ditch effort: if no TOTAL row found, sum up all rows
                data.Rows.Row.forEach((r: any) => {
                    if (r.ColData) {
                        const amt = parseAmount(r.ColData[columns.length - 1]?.value);
                        total += amt;
                    }
                });
            }
        }
    }

    const segments = [
        { name: 'Current', value: segmentValues['Current'], color: colors.current },
        { name: '1 - 30', value: segmentValues['1 - 30'], color: colors['1-30'] },
        { name: '31 - 60', value: segmentValues['31 - 60'], color: colors['31-60'] },
        { name: '61 - 90', value: segmentValues['61 - 90'], color: colors['61-90'] },
        { name: '91 and over', value: segmentValues['91 and over'], color: colors['91+'] }
    ];

    return (
        <Card
            className="border border-gray-100 shadow-sm hover:ring-1 hover:ring-primary/10 transition-all rounded-xl overflow-hidden cursor-pointer"
            onClick={onViewDetail}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-[13px] font-bold text-gray-700 uppercase tracking-tight">{title}</CardTitle>
                <div className="text-[11px] text-gray-400 font-medium">As of today</div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="text-[13px] text-gray-400 font-medium">Total</div>
                    <div className="text-4xl font-medium tracking-tight text-gray-900 leading-none mt-1">
                        ${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>

                <div className="flex flex-row items-center justify-between pt-2">
                    <div className="h-[140px] w-[140px] relative shrink-0">
                        {total > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={segments.filter(s => s.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={0}
                                        animationDuration={1000}
                                    >
                                        {segments.filter(s => s.value > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontSize: '11px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full rounded-full border-[10px] border-gray-50 flex items-center justify-center">
                                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">No Debt</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2 pl-6">
                        {segments.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-[12px] text-gray-500 whitespace-nowrap">
                                    {item.name}: <span className="font-bold text-gray-900">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
