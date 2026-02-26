import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/lib/config";
import { toast } from "sonner";
import {
    Download,
    FileText,
    ChevronRight,
    Home,
    FileSpreadsheet,
    FileCode,
    Folder,
    ArrowLeft,
    Search,
    MoreVertical,
    Plus,
    FolderPlus,
    Edit2,
    Trash2,
    FileUp,
    Loader2,
    Inbox,
    User
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface Document {
    _id: string;
    name: string;
    category: string; // User's view
    adminCategory: string; // Admin's view
    fileType: string;
    uploadedAt: string;
}

interface UserDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userEmail?: string;
}

interface DocumentGroup {
    _id: string;
    name: string;
    fullPath: string;
}

const FolderIcon = ({ isInbox }: { isInbox?: boolean }) => (
    <div className="relative w-16 h-16 mb-2 group-hover:scale-105 transition-transform duration-200">
        {/* Modern Windows 11 style folder */}
        <div className={`absolute top-0 left-0 w-7 h-2 rounded-t-lg ${isInbox ? 'bg-blue-500' : 'bg-[#FFD740]'}`}></div>
        <div className={`mt-1 w-full h-12 rounded-lg shadow-sm border ${isInbox ? 'bg-blue-500 border-blue-600/30' : 'bg-[#FFD740] border-yellow-500/30'}`}></div>
        <div className={`absolute top-3 left-1 right-1 h-8 rounded-md opacity-80 ${isInbox ? 'bg-blue-400' : 'bg-[#FFE082]'}`}></div>
        {isInbox && <Inbox className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-40" />}
    </div>
);

const FileIcon = ({ type }: { type: string }) => {
    if (type.includes('pdf')) return <FileText className="w-12 h-12 text-red-500 mb-2" />;
    if (type.includes('csv') || type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet className="w-12 h-12 text-green-600 mb-2" />;
    if (type.includes('text')) return <FileText className="w-12 h-12 text-blue-500 mb-2" />;
    return <FileCode className="w-12 h-12 text-slate-400 mb-2" />;
};

const UserDocumentsModal = ({ isOpen, onClose, userId, userEmail }: UserDocumentsModalProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [docGroups, setDocGroups] = useState<DocumentGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && userId) {
            fetchDocuments();
        }
    }, [isOpen, userId]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const scope = userEmail ? 'admin' : 'user';
            const [docsRes, groupsRes] = await Promise.all([
                fetch(`${API_ENDPOINTS.DOCUMENTS}/${userId}`),
                fetch(`${API_ENDPOINTS.DOCUMENT_GROUPS}/${userId}?scope=${scope}`)
            ]);

            if (!docsRes.ok || !groupsRes.ok) throw new Error("Failed to fetch documents or groups");

            const docsData = await docsRes.json();
            const groupsData = await groupsRes.json();

            setDocuments(docsData);
            setDocGroups(groupsData);
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        setUploading(true);
        try {
            const base64Data = await convertToBase64(file);
            const response = await fetch(`${API_ENDPOINTS.DOCUMENTS}/upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    name: file.name,
                    category: "[Sent to Admin]",
                    fileData: base64Data,
                    fileType: file.type
                })
            });

            if (!response.ok) throw new Error("Upload failed");

            toast.success("Document sent to admin successfully");
            fetchDocuments();
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload document");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleReorganize = async (docId: string, newCategory: string) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.DOCUMENTS}/${docId}/category`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: newCategory,
                    scope: userEmail ? 'admin' : 'user'
                })
            });

            if (!response.ok) throw new Error("Failed to move document");

            toast.success(`Moved to ${newCategory}`);
            fetchDocuments(); // Refresh list
        } catch (error) {
            console.error("Reorganize error:", error);
            toast.error("Failed to move document");
        }
    };

    const handleRenameFolder = async (oldCategory: string, newCategory: string) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.DOCUMENT_GROUPS}/rename`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    oldCategory,
                    newCategory: newCategory.toLowerCase(),
                    scope: userEmail ? 'admin' : 'user'
                })
            });

            if (!response.ok) throw new Error("Failed to rename folder");

            toast.success("Folder renamed successfully");
            fetchDocuments();
        } catch (error) {
            console.error("Rename folder error:", error);
            toast.error("Failed to rename folder");
        }
    };

    const handleDownload = async (docId: string, fileName: string, fileType: string) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.DOCUMENTS}/download/${docId}`);
            if (!response.ok) throw new Error("Failed to download document");
            const data = await response.json();

            const base64Content = data.fileData.split(',')[1] || data.fileData;
            const byteCharacters = atob(base64Content);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: fileType });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download document");
        }
    };

    const filteredDocs = searchTerm
        ? documents.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : documents;

    // Use adminCategory for Admin View, category for User View
    // Fallback to category then 'uncategorized' for legacy documents
    const getDocCategory = (doc: Document) => {
        if (userEmail) return doc.adminCategory || doc.category || "uncategorized";
        return doc.category || "uncategorized";
    };

    const categories = Array.from(new Set([
        ...filteredDocs.map(getDocCategory),
        ...docGroups.map(g => g.fullPath)
    ])).filter(Boolean);

    const currentDocs = currentFolder
        ? filteredDocs.filter(d => getDocCategory(d) === currentFolder)
        : [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-none w-screen h-screen overflow-hidden flex flex-col p-0 border-none rounded-none shadow-none bg-white z-[9999]">
                {/* Windows-style Header / Address Bar */}
                <div className="bg-[#f3f3f3] p-3 flex flex-col gap-2 border-b select-none">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded hover:bg-white transition-colors disabled:opacity-30"
                                onClick={() => setCurrentFolder(null)}
                                disabled={!currentFolder}
                                title="Back"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 h-8 min-w-[400px] shadow-sm flex-1">
                                <Home
                                    className="w-4 h-4 text-blue-600 cursor-pointer hover:scale-110 transition-transform"
                                    onClick={() => {
                                        onClose();
                                        navigate(userEmail ? "/admin" : "/dashboard");
                                    }}
                                />
                                {userEmail && (
                                    <>
                                        <ChevronRight className="w-3 h-3 text-slate-300" />
                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-600 border border-slate-200">
                                            <User className="w-3 h-3" />
                                            {userEmail}
                                        </div>
                                    </>
                                )}
                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                <span
                                    className="text-xs text-slate-600 hover:bg-slate-50 px-1 rounded cursor-pointer"
                                    onClick={() => setCurrentFolder(null)}
                                >
                                    Documents
                                </span>
                                {currentFolder && (
                                    <>
                                        <ChevronRight className="w-3 h-3 text-slate-300" />
                                        <span className="text-xs font-medium text-slate-900 px-1 rounded bg-blue-50 border border-blue-100">{currentFolder}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 bg-white text-xs font-medium border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                onClick={async () => {
                                    const name = prompt("Enter folder name:");
                                    if (name) {
                                        try {
                                            const response = await fetch(`${API_ENDPOINTS.DOCUMENT_GROUPS}`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    userId,
                                                    name,
                                                    fullPath: name,
                                                    scope: userEmail ? 'admin' : 'user'
                                                })
                                            });
                                            if (!response.ok) throw new Error("Failed to create folder");
                                            toast.success(`Folder "${name}" created`);
                                            fetchDocuments();
                                        } catch (error) {
                                            toast.error("Failed to create folder");
                                        }
                                    }
                                }}
                            >
                                <FolderPlus className="w-4 h-4 text-blue-600" />
                                New Folder
                            </Button>
                            {!userEmail && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 bg-blue-600 text-white text-xs font-medium border-blue-500 hover:bg-blue-700 transition-all shadow-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FileUp className="w-4 h-4" />
                                    )}
                                    Upload to Admin
                                </Button>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <div className="relative group">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 group-focus-within:text-blue-500" />
                                <input
                                    type="text"
                                    placeholder="Search Documents"
                                    className="bg-white border border-slate-200 rounded px-7 h-8 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 w-[200px] transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 min-h-[450px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-sm font-medium tracking-tight">Working on it...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-8">
                            {!currentFolder ? (
                                categories.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-300">
                                        <Folder className="w-20 h-20 mb-4 opacity-10" />
                                        <p className="text-sm font-medium">This folder is empty</p>
                                    </div>
                                ) : (
                                    categories.map((cat) => (
                                        <div key={cat} className="group relative flex flex-col items-center justify-center">
                                            <button
                                                onClick={() => setCurrentFolder(cat)}
                                                className="group flex flex-col items-center justify-center p-2 rounded-md hover:bg-blue-50/50 hover:ring-1 hover:ring-blue-200 transition-all text-center w-full"
                                            >
                                                <FolderIcon isInbox={cat === "[Sent to Admin]"} />
                                                <span className="text-[12px] text-slate-700 truncate w-full px-1 capitalize leading-tight group-hover:text-blue-700">
                                                    {cat === "[Sent to Admin]" ? (userEmail ? "Sent to you" : "Sent to Admin") : cat}
                                                </span>
                                            </button>

                                            {cat !== "[Sent to Admin]" && (
                                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="secondary" size="icon" className="h-6 w-6 rounded-md shadow-sm bg-white/90 text-slate-600 hover:bg-white border border-slate-100 backdrop-blur-sm">
                                                                <MoreVertical className="w-3 h-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    const newName = prompt("Rename folder to:", cat);
                                                                    if (newName && newName !== cat) handleRenameFolder(cat, newName);
                                                                }}
                                                                className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                                                Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="flex items-center gap-2 text-xs py-2 text-red-600 cursor-pointer"
                                                                onClick={async () => {
                                                                    if (confirm(`Are you sure you want to delete folder "${cat}"? All items will become uncategorized.`)) {
                                                                        try {
                                                                            const scope = userEmail ? 'admin' : 'user';
                                                                            const res = await fetch(`${API_ENDPOINTS.DOCUMENT_GROUPS}/${userId}?path=${encodeURIComponent(cat)}&scope=${scope}`, {
                                                                                method: "DELETE"
                                                                            });
                                                                            if (!res.ok) throw new Error("Failed to delete folder");
                                                                            toast.success("Folder deleted");
                                                                            fetchDocuments();
                                                                        } catch (error) {
                                                                            toast.error("Failed to delete folder");
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 px-0" />
                                                                Delete Folder
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )
                            ) : (
                                currentDocs.map((doc) => (
                                    <div
                                        key={doc._id}
                                        className="group flex flex-col items-center justify-center p-2 rounded-md hover:bg-blue-100/30 hover:ring-1 hover:ring-blue-200 transition-all text-center relative cursor-default"
                                        onDoubleClick={() => handleDownload(doc._id, doc.name, doc.fileType)}
                                    >
                                        <FileIcon type={doc.fileType} />
                                        <span className="text-[12px] text-slate-700 break-words w-full px-1 leading-tight group-hover:text-blue-700 line-clamp-2">
                                            {doc.name}
                                        </span>
                                        <span className="text-[9px] text-slate-400 mt-1">
                                            {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </span>

                                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="secondary" size="icon" className="h-7 w-7 rounded-md shadow-sm bg-white text-slate-600 hover:bg-white border border-slate-200">
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 shadow-xl border-slate-200">
                                                    <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-wider px-2 py-1.5">Move to Folder</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {categories.map(cat => (
                                                        <DropdownMenuItem
                                                            key={cat}
                                                            onClick={() => handleReorganize(doc._id, cat)}
                                                            className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                                                            disabled={getDocCategory(doc) === cat}
                                                        >
                                                            <Folder className="w-3.5 h-3.5 text-yellow-500" />
                                                            <span className="capitalize">{cat === "[Sent to Admin]" ? (userEmail ? "Sent to you" : "Sent to Admin") : cat}</span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            const newCat = prompt("Enter new folder name:");
                                                            if (newCat) handleReorganize(doc._id, newCat.toLowerCase());
                                                        }}
                                                        className="flex items-center gap-2 text-xs py-2 text-blue-600 font-medium cursor-pointer"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        Create New Folder...
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-7 w-7 rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 border border-blue-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload(doc._id, doc.name, doc.fileType);
                                                }}
                                                title="Download"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Windows-style Status Bar */}
                <div className="bg-[#f3f3f3] px-4 py-1 border-t text-[11px] text-slate-500 flex justify-between select-none">
                    <div className="flex items-center gap-3">
                        <span>{loading ? 'Searching...' : `${currentFolder ? currentDocs.length : categories.length} items`}</span>
                        {!loading && !currentFolder && documents.length > 0 && (
                            <span className="text-slate-400">| {documents.length} files total</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></div>
                            <span>Ready</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserDocumentsModal;
