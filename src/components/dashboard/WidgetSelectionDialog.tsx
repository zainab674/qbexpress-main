import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/config";

interface WidgetInfo {
    id: string;
    label: string;
}

const AVAILABLE_WIDGETS: WidgetInfo[] = [
    { id: 'vendorStatus', label: 'Vendors' },
    { id: 'customerStatus', label: 'Customers' },
    { id: 'accounts', label: 'Bank Accounts' },
    { id: 'cashFlow', label: 'Cash flow' },
    { id: 'expensesCard', label: 'Expenses' },
    { id: 'profitAndLoss', label: 'Profit and Loss' },
    { id: 'salesReport', label: 'Sales' },
    { id: 'arAging', label: 'Accounts receivable' },
    { id: 'apAging', label: 'Accounts Payable' },
    { id: 'accountDetails', label: 'Account Details' },
];

interface WidgetSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedWidgets: string[];
    onUpdate: (newSelection: string[]) => void;
    userId: string;
}

export const WidgetSelectionDialog = ({
    isOpen,
    onClose,
    selectedWidgets,
    onUpdate,
    userId
}: WidgetSelectionDialogProps) => {
    const [localSelection, setLocalSelection] = useState<string[]>(selectedWidgets);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalSelection(selectedWidgets);
    }, [selectedWidgets, isOpen]);

    const handleToggle = (id: string) => {
        setLocalSelection(prev =>
            prev.includes(id)
                ? prev.filter(w => w !== id)
                : [...prev, id]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_ENDPOINTS.USERS}/${userId}/widgets`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedWidgets: localSelection })
            });

            if (res.ok) {
                onUpdate(localSelection);
                toast.success("Dashboard updated");
                onClose();
            } else {
                toast.error("Failed to save selection");
            }
        } catch (error) {
            console.error("Error saving widgets:", error);
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-slate-800">
                        Select widgets for your dashboard
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                            All widgets
                        </h3>
                        <div className="space-y-3">
                            {AVAILABLE_WIDGETS.map((widget) => (
                                <div key={widget.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleToggle(widget.id)}>
                                    <Checkbox
                                        id={widget.id}
                                        checked={localSelection.includes(widget.id)}
                                        onCheckedChange={() => handleToggle(widget.id)}
                                        className="w-5 h-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <Label
                                        htmlFor={widget.id}
                                        className="text-base font-medium text-slate-600 cursor-pointer group-hover:text-slate-900 transition-colors"
                                    >
                                        {widget.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
