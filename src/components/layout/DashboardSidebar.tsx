import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Wallet,
    TrendingUp,
    FileText,
    Calendar,
    Briefcase,
    ChevronLeft,
    Menu,
    ChevronDown,
    BarChart3,
    Plus,
    ExternalLink,
    X,
    Folder,
    Globe,
    PlusCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/config";

interface Report {
    _id: string;
    fileName: string;
    uploadedAt: string;
    data: any;
}

interface Shortcut {
    _id: string;
    name: string;
    url: string;
    groupName: string;
}

interface GroupData {
    name: string;
    fullPath: string;
    shortcuts: Shortcut[];
    subfolders: Record<string, GroupData>;
}

const sidebarItems = [
    { icon: LayoutDashboard, label: "Business overview", path: "/dashboard" },


    { icon: FileText, label: "Reports", path: "/dashboard/reports", isReports: true },

];

export const DashboardSidebar = ({ onReportSelect }: { onReportSelect?: (report: Report | null) => void }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(["General", "Finance", "Communication", "Finance/Banks"]);
    const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false);
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [newShortcut, setNewShortcut] = useState({ name: "", url: "", groupName: "" });

    const fetchReports = async () => {
        const userStr = localStorage.getItem('qb_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        try {
            const res = await fetch(`${API_ENDPOINTS.REPORTS}/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setReports(data || []);
            }
        } catch (error) { console.error(error); }
    };

    const fetchShortcuts = async () => {
        const userStr = localStorage.getItem('qb_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        try {
            const res = await fetch(`${API_ENDPOINTS.SHORTCUTS}/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setShortcuts(data || []);
                // Expand all groups by default
                const groups = Array.from(new Set(data.map((s: Shortcut) => s.groupName || "General")));
                setExpandedGroups(groups as string[]);
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchReports();
        fetchShortcuts();
    }, []);

    const handleAddShortcut = async (e: React.FormEvent) => {
        e.preventDefault();
        const userStr = localStorage.getItem('qb_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        let finalUrl = newShortcut.url;
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        }

        try {
            const res = await fetch(API_ENDPOINTS.SHORTCUTS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newShortcut,
                    url: finalUrl,
                    userId: user.id,
                    groupName: newShortcut.groupName || "General"
                })
            });

            if (res.ok) {
                toast.success("Shortcut added");
                setIsAddShortcutOpen(false);
                setNewShortcut({ name: "", url: "", groupName: "" });
                fetchShortcuts();
            }
        } catch (error) {
            toast.error("Failed to add shortcut");
        }
    };

    const handleDeleteShortcut = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(`${API_ENDPOINTS.SHORTCUTS}/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Shortcut removed");
                setShortcuts(shortcuts.filter(s => s._id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete shortcut");
        }
    };

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupName)
                ? prev.filter(g => g !== groupName)
                : [...prev, groupName]
        );
    };

    const buildTree = (shortcuts: Shortcut[]): Record<string, GroupData> => {
        const tree: Record<string, GroupData> = {
            "General": { name: "General", fullPath: "General", shortcuts: [], subfolders: {} },
            "Finance": {
                name: "Finance",
                fullPath: "Finance",
                shortcuts: [],
                subfolders: {
                    "Banks": { name: "Banks", fullPath: "Finance/Banks", shortcuts: [], subfolders: {} }
                }
            },
            "Communication": { name: "Communication", fullPath: "Communication", shortcuts: [], subfolders: {} }
        };

        shortcuts.forEach(s => {
            const path = (s.groupName || "General").split('/');
            let currentLevel = tree;
            let currentPath = "";

            path.forEach((part, index) => {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                if (!currentLevel[part]) {
                    currentLevel[part] = { name: part, fullPath: currentPath, shortcuts: [], subfolders: {} };
                }

                if (index === path.length - 1) {
                    currentLevel[part].shortcuts.push(s);
                }
                currentLevel = currentLevel[part].subfolders;
            });
        });

        return tree;
    };

    const groupedShortcuts = buildTree(shortcuts);

    const SidebarFolderView = ({ group, depth = 0 }: { group: GroupData, depth?: number }) => {
        const isExpanded = expandedGroups.includes(group.fullPath);
        const hasContent = group.shortcuts.length > 0 || Object.keys(group.subfolders).length > 0;

        if (!hasContent && !["General", "Finance", "Communication", "Finance/Banks"].includes(group.fullPath)) {
            return null;
        }

        return (
            <div className="space-y-1">
                <button
                    onClick={() => toggleGroup(group.fullPath)}
                    className={cn(
                        "w-full flex items-center gap-2 py-2 text-xs font-bold text-white uppercase tracking-widest hover:text-white transition-colors",
                        depth === 0 ? "px-6" : `pl-${6 + (depth * 4)} pr-6`
                    )}
                >
                    <ChevronDown size={12} className={cn("text-white transition-transform", !isExpanded && "-rotate-90")} />
                    {group.name}
                </button>

                {isExpanded && (
                    <div className="space-y-0.5">
                        {group.shortcuts.length > 0 && (
                            <ul className="space-y-0.5">
                                {group.shortcuts.sort((a, b) => a.name.localeCompare(b.name)).map((shortcut) => (
                                    <li key={shortcut._id} className="group px-2">
                                        <a
                                            href={shortcut.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "flex items-center justify-between py-2 rounded-md hover:bg-white/10 transition-colors",
                                                depth === 0 ? "px-6" : `pl-${10 + (depth * 4)} pr-6`
                                            )}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0">
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${new URL(shortcut.url).hostname}&sz=32`}
                                                        alt=""
                                                        className="w-4 h-4 object-contain opacity-100"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).className = 'hidden' }}
                                                    />
                                                    <Globe className="w-4 h-4 text-white hidden only-child:block" size={14} />
                                                </div>
                                                <span className="text-sm font-medium text-white/90 group-hover:text-white truncate">{shortcut.name}</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteShortcut(shortcut._id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {Object.values(group.subfolders).length > 0 && (
                            <div className="space-y-1">
                                {Object.values(group.subfolders).map(sub => (
                                    <SidebarFolderView key={sub.fullPath} group={sub} depth={depth + 1} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const handleOverviewClick = (e: React.MouseEvent) => {
        if (onReportSelect) {
            onReportSelect(null);
        }
    };

    return (
        <aside className={cn(
            "bg-[#2d2e33] text-white flex flex-col transition-all duration-300 h-full shrink-0",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <div className="p-4 flex items-center justify-between border-b border-white/10">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                            <span className="font-bold text-sm">QB</span>
                        </div>
                        <span className="font-bold">Business overview</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                <ul className="space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/dashboard");

                        if (item.isReports) {
                            return (
                                <li key={item.label}>
                                    <button
                                        onClick={() => {
                                            if (isCollapsed) setIsCollapsed(false);
                                            const newOpenState = !isReportsOpen;
                                            setIsReportsOpen(newOpenState);
                                            if (newOpenState) {
                                                fetchReports();
                                            }
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                                            "text-white/70 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} className="text-white/70" />
                                            {!isCollapsed && <span>{item.label}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <ChevronDown size={14} className={cn("transition-transform", isReportsOpen && "rotate-180")} />
                                        )}
                                    </button>

                                    {isReportsOpen && !isCollapsed && (
                                        <ul className="mt-1 bg-black/20 py-1">
                                            {reports.map((report) => (
                                                <li key={report._id}>
                                                    <button
                                                        onClick={() => onReportSelect?.(report)}
                                                        className="w-full text-left px-11 py-2 text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors flex flex-col gap-0.5"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <BarChart3 size={12} />
                                                            <span className="truncate">{report.fileName}</span>
                                                        </div>
                                                        <span className="text-[10px] text-white/30 pl-5">
                                                            {report.uploadedAt ? `uploaded ${formatDistanceToNow(new Date(report.uploadedAt))} ago` : 'recently uploaded'}
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}
                                            {reports.length === 0 && (
                                                <li className="px-11 py-2 text-xs text-white/30 italic">No reports found</li>
                                            )}
                                        </ul>
                                    )}
                                </li>
                            );
                        }

                        return (
                            <li key={item.label}>
                                <Link
                                    to={item.path}
                                    onClick={item.path === "/dashboard" ? handleOverviewClick : undefined}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                                        isActive
                                            ? "bg-white text-black border-l-4 border-primary"
                                            : "text-white/70 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <item.icon size={20} className={cn(isActive ? "text-primary" : "text-white/70")} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}

                    {/* Shortcuts Section */}
                    <li>
                        <div className="mt-6 mb-2 flex items-center justify-between px-4">
                            <button
                                onClick={() => setIsShortcutsOpen(!isShortcutsOpen)}
                                className="flex items-center gap-3 text-white/40 hover:text-white transition-colors"
                            >
                                <ExternalLink size={20} />
                                {!isCollapsed && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold uppercase tracking-wider text-white">Shortcuts</span>
                                        <ChevronDown size={14} className={cn("text-white transition-transform", !isShortcutsOpen && "-rotate-90")} />
                                    </div>
                                )}
                            </button>

                            {!isCollapsed && (
                                <Dialog open={isAddShortcutOpen} onOpenChange={setIsAddShortcutOpen}>
                                    <DialogTrigger asChild>
                                        <button className="text-white/40 hover:text-primary transition-colors">
                                            <Plus size={16} />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[80vw] w-[80vw] bg-[#2d2e33] text-white border-white/10 p-10">
                                        <DialogHeader className="mb-8">
                                            <DialogTitle className="text-3xl font-bold">Add shortcut</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleAddShortcut} className="space-y-8 py-4 max-w-4xl mx-auto w-full">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label htmlFor="name" className="text-lg text-white/70">Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={newShortcut.name}
                                                        onChange={(e) => setNewShortcut({ ...newShortcut, name: e.target.value })}
                                                        className="bg-white/5 border-white/10 text-white focus:ring-primary h-14 text-lg px-6"
                                                        placeholder="Shortcut name"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="url" className="text-lg text-white/70">URL</Label>
                                                    <Input
                                                        id="url"
                                                        value={newShortcut.url}
                                                        onChange={(e) => setNewShortcut({ ...newShortcut, url: e.target.value })}
                                                        className="bg-white/5 border-white/10 text-white focus:ring-primary h-14 text-lg px-6"
                                                        placeholder="https://example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4 bg-white/5 p-8 rounded-2xl border border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="groupName" className="text-lg text-white/70 font-semibold text-xl">Organize into Group</Label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCreatingNewGroup(!isCreatingNewGroup)}
                                                        className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                                                    >
                                                        {isCreatingNewGroup ? "Select Existing Group" : "+ Create New Group"}
                                                    </button>
                                                </div>

                                                {isCreatingNewGroup || Array.from(new Set(shortcuts.map(s => s.groupName).filter(Boolean))).length === 0 ? (
                                                    <Input
                                                        id="groupName"
                                                        value={newShortcut.groupName}
                                                        onChange={(e) => setNewShortcut({ ...newShortcut, groupName: e.target.value })}
                                                        className="bg-white/5 border-white/10 text-white focus:ring-primary h-14 text-lg px-6"
                                                        placeholder="e.g. Communication"
                                                        autoFocus={isCreatingNewGroup}
                                                    />
                                                ) : (
                                                    <Select
                                                        value={newShortcut.groupName}
                                                        onValueChange={(value) => setNewShortcut({ ...newShortcut, groupName: value })}
                                                    >
                                                        <SelectTrigger className="bg-white/10 border-white/10 text-white focus:ring-primary h-14 text-lg px-6 w-full rounded-xl">
                                                            <SelectValue placeholder="Select a group..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#2d2e33] border-white/10 text-white">
                                                            <SelectItem value="General" className="py-3 px-6 text-lg">General</SelectItem>
                                                            <SelectItem value="Finance" className="py-3 px-6 text-lg">Finance</SelectItem>
                                                            <SelectItem value="Finance/Banks" className="py-3 px-6 text-lg">Finance / Banks</SelectItem>
                                                            <SelectItem value="Communication" className="py-3 px-6 text-lg">Communication</SelectItem>
                                                            {Array.from(new Set(shortcuts.map(s => s.groupName)))
                                                                .filter(group => group && !["General", "Finance", "Finance/Banks", "Communication"].includes(group))
                                                                .map(group => (
                                                                    <SelectItem key={group} value={group} className="py-3 px-6 text-lg">
                                                                        {group.replace(/\//g, ' / ')}
                                                                    </SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                            <DialogFooter className="pt-8 gap-4 sm:justify-center">
                                                <Button type="button" variant="ghost" onClick={() => setIsAddShortcutOpen(false)} className="text-white/70 hover:text-white hover:bg-white/5 h-14 px-10 text-lg rounded-xl">
                                                    Cancel
                                                </Button>
                                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white h-14 px-16 text-lg rounded-xl shadow-lg font-bold">
                                                    Create Shortcut
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {isShortcutsOpen && !isCollapsed && (
                            <div className="space-y-4 px-2">
                                {Object.values(groupedShortcuts).map((group) => (
                                    <SidebarFolderView key={group.fullPath} group={group} />
                                ))}
                                {shortcuts.length === 0 && Object.values(groupedShortcuts).every(g => g.shortcuts.length === 0 && Object.keys(g.subfolders).length === 0) && (
                                    <div className="px-8 py-2 text-[10px] text-white/20 italic">No shortcuts added</div>
                                )}
                            </div>
                        )}
                    </li>
                </ul>
            </nav>
        </aside>
    );
};
