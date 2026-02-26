import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS } from "@/lib/config";
import { toast } from "sonner";
import { Upload, X, Plus } from "lucide-react";

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userEmail: string;
}

const DEFAULT_CATEGORIES = [
    "invoice",
    "bill",
    "purchase order",
    "sales order",
    "reports"
];

const UploadDocumentModal = ({ isOpen, onClose, userId, userEmail }: UploadDocumentModalProps) => {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("invoice");
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const allowedTypes = [
                "text/plain",
                "text/csv",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/pdf"
            ];

            if (allowedTypes.includes(selectedFile.type) ||
                selectedFile.name.endsWith('.csv') ||
                selectedFile.name.endsWith('.xls') ||
                selectedFile.name.endsWith('.xlsx')) {
                setFile(selectedFile);
            } else {
                toast.error("Invalid file type. Please upload TXT, CSV, Excel, or PDF.");
            }
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUpload = async () => {
        if (!file || !name || (!category && !newCategory)) {
            toast.error("Please fill all fields and select a file");
            return;
        }

        setIsUploading(true);
        const adminStr = localStorage.getItem("qb_user");
        if (!adminStr) return;
        const admin = JSON.parse(adminStr);

        try {
            const fileData = await convertToBase64(file);
            const finalCategory = isAddingCategory ? newCategory : category;

            const response = await fetch(`${API_ENDPOINTS.DOCUMENTS}/upload?adminId=${admin.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    name,
                    category: finalCategory,
                    fileData,
                    fileType: file.type || 'application/octet-stream'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to upload document");
            }

            toast.success("Document uploaded successfully");
            onClose();
            // Reset state
            setName("");
            setCategory("invoice");
            setFile(null);
            setIsAddingCategory(false);
            setNewCategory("");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload document");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Document for {userEmail}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Document Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter document name"
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="category">Category</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => setIsAddingCategory(!isAddingCategory)}
                            >
                                {isAddingCategory ? "Select Existing" : "Add New"}
                            </Button>
                        </div>
                        {isAddingCategory ? (
                            <Input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Enter new category"
                            />
                        ) : (
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEFAULT_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label>File</Label>
                        <div
                            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors relative"
                            onClick={() => document.getElementById("file-upload")?.click()}
                        >
                            {file ? (
                                <>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Upload className="w-4 h-4 text-primary" />
                                        {file.name}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Click to select file</span>
                                    <span className="text-xs text-muted-foreground">(TXT, CSV, Excel, PDF)</span>
                                </>
                            )}
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".txt,.csv,.xls,.xlsx,.pdf"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Upload Document"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UploadDocumentModal;
