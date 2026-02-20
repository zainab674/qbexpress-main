import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DynamicAccountsCardProps {
    title?: string;
    data: any[];
}

export const DynamicAccountsCard: React.FC<DynamicAccountsCardProps> = ({ title, data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    // Dynamically determine headers from the first object
    // Filtering out internal or too complex keys if necessary, 
    // but the user wants "show whatever quickbooks sends us"
    const keys = Object.keys(data[0]).filter(key => {
        const val = data[0][key];
        return typeof val !== 'object' || val === null; // Keep simple values for the table
    });

    const formatValue = (val: any) => {
        if (val === null || val === undefined) return "-";
        if (typeof val === 'boolean') return val ? "Yes" : "No";
        if (typeof val === 'number') return val.toLocaleString();
        return String(val);
    };

    return (
        <Card className="h-full border-none shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {title || "Data Objects"}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto p-0">
                <div className="max-h-[400px] overflow-auto px-6 pb-6">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                                {keys.map((key) => (
                                    <TableHead key={key} className="text-[10px] font-bold uppercase py-2">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-xs">
                            {data.map((item, idx) => (
                                <TableRow key={idx}>
                                    {keys.map((key) => (
                                        <TableCell key={key} className="py-2">
                                            {formatValue(item[key])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
