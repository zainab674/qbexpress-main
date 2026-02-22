import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, MapPin, Globe, Calendar, CreditCard } from "lucide-react";

export interface CompanyInfo {
    CompanyName: string;
    LegalName: string;
    CompanyAddr?: {
        Line1: string;
        City: string;
        CountrySubDivisionCode: string;
        PostalCode: string;
    };
    PrimaryPhone?: { FreeFormNumber: string };
    PrimaryEmailAddr?: { Address: string };
    WebAddr?: { Address: string };
    SupportedLanguages: string;
    CompanyStartDate: string;
    FiscalYearStartMonth: string;
    CustomerCommunicationAddr?: {
        Line1: string;
        City: string;
        CountrySubDivisionCode: string;
        PostalCode: string;
    };
}

export const CompanyProfileCard = ({ info }: { info: CompanyInfo | null }) => {
    if (!info) return null;

    const address = info.CompanyAddr ?
        `${info.CompanyAddr.Line1}, ${info.CompanyAddr.City}, ${info.CompanyAddr.CountrySubDivisionCode} ${info.CompanyAddr.PostalCode}` :
        "No address provided";

    return (
        <Card className="border-none shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 overflow-hidden bg-white hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{info.CompanyName}</CardTitle>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Company Profile</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-3 group">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-primary transition-colors" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Address</p>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{address}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 group">
                            <Phone className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-primary transition-colors" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                                <p className="text-sm text-gray-700 font-medium">{info.PrimaryPhone?.FreeFormNumber || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 group">
                            <Mail className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-primary transition-colors" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                                <p className="text-sm text-gray-700 font-medium truncate max-w-[120px]">{info.PrimaryEmailAddr?.Address || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 group">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-primary transition-colors" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Fiscal Year Start</p>
                                <p className="text-sm text-gray-700 font-medium">{info.FiscalYearStartMonth || "January"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 group">
                            <Globe className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-primary transition-colors" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Website</p>
                                <p className="text-sm text-gray-700 font-medium truncate max-w-[120px]">{info.WebAddr?.Address || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Quick Metrics
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[9px] font-bold text-gray-500 uppercase">Start Date</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {info.CompanyStartDate ? new Date(info.CompanyStartDate).toLocaleDateString() : "Not set"}
                            </p>
                        </div>
                        <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="text-[9px] font-bold text-primary uppercase">Industry</p>
                            <p className="text-sm font-bold text-primary mt-1">{(info as any).CustomerCommunicationAddr?.CountrySubDivisionCode === 'CA' ? 'Services' : "Professional Services"}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
