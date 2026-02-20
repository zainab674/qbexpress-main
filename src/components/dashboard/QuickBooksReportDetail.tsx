import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Printer } from "lucide-react";

interface QuickBooksReportDetailProps {
    data: any;
    onBack: () => void;
}

export const QuickBooksReportDetail = ({ data, onBack }: QuickBooksReportDetailProps) => {
    if (!data) return null;

    const reportName = data.Header?.ReportName || "QuickBooks Report";
    const columns = data.Columns?.Column || [];
    const rows = data.Rows?.Row || [];

    const renderRows = (rowList: any[], depth = 0) => {
        return rowList.flatMap((row, idx) => {
            const elements = [];

            // If it's a section, it might have a Header and nested Rows
            if (row.type === 'Section' && row.Header) {
                elements.push(
                    <TableRow key={`section-header-${depth}-${idx}`} className="bg-gray-50/50">
                        {row.Header.ColData?.map((col: any, i: number) => (
                            <TableCell
                                key={i}
                                className={`text-[11px] font-bold text-gray-900`}
                                style={i === 0 ? { paddingLeft: `${depth * 20 + 16}px` } : {}}
                            >
                                {col.value}
                            </TableCell>
                        )) || <TableCell colSpan={columns.length} />}
                    </TableRow>
                );
            }

            // Normal Data row
            if (row.type === 'Data') {
                elements.push(
                    <TableRow key={`data-${depth}-${idx}`} className="hover:bg-blue-50/30 transition-colors">
                        {row.ColData?.map((col: any, i: number) => (
                            <TableCell
                                key={i}
                                className={`text-[11px] text-gray-700 ${i > 0 && !isNaN(Number(col.value.replace(/[^0-9.-]+/g, ""))) ? 'text-right font-mono' : ''}`}
                                style={i === 0 ? { paddingLeft: `${depth * 20 + 16}px` } : {}}
                            >
                                {col.value}
                            </TableCell>
                        ))}
                    </TableRow>
                );
            }

            // Summary row
            if (row.Summary && row.Summary.ColData) {
                elements.push(
                    <TableRow key={`summary-${depth}-${idx}`} className="border-t border-gray-200">
                        {row.Summary.ColData.map((col: any, i: number) => (
                            <TableCell
                                key={i}
                                className={`text-[11px] font-bold text-gray-900 ${i > 0 ? 'text-right font-mono' : ''}`}
                                style={i === 0 ? { paddingLeft: `${depth * 20 + 16}px` } : {}}
                            >
                                {col.value}
                            </TableCell>
                        ))}
                    </TableRow>
                );
            }

            // Sub rows (recursion)
            if (row.Rows && row.Rows.Row) {
                elements.push(...renderRows(row.Rows.Row, depth + 1));
            }

            return elements;
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="gap-2 text-gray-600 hover:text-primary transition-all hover:bg-primary/5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                        <Printer className="w-3.5 h-3.5" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-blue-900/5 overflow-hidden ring-1 ring-gray-200/50">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">
                                {reportName.replace(/([A-Z])/g, ' $1').trim()}
                            </CardTitle>
                            <div className="text-[11px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">
                                {data.Header?.Currency ? `Currency: ${data.Header.Currency}` : 'QuickBooks Online Report'}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80 border-b hover:bg-slate-50/80">
                                    {columns.map((col: any, i: number) => (
                                        <TableHead
                                            key={i}
                                            className={`text-[10px] font-bold text-gray-500 uppercase tracking-widest py-4 ${i > 0 && col.ColType !== 'text' ? 'text-right' : ''}`}
                                        >
                                            {col.ColTitle}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderRows(rows)}

                                {/* If no explicit TOTAL row in rows list, check if there's a standalone Summary */}
                                {data.Rows?.Row?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="py-8 text-center text-gray-400 italic text-sm">
                                            No data available for this report period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center text-[10px] text-gray-400 font-medium gap-4">
                <span>Report Date: {data.Header?.Time ? new Date(data.Header.Time).toLocaleDateString() : 'N/A'}</span>
                <span>•</span>
                <span>Generated by QBExpress</span>
            </div>
        </div>
    );
};
