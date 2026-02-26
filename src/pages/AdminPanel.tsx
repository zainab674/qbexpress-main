import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/config";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import UserDocumentsModal from "@/components/UserDocumentsModal";
import { FileUp, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
    _id: string;
    email: string;
    name?: string;
    company?: string;
    role: string;
    createdAt: string;
}

const AdminPanel = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string, email: string } | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const userStr = localStorage.getItem("qb_user");
            if (!userStr) return;
            const admin = JSON.parse(userStr);

            try {
                const response = await fetch(`${API_ENDPOINTS.USERS_ALL}?adminId=${admin.id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        const userStr = localStorage.getItem("qb_user");
        if (!userStr) return;
        const admin = JSON.parse(userStr);

        try {
            const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}/role?adminId=${admin.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update role");
            }

            toast.success("User role updated successfully");

            // Update local state
            setUsers(prevUsers => prevUsers.map(user =>
                user._id === userId ? { ...user, role: newRole.toLowerCase() } : user
            ));
        } catch (error: any) {
            console.error("Error updating role:", error);
            toast.error(error.message || "Failed to update role");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container-wide pt-24 pb-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Admin Panel - All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead>Change Role</TableHead>
                                            <TableHead>Documents</TableHead>
                                            <TableHead>Upload</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role?.toLowerCase() === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                                                        }`}>
                                                        {user.role || 'user'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        defaultValue={user.role?.toLowerCase()}
                                                        onValueChange={(value) => handleRoleChange(user._id, value)}
                                                    >
                                                        <SelectTrigger className="w-[120px] h-8 text-xs">
                                                            <SelectValue placeholder="Select role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedUser({ id: user._id, email: user.email });
                                                                setIsDocsModalOpen(true);
                                                            }}
                                                            title="View Documents"
                                                        >
                                                            <FolderOpen className="w-4 h-4 text-blue-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setSelectedUser({ id: user._id, email: user.email });
                                                            setIsUploadModalOpen(true);
                                                        }}
                                                        title="Upload New"
                                                    >
                                                        <FileUp className="w-4 h-4 text-primary" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {selectedUser && (
                <>
                    <UploadDocumentModal
                        isOpen={isUploadModalOpen}
                        onClose={() => {
                            setIsUploadModalOpen(false);
                            setSelectedUser(null);
                        }}
                        userId={selectedUser.id}
                        userEmail={selectedUser.email}
                    />
                    <UserDocumentsModal
                        isOpen={isDocsModalOpen}
                        onClose={() => {
                            setIsDocsModalOpen(false);
                            setSelectedUser(null);
                        }}
                        userId={selectedUser.id}
                        userEmail={selectedUser.email}
                    />
                </>
            )}
        </div>
    );
};

export default AdminPanel;
