
import { useState, useEffect } from "react";
import { Plus, X, Globe, ExternalLink, Folder, ChevronDown, ChevronRight } from "lucide-react";
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

const ShortcutItem = ({ shortcut, onDelete }: { shortcut: Shortcut; onDelete: (id: string) => void }) => {
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
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onDelete(shortcut._id);
                }}
                className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

export const ShortcutsGrid = () => {
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [newShortcut, setNewShortcut] = useState({
        name: "",
        url: "",
        groupName: "General"
    });
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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
            const res = await fetch(`${API_ENDPOINTS.SHORTCUTS}/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setShortcuts(data);
            }
        } catch (error) {
            console.error(error);
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
            const res = await fetch(API_ENDPOINTS.SHORTCUTS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newShortcut,
                    url: finalUrl,
                    userId: user.id
                })
            });

            if (res.ok) {
                toast.success("Shortcut added");
                setIsOpen(false);
                setNewShortcut({ name: "", url: "", groupName: "General" });
                fetchShortcuts();
            }
        } catch (error) {
            toast.error("Failed to add shortcut");
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

    const groups = shortcuts.reduce((acc, curr) => {
        const group = curr.groupName || 'General';
        if (!acc[group]) acc[group] = [];
        acc[group].push(curr);
        return acc;
    }, {} as Record<string, Shortcut[]>);

    Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

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
                                                    <SelectItem value="General" className="py-3 px-6 text-lg">General</SelectItem>
                                                    {Array.from(new Set(shortcuts.map(s => s.groupName)))
                                                        .filter(group => group && group !== "General")
                                                        .map(group => (
                                                            <SelectItem key={group} value={group} className="py-3 px-6 text-lg">
                                                                {group}
                                                            </SelectItem>
                                                        ))
                                                    }
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
            </div>

            {Object.keys(groups).length === 0 && !isLoading && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-lg text-slate-500">No shortcuts yet. Add your first one to get started!</p>
                </div>
            )}

            <div className="grid gap-4">
                {Object.entries(groups).map(([groupName, groupShortcuts]) => {
                    const isExpanded = expandedGroups.includes(groupName);
                    return (
                        <div key={groupName} className="space-y-4 border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors bg-white/50">
                            <div
                                className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none group/header"
                                onClick={() => toggleGroup(groupName)}
                            >
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4" />}
                                <Folder className="w-4 h-4 text-slate-400 group-hover/header:text-primary transition-colors" />
                                {groupName}
                                <div className="h-px bg-slate-100 flex-grow mx-2" />
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-400">
                                    {groupShortcuts.length}
                                </span>
                            </div>

                            {isExpanded && (
                                <div className="flex flex-wrap gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {groupShortcuts.map((shortcut) => (
                                        <ShortcutItem
                                            key={shortcut._id}
                                            shortcut={shortcut}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
