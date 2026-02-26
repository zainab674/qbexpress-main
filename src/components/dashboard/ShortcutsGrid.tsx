
import { useState, useEffect } from "react";
import { Plus, X, Globe, ExternalLink, Folder, ChevronDown, ChevronRight, Trash2, PlusCircle, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS } from "@/lib/config";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Shortcut {
    _id: string;
    name: string;
    url: string;
    groupName: string;
}

interface GroupData {
    _id?: string;
    name: string;
    fullPath: string;
    isDefault?: boolean;
    shortcuts: Shortcut[];
    subfolders: Record<string, GroupData>;
}

const ShortcutItem = ({
    shortcut,
    onDelete,
    onEdit
}: {
    shortcut: Shortcut;
    onDelete: (id: string) => void;
    onEdit: (s: Shortcut) => void;
}) => {
    // Try to get favicon
    const getFavicon = (url: string) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return null;
        }
    };

    const favicon = getFavicon(shortcut.url);

    return (
        <div className="group relative flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer w-24">
            <a
                href={shortcut.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 w-full text-center"
            >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow">
                    {favicon ? (
                        <img src={favicon} alt={shortcut.name} className="w-6 h-6 object-contain" />
                    ) : (
                        <Globe className="w-6 h-6 text-slate-400" />
                    )}
                </div>
                <span className="text-xs font-medium truncate w-full px-1 text-slate-700">
                    {shortcut.name}
                </span>
            </a>
            <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit(shortcut);
                    }}
                    className="p-1.5 bg-white rounded-full shadow-sm border border-slate-100 hover:text-primary transition-colors"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(shortcut._id);
                    }}
                    className="p-1.5 bg-white rounded-full shadow-sm border border-slate-100 hover:text-red-500 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

