import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { PERIODS, PeriodKey } from "@/lib/date-utils";

interface PeriodSelectorProps {
    currentPeriod: PeriodKey;
    onPeriodChange: (period: PeriodKey) => void;
    availablePeriods?: PeriodKey[];
}

export const PeriodSelector = ({
    currentPeriod,
    onPeriodChange,
    availablePeriods = ['thisMonth', 'thisQuarter', 'thisYear', 'lastMonth', 'lastQuarter', 'lastYear', 'last30Days']
}: PeriodSelectorProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center gap-1 text-[11px] text-gray-500 font-medium hover:text-gray-900 transition-colors focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    {PERIODS[currentPeriod]} <ChevronDown className="w-3 h-3" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
                {availablePeriods.map((key) => (
                    <DropdownMenuItem
                        key={key}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPeriodChange(key);
                        }}
                        className="text-xs"
                    >
                        {PERIODS[key]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
