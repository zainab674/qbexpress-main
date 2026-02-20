import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { Upload, FileBarChart, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";
import { API_ENDPOINTS } from "@/lib/config";
import { toast } from "sonner";

const ReportGraph = () => {
    const [data, setData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [chartType, setChartType] = useState<"line" | "bar">("line");
    const [allSheetsData, setAllSheetsData] = useState<Record<string, any[]>>({});
    const [activeSheet, setActiveSheet] = useState<string>("");
    const [isFinancial, setIsFinancial] = useState(false);
    const [selectedItem, setSelectedItem] = useState("");
    const [financialItems, setFinancialItems] = useState<string[]>([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // If data is passed via navigation state (from Dashboard)
        if (location.state?.reportData && location.state?.fileName) {
            const reportData = location.state.reportData;
            const name = location.state.fileName;

            setFileName(name);
            setAllSheetsData(reportData);
            const firstSheet = Object.keys(reportData)[0];
            setActiveSheet(firstSheet);
            processSheetData(reportData[firstSheet], name);
        }
    }, [location.state]);


    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result;
            if (!content) return;

            const workbook = XLSX.read(content, { type: "array" });
            const sheetsData: Record<string, any[]> = {};

            workbook.SheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                // Using header: 1 to get raw array structure for our custom processing
                const rawSheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                sheetsData[sheetName] = rawSheetData;
            });

            setAllSheetsData(sheetsData);
            const firstSheet = workbook.SheetNames[0];
            setActiveSheet(firstSheet);
            processSheetData(sheetsData[firstSheet], file.name);

            // Save the entire report structure to DB
            saveReportToDatabase(sheetsData, file.name);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSheetChange = (sheetName: string) => {
        setActiveSheet(sheetName);
        processSheetData(allSheetsData[sheetName], fileName);
    };

    const processSheetData = (rawData: any[][], name: string = fileName) => {
        if (!rawData || rawData.length === 0) return;

        // Detect if it's a financial statement (P&L, Balance Sheet)
        // Heuristic: First column is string labels, subsequent columns have numbers, and it has more than 2 columns
        const isFin = rawData.some(r =>
            r && typeof r[0] === "string" &&
            r.length >= 2 &&
            r.slice(1).some(v => typeof v === "number")
        );
        setIsFinancial(isFin);

        if (isFin) {
            // 1. Clean and identify header row for periods
            const rows = rawData.filter(r => r && r.length > 0 && (r[0] || r.some(v => typeof v === 'number')));

            // Find the first row that looks like a header (mostly strings, starting at index 1)
            let headerIdx = 0;
            for (let i = 0; i < Math.min(rows.length, 5); i++) {
                if (rows[i].slice(1).some(v => v !== null && v !== undefined)) {
                    headerIdx = i;
                    break;
                }
            }

            const headerRow = rows[headerIdx];
            const periods = headerRow.slice(1).map((p, i) => p ? String(p).trim() : `Period ${i + 1}`);

            const processedFinData: any[] = [];
            const items: string[] = [];

            // 2. Transform into "tall" format
            for (let i = headerIdx + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;

                const label = row[0] ? String(row[0]).trim() : "";
                if (!label || label.toLowerCase().includes("total") || label.toLowerCase().includes("liabilities")) {
                    // We keep these for the dropdown, but they might be section headers
                }

                const values = row.slice(1);
                let hasNumbers = false;

                values.forEach((val, idx) => {
                    let numVal = val;
                    if (typeof val === 'string') {
                        const cleaned = val.replace(/[$,()]/g, '').trim();
                        if (!isNaN(Number(cleaned)) && cleaned !== '') {
                            numVal = Number(cleaned) * (val.includes('(') ? -1 : 1);
                        }
                    }

                    if (typeof numVal === 'number') {
                        hasNumbers = true;
                        processedFinData.push({
                            item: label,
                            period: periods[idx],
                            value: numVal
                        });
                    }
                });

                if (hasNumbers && !items.includes(label)) {
                    items.push(label);
                }
            }

            setFinancialItems(items);
            if (items.length > 0) setSelectedItem(items[0]);
            setData(processedFinData);
            setHeaders(["Item", "Period", "Value"]);
        } else {
            // Standard Table Parsing
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(rawData.length, 20); i++) {
                const row = rawData[i];
                if (!row) continue;
                const nonEmptyStrCount = row.filter((cell) => typeof cell === "string" && cell.trim() !== "").length;
                if (nonEmptyStrCount >= 2) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                headerRowIndex = rawData.findIndex((row) => row && row.length > 0);
            }

            if (headerRowIndex === -1) return;

            const parsedHeaders = rawData[headerRowIndex].map(h => String(h).trim());
            setHeaders(parsedHeaders);

            const parsedData = [];
            for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row || row.length === 0) continue;

                const obj: any = {};
                parsedHeaders.forEach((header, index) => {
                    let value = row[index];
                    if (value !== undefined && value !== null) {
                        if (typeof value === 'string' && !isNaN(Number(value.replace(/[$,]/g, ''))) && value.trim() !== '') {
                            value = Number(value.replace(/[$,]/g, ''));
                        }
                    } else {
                        value = "";
                    }
                    obj[header] = value;
                });

                const numericValues = Object.values(obj).filter(v => typeof v === 'number').length;
                if (numericValues > 0) {
                    parsedData.push(obj);
                }
            }
            setData(parsedData);
        }
    };

    const saveReportToDatabase = async (reportData: Record<string, any[]> | any[], name: string) => {
        const userStr = localStorage.getItem('qb_user');
        if (!userStr) return;

        try {
            const user = JSON.parse(userStr);
            const response = await fetch(API_ENDPOINTS.REPORTS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    fileName: name,
                    data: reportData
                })
            });

            if (response.ok) {
                toast.success("Report saved to your account");
            } else {
                console.error("Failed to save report");
            }
        } catch (error) {
            console.error("Error saving report:", error);
        }
    };

    const getNumericKeys = () => {
        if (data.length === 0) return [];
        // Find keys that are numeric in MOST rows? Or at least one?
        // Let's verify against the first data row for simplicity, but strictly checking `typeof === 'number'`
        const sampleRow = data[0];
        return headers.filter((header) => typeof sampleRow[header] === "number");
    };

    return (
        <Layout>
            <div className="container-wide pt-28 pb-16">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-display font-bold text-foreground">
                            Report Visualization
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Upload your Financial Report (CSV or Excel) to generate instant graphical insights.
                        </p>
                        {location.state?.reportData && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => navigate("/dashboard")}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary" />
                                Upload Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <Input
                                    type="file"
                                    accept=".csv, .xlsx, .xls"
                                    onChange={handleFileUpload}
                                    className="cursor-pointer"
                                />
                                {Object.keys(allSheetsData).length > 1 && (
                                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Sheet</label>
                                        <select
                                            value={activeSheet}
                                            onChange={(e) => handleSheetChange(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {Object.keys(allSheetsData).map((sheetName) => (
                                                <option key={sheetName} value={sheetName}>
                                                    {sheetName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {isFinancial && financialItems.length > 0 && (
                                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Line Item</label>
                                        <select
                                            value={selectedItem}
                                            onChange={(e) => setSelectedItem(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {financialItems.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {fileName && (
                                    <div className="text-sm text-muted-foreground">
                                        Selected: <span className="font-medium text-foreground">{fileName}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Supported formats: CSV, Excel (.xlsx, .xls).
                                The tool will automatically detect headers and visual data.
                            </p>
                        </CardContent>
                    </Card>

                    {data.length > 0 && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant={chartType === "line" ? "default" : "outline"}
                                    onClick={() => setChartType("line")}
                                    size="sm"
                                >
                                    Line Chart
                                </Button>
                                <Button
                                    variant={chartType === "bar" ? "default" : "outline"}
                                    onClick={() => setChartType("bar")}
                                    size="sm"
                                >
                                    Bar Chart
                                </Button>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileBarChart className="w-5 h-5 text-primary" />
                                        Visual Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {chartType === "line" ? (
                                            <LineChart
                                                data={isFinancial ? data.filter(d => d.item === selectedItem) : data}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey={isFinancial ? "period" : headers[0]}
                                                    tick={{ fontSize: 12 }}
                                                    interval={0}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={70}
                                                />
                                                <YAxis />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                    formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value}
                                                />
                                                <Legend />
                                                {isFinancial ? (
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        name={selectedItem}
                                                        stroke="hsl(var(--primary))"
                                                        strokeWidth={3}
                                                        activeDot={{ r: 8 }}
                                                        connectNulls
                                                    />
                                                ) : (
                                                    getNumericKeys().map((key, index) => (
                                                        <Line
                                                            key={key}
                                                            type="monotone"
                                                            dataKey={key}
                                                            stroke={`hsl(${index * 60 + 200}, 70%, 50%)`}
                                                            strokeWidth={2}
                                                            activeDot={{ r: 8 }}
                                                        />
                                                    ))
                                                )}
                                            </LineChart>
                                        ) : (
                                            <BarChart
                                                data={isFinancial ? data.filter(d => d.item === selectedItem) : data}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey={isFinancial ? "period" : headers[0]}
                                                    tick={{ fontSize: 12 }}
                                                    interval={0}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={70}
                                                />
                                                <YAxis />
                                                <Tooltip
                                                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                    formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value}
                                                />
                                                <Legend />
                                                {isFinancial ? (
                                                    <Bar
                                                        dataKey="value"
                                                        name={selectedItem}
                                                        fill="hsl(var(--primary))"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                ) : (
                                                    getNumericKeys().map((key, index) => (
                                                        <Bar
                                                            key={key}
                                                            dataKey={key}
                                                            fill={`hsl(${index * 60 + 200}, 70%, 50%)`}
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                    ))
                                                )}
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Data Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-secondary/50">
                                                <tr>
                                                    {headers.map((header) => (
                                                        <th key={header} className="p-3 font-medium text-muted-foreground whitespace-nowrap">
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(isFinancial ? data.filter(d => d.item === selectedItem) : data).slice(0, 10).map((row, i) => (
                                                    <tr key={i} className="border-b border-border">
                                                        {headers.map((header) => (
                                                            <td key={`${i}-${header}`} className="p-3 whitespace-nowrap">
                                                                {row[header.toLowerCase()]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {data.length > 5 && (
                                            <p className="text-center text-xs text-muted-foreground mt-4">
                                                Showing up to 10 rows matching the selection.
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ReportGraph;