export const ShortcutsGrid = () => {
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

    const [newShortcut, setNewShortcut] = useState({
        name: "",
        url: "",
        groupName: "General"
    });

    const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
    const [editingGroup, setEditingGroup] = useState<{ oldPath: string, newName: string } | null>(null);

    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(["General", "Finance", "Communication"]);

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupName)
                ? prev.filter(g => g !== groupName)
                : [...prev, groupName]
        );
    };

    const fetchShortcuts = async () => {
        const userStr = localStorage.getItem('qb_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            const [sRes, gRes] = await Promise.all([
                fetch(`${API_ENDPOINTS.SHORTCUTS}/${user.id}`),
                fetch(`${API_ENDPOINTS.SHORTCUT_GROUPS}/${user.id}`)
            ]);

            if (sRes.ok && gRes.ok) {
                const sData = await sRes.json();
                const gData = await gRes.json();
                setShortcuts(sData);
                setGroups(gData);
            }
        } catch (error) {
            console.error("Error fetching shortcuts/groups:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchShortcuts();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const userStr = localStorage.getItem('qb_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        let finalUrl = newShortcut.url;
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        }

        try {
            // 1. If creating a new group, save it first
            if (isCreatingNewGroup && newShortcut.groupName) {
                const gRes = await fetch(API_ENDPOINTS.SHORTCUT_GROUPS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        name: newShortcut.groupName.split('/').pop(),
                        fullPath: newShortcut.groupName
                    })
                });
                if (gRes.ok) {
                    const newGroup = await gRes.json();
                    setGroups(prev => [...prev.filter(g => g.fullPath !== newGroup.fullPath), newGroup]);
                }
            }

            // 2. Save the shortcut
            const res = await fetch(API_ENDPOINTS.SHORTCUTS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newShortcut,
                    url: finalUrl,
                    userId: user.id
                })
            });
            if (res.ok) {
                const data = await res.json();
                setShortcuts([...shortcuts, data]);
                setIsOpen(false);
                setIsCreatingNewGroup(false);
                setNewShortcut({ name: "", url: "", groupName: "General" });
                toast.success("Shortcut added");
            }
        } catch (error) {
            toast.error("Failed to add shortcut");
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingShortcut) return;

        let finalUrl = editingShortcut.url;
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        }

        try {
            const res = await fetch(`${API_ENDPOINTS.SHORTCUTS}/${editingShortcut._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editingShortcut,
                    url: finalUrl
                })
            });
            if (res.ok) {
                const data = await res.json();
                setShortcuts(shortcuts.map(s => s._id === data._id ? data : s));
                setIsEditOpen(false);
                setEditingShortcut(null);
                toast.success("Shortcut updated");
            }
        } catch (error) {
            toast.error("Failed to update shortcut");
        }
    };

    const handleRenameGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGroup) return;

        const userStr = localStorage.getItem('qb_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        const newPath = editingGroup.oldPath.split('/').slice(0, -1).concat(editingGroup.newName).join('/');

        try {
            const res = await fetch(`${API_ENDPOINTS.SHORTCUT_GROUPS}/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldPath: editingGroup.oldPath,
                    newPath: newPath
                })
            });
            if (res.ok) {
                toast.success("Folder renamed");
                setIsEditGroupOpen(false);
                setEditingGroup(null);
                fetchShortcuts(); // Refresh everything to update paths
            }
        } catch (error) {
            toast.error("Failed to rename folder");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_ENDPOINTS.SHORTCUTS}/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Shortcut removed");
                setShortcuts(shortcuts.filter(s => s._id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleDeleteGroup = async (groupPath: string) => {
        const userStr = localStorage.getItem('qb_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        if (!confirm(`Are you sure you want to delete the folder "${groupPath}" and all its contents?`)) {
            return;
        }

        try {
            const res = await fetch(`${API_ENDPOINTS.SHORTCUT_GROUPS}/${user.id}?path=${encodeURIComponent(groupPath)}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setShortcuts(shortcuts.filter(s => !s.groupName.startsWith(groupPath)));
                setGroups(groups.filter(g => !g.fullPath.startsWith(groupPath)));
                toast.success(`Folder "${groupPath}" deleted`);
            }
        } catch (error) {
            console.error("Delete group error:", error);
            toast.error("Failed to delete folder");
        }
    };

    const handleAddInFolder = (groupPath: string) => {
        setNewShortcut({ ...newShortcut, groupName: groupPath });
        setIsCreatingNewGroup(false);
        setIsOpen(true);
    };

    const buildTree = (shortcuts: Shortcut[]): Record<string, GroupData> => {
        const tree: Record<string, GroupData> = {};

        // Add groups from DB first
        groups.forEach(g => {
            const pathParts = g.fullPath.split('/');
            let current = tree;

            pathParts.forEach((part, index) => {
                const currentPath = pathParts.slice(0, index + 1).join('/');
                if (!current[part]) {
                    current[part] = {
                        name: part,
                        fullPath: currentPath,
                        shortcuts: [],
                        subfolders: {}
                    };
                }

                // If it's the last part, we can attach DB properties
                if (index === pathParts.length - 1) {
                    current[part]._id = g._id;
                    current[part].isDefault = g.isDefault;
                }

                current = current[part].subfolders;
            });
        });

        // Add shortcuts
        shortcuts.forEach(shortcut => {
            const groupPath = shortcut.groupName || 'General';
            const pathParts = groupPath.split('/');
            let currentLevel = tree;
            let currentGroup: GroupData | null = null;

            pathParts.forEach((part, index) => {
                const currentPath = pathParts.slice(0, index + 1).join('/');
                if (!currentLevel[part]) {
                    currentLevel[part] = {
                        name: part,
                        fullPath: currentPath,
                        shortcuts: [],
                        subfolders: {}
                    };
                }
                currentGroup = currentLevel[part];
                currentLevel = currentLevel[part].subfolders;
            });

            if (currentGroup) {
                currentGroup.shortcuts.push(shortcut);
            }
        });

        return tree;
    };

    const tree = buildTree(shortcuts);

    const FolderView = ({ group, depth = 0 }: { group: GroupData, depth?: number }) => {
        const isExpanded = expandedGroups.includes(group.fullPath);
        const hasContent = group.shortcuts.length > 0 || Object.keys(group.subfolders).length > 0;

        if (!hasContent && !["General", "Finance", "Communication", "Finance/Banks"].includes(group.fullPath)) {
            return null;
        }

        return (
            <div className={cn(
                "space-y-4 border rounded-xl p-4 transition-all duration-300",
                isExpanded
                    ? "border-primary/20 bg-primary/5 shadow-sm ring-1 ring-primary/5"
                    : "border-slate-100 bg-white/50 hover:border-slate-200",
                depth > 0 && "ml-6 border-l-2"
            )}>
                <div
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none group/header"
                >
                    <div className="flex items-center gap-2 flex-grow" onClick={() => toggleGroup(group.fullPath)}>
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-primary" /> : <ChevronRight className="w-5 h-5" />}
                        <Folder className={cn(
                            "w-5 h-5 transition-colors",
                            isExpanded ? "text-primary" : "text-slate-400 group-hover/header:text-primary"
                        )} />
                        <span className={cn(
                            "transition-colors",
                            isExpanded && "text-slate-900"
                        )}>
                            {group.name}
                        </span>
                        <div className={cn(
                            "h-px flex-grow mx-2 transition-colors",
                            isExpanded ? "bg-primary/20" : "bg-slate-100"
                        )} />
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAddInFolder(group.fullPath); }}
                            className="p-1.5 hover:text-primary transition-colors"
                            title="Add shortcut to this folder"
                        >
                            <PlusCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingGroup({ oldPath: group.fullPath, newName: group.name });
                                setIsEditGroupOpen(true);
                            }}
                            className="p-1.5 hover:text-primary transition-colors"
                            title="Rename folder"
                        >
                            <Pencil className="w-4.5 h-4.5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.fullPath); }}
                            className="p-1.5 hover:text-red-500 transition-colors"
                            title="Delete folder and all contents"
                        >
                            <Trash2 className="w-4.5 h-4.5" />
                        </button>
                    </div>

                    {(group.shortcuts.length > 0 || !isExpanded) && (
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-400 ml-2">
                            {group.shortcuts.length}
                        </span>
                    )}
                </div>

                {isExpanded && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {group.shortcuts.length > 0 && (
                            <div className="flex flex-wrap gap-4">
                                {group.shortcuts.sort((a, b) => a.name.localeCompare(b.name)).map((shortcut) => (
                                    <ShortcutItem
                                        key={shortcut._id}
                                        shortcut={shortcut}
                                        onDelete={handleDelete}
                                        onEdit={(s) => {
                                            setEditingShortcut(s);
                                            setIsEditOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        {Object.values(group.subfolders).length > 0 && (
                            <div className="space-y-4">
                                {Object.values(group.subfolders).map(sub => (
                                    <FolderView key={sub.fullPath} group={sub} depth={depth + 1} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading && shortcuts.length === 0) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-primary" />
                    Shortcuts
                </h2>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full shadow-sm">
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add Shortcut
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[80vw] w-[80vw] min-h-[80vh] flex flex-col transition-all duration-300">
                        <form onSubmit={handleAdd} className="flex-grow flex flex-col justify-between py-10">
                            <div className="max-w-4xl mx-auto w-full">
                                <DialogHeader className="mb-12 text-center">
                                    <DialogTitle className="text-4xl font-bold tracking-tight">Add New Shortcut</DialogTitle>
                                    <DialogDescription className="text-xl mt-2">
                                        Keep your most used tools just one click away.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-10">
                                    <div className="grid lg:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-lg font-semibold">Shortcut Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. WhatsApp Business"
                                                className="h-14 text-lg px-6 rounded-xl border-slate-200 focus:ring-primary/20 transition-all"
                                                value={newShortcut.name}
                                                onChange={(e) => setNewShortcut({ ...newShortcut, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="url" className="text-lg font-semibold">Destination URL</Label>
                                            <Input
                                                id="url"
                                                placeholder="https://web.whatsapp.com"
                                                className="h-14 text-lg px-6 rounded-xl border-slate-200 focus:ring-primary/20 transition-all"
                                                value={newShortcut.url}
                                                onChange={(e) => setNewShortcut({ ...newShortcut, url: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="group" className="text-lg font-semibold">Organize into Group</Label>
                                            <button
                                                type="button"
                                                onClick={() => setIsCreatingNewGroup(!isCreatingNewGroup)}
                                                className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-glow transition-colors"
                                            >
                                                {isCreatingNewGroup ? "Select Existing Group" : "+ Create New Group"}
                                            </button>
                                        </div>

                                        {isCreatingNewGroup ? (
                                            <Input
                                                id="group"
                                                placeholder="e.g. Communication, Marketing, Analytics"
                                                className="h-14 text-lg px-6 rounded-xl bg-white border-slate-200 focus:ring-primary/20 transition-all"
                                                value={newShortcut.groupName}
                                                onChange={(e) => setNewShortcut({ ...newShortcut, groupName: e.target.value })}
                                                autoFocus
                                            />
                                        ) : (
                                            <Select
                                                value={newShortcut.groupName}
                                                onValueChange={(value) => setNewShortcut({ ...newShortcut, groupName: value })}
                                            >
                                                <SelectTrigger className="h-14 text-lg px-6 rounded-xl bg-white border-slate-200">
                                                    <SelectValue placeholder="Select a folder..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                                    {groups.map(g => (
                                                        <SelectItem key={g.fullPath} value={g.fullPath} className="py-3 px-6 text-lg">
                                                            {g.fullPath.replace(/\//g, ' / ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="sm:justify-center gap-4 mt-8">
                                <Button type="button" variant="ghost" size="lg" className="px-10 h-14 text-lg rounded-xl" onClick={() => setIsOpen(false)}>
                                    Discard
                                </Button>
                                <Button type="submit" size="lg" className="px-12 h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                                    Create Shortcut
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Shortcut Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[80vw] w-[80vw] min-h-[80vh] flex flex-col transition-all duration-300">
                        {editingShortcut && (
                            <form onSubmit={handleEdit} className="flex-grow flex flex-col justify-between py-10">
                                <div className="max-w-4xl mx-auto w-full">
                                    <DialogHeader className="mb-12 text-center">
                                        <DialogTitle className="text-4xl font-bold tracking-tight">Edit Shortcut</DialogTitle>
                                        <DialogDescription className="text-xl mt-2">
                                            Update the details for "{editingShortcut.name}".
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-10">
                                        <div className="grid lg:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <Label htmlFor="edit-name" className="text-lg font-semibold">Shortcut Name</Label>
                                                <Input
                                                    id="edit-name"
                                                    className="h-14 text-lg px-6 rounded-xl border-slate-200 focus:ring-primary/20 transition-all"
                                                    value={editingShortcut.name}
                                                    onChange={(e) => setEditingShortcut({ ...editingShortcut, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label htmlFor="edit-url" className="text-lg font-semibold">Destination URL</Label>
                                                <Input
                                                    id="edit-url"
                                                    className="h-14 text-lg px-6 rounded-xl border-slate-200 focus:ring-primary/20 transition-all"
                                                    value={editingShortcut.url}
                                                    onChange={(e) => setEditingShortcut({ ...editingShortcut, url: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                            <Label htmlFor="edit-group" className="text-lg font-semibold">Move to Group</Label>
                                            <Select
                                                value={editingShortcut.groupName}
                                                onValueChange={(value) => setEditingShortcut({ ...editingShortcut, groupName: value })}
                                            >
                                                <SelectTrigger className="h-14 text-lg px-6 rounded-xl bg-white border-slate-200">
                                                    <SelectValue placeholder="Select a folder..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                                    {groups.map(g => (
                                                        <SelectItem key={g.fullPath} value={g.fullPath} className="py-3 px-6 text-lg">
                                                            {g.fullPath.replace(/\//g, ' / ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="sm:justify-center gap-4 mt-8">
                                    <Button type="button" variant="ghost" size="lg" className="px-10 h-14 text-lg rounded-xl" onClick={() => setIsEditOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="lg" className="px-12 h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Rename Folder Dialog */}
                <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
                    <DialogContent className="sm:max-w-[600px] transition-all duration-300">
                        {editingGroup && (
                            <form onSubmit={handleRenameGroup} className="py-6">
                                <DialogHeader className="mb-8">
                                    <DialogTitle className="text-2xl font-bold">Rename Folder</DialogTitle>
                                    <DialogDescription>
                                        Enter a new name for the folder "{editingGroup.oldPath}".
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-group-name">Folder Name</Label>
                                        <Input
                                            id="new-group-name"
                                            className="h-12 rounded-xl"
                                            value={editingGroup.newName}
                                            onChange={(e) => setEditingGroup({ ...editingGroup, newName: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="mt-8 gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsEditGroupOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Rename Folder
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {Object.values(tree).map((group) => (
                    <FolderView key={group.fullPath} group={group} />
                ))}
            </div>
        </div>
    );
};

