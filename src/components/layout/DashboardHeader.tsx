import {
    Search,
    Settings,
    Bell,
    HelpCircle,
    Users,
    Eye,
    EyeOff
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const DashboardHeader = ({ title, actions }: { title: string; actions?: React.ReactNode }) => {
    const [privacyMode, setPrivacyMode] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
                {actions}
            </div>


        </header>
    );
};
