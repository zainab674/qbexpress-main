import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ColData {
    value: string;
    id?: string;
}

interface Row {
    Header?: { ColData: ColData[] };
    Rows?: { Row: Row[] };
    Summary?: { ColData: ColData[] };
    ColData?: ColData[];
    type?: "Section" | "Data";
    group?: string;
}

interface ReportData {
    Header: {
        ReportName: string;
        StartPeriod?: string;
        EndPeriod?: string;
        Currency?: string;
        TimePeriod?: string;
    };
    Columns: {
        Column: Array<{
            ColTitle: string;
            ColType: string;
        }>;
    };
    Rows: {
        Row: Row[];
    };
}

interface DynamicReportCardProps {
    title?: string;
    data: any;
}

const ReportRow: React.FC<{ row: Row; depth: number; columnsCount: number }> = ({ row, depth, columnsCount }) => {
    const isSection = row.type === "Section";

    return (
        <>
            {row.Header && (
                <TableRow className={cn(depth === 0 ? "bg-muted/30 font-bold" : "font-semibold")}>
                    {row.Header.ColData.map((cell, idx) => (
                        <TableCell
                            key={idx}
                            className={cn(idx === 0 && `pl-${depth * 4 + 4}`)}
                        >
                            {cell.value}
                        </TableCell>
                    ))}
                    {/* Fill remaining cells if any */}
                    {row.Header.ColData.length < columnsCount &&
                        Array.from({ length: columnsCount - row.Header.ColData.length }).map((_, i) => (
                            <TableCell key={`empty-${i}`} />
                        ))
                    }
                </TableRow>
            )}

            {row.Rows && row.Rows.Row.map((innerRow, idx) => (
                <ReportRow
                    key={idx}
                    row={innerRow}
                    depth={depth + 1}
                    columnsCount={columnsCount}
                />
            ))}

            {row.ColData && (
                <TableRow>
                    {row.ColData.map((cell, idx) => (
                        <TableCell
                            key={idx}
                            className={cn(idx === 0 && `pl-${(depth + 1) * 4 + 4}`)}
                        >
                            {cell.value}
                        </TableCell>
                    ))}
                    {/* Fill remaining cells if any */}
                    {row.ColData.length < columnsCount &&
                        Array.from({ length: columnsCount - row.ColData.length }).map((_, i) => (
                            <TableCell key={`empty-data-${i}`} />
                        ))
                    }
                </TableRow>
            )}

            {row.Summary && (
                <TableRow className="bg-muted/20 font-medium italic">
                    {row.Summary.ColData.map((cell, idx) => (
                        <TableCell
                            key={idx}
                            className={cn(idx === 0 && `pl-${depth * 4 + 4}`)}
                        >
                            {cell.value}
                        </TableCell>
                    ))}
                    {/* Fill remaining cells if any */}
                    {row.Summary.ColData.length < columnsCount &&
                        Array.from({ length: columnsCount - row.Summary.ColData.length }).map((_, i) => (
                            <TableCell key={`empty-sum-${i}`} />
                        ))
                    }
                </TableRow>
            )}
        </>
    );
};

export const DynamicReportCard: React.FC<DynamicReportCardProps> = ({ title, data }) => {
    if (!data) return null;

    // Handle Faults/Errors from QuickBooks
    if (data.Fault) {
        const error = data.Fault.Error?.[0];
        return (
            <Card className="h-full border-destructive/20 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-destructive uppercase tracking-wider">
                        {title || "Report Error"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm">Error</AlertTitle>
                        <AlertDescription className="text-xs">
                            {error?.Message || "Unable to fetch report data."}
                        </AlertDescription>
                    </Alert>
                    <p className="text-[10px] text-muted-foreground mt-2">{error?.Detail}</p>
                </CardContent>
            </Card>
        );
    }

    const report = data as ReportData;
    const reportName = title || report.Header?.ReportName || "Report";
    const columns = report.Columns?.Column || [];
    const rows = report.Rows?.Row || [];
    const dateRange = report.Header?.TimePeriod ||
        (report.Header?.StartPeriod && report.Header?.EndPeriod ? `${report.Header.StartPeriod} - ${report.Header.EndPeriod}` : "");

    return (
        <Card className="h-full border-none shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="pb-2 space-y-1">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {reportName}
                </CardTitle>
                {dateRange && (
                    <p className="text-[10px] text-muted-foreground italic">{dateRange}</p>
                )}
            </CardHeader>
            <CardContent className="flex-grow overflow-auto p-0">
                <div className="max-h-[400px] overflow-auto px-6 pb-6">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                                {columns.map((col, idx) => (
                                    <TableHead key={idx} className="text-[10px] font-bold uppercase py-2">
                                        {col.ColTitle}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-xs">
                            {rows.map((row, idx) => (
                                <ReportRow
                                    key={idx}
                                    row={row}
                                    depth={0}
                                    columnsCount={columns.length}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
