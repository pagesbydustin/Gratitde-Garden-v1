'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash, UserPlus, Check, ShieldAlert } from 'lucide-react';
import { UserFormDialog } from '@/components/admin/UserFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
    const { currentUser, users, deleteUser, refreshUsers } = useContext(UserContext);
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsMounted(true);
        if (currentUser && currentUser.name !== 'Admin') {
            router.push('/');
        }
    }, [currentUser, router]);

    const handleAddUser = () => {
        setEditingUser(null);
        setIsDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsDialogOpen(true);
    };
    
    const handleDeleteUser = async (userId: number) => {
        const result = await deleteUser(userId);
        if (result.success) {
            toast({ title: 'User Deleted', description: 'The user has been successfully removed.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not delete the user.' });
        }
    }
    
    const handleDialogClose = (wasSaved: boolean) => {
        setIsDialogOpen(false);
        if (wasSaved) {
            refreshUsers();
        }
    }

    if (!isMounted || !currentUser) {
        return (
             <div className="flex justify-center min-h-screen">
                <main className="w-full max-w-4xl px-4 py-8 md:py-12 space-y-12">
                    <Skeleton className="h-12 w-1/3" />
                    <Skeleton className="h-8 w-2/3" />
                    <Card>
                        <CardHeader>
                             <Skeleton className="h-8 w-1/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    if (currentUser.name !== 'Admin') {
        return (
            <div className="flex justify-center min-h-screen items-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><ShieldAlert /> Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You do not have permission to view this page.</p>
                        <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }


    return (
        <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
            <main className="w-full max-w-4xl px-4 py-8 md:py-12 space-y-12">
                <header className="space-y-2">
                    <h1 className="text-4xl font-headline font-bold text-primary">User Management</h1>
                    <p className="text-muted-foreground">Add, edit, or remove user profiles.</p>
                </header>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>A list of all users in the system.</CardDescription>
                        </div>
                        <Button onClick={handleAddUser}>
                            <UserPlus className="mr-2" />
                            Add User
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Can Edit Entries?</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="flex items-center">
                                            {user['can-edit'] ? <Check className="text-green-500" /> : <div className="w-4 h-4" />}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} disabled={user.name === 'Admin' && currentUser.id !== user.id}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={user.name === 'Admin'}>
                                                        <Trash className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the user and all their associated entries.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <UserFormDialog
                    isOpen={isDialogOpen}
                    onClose={handleDialogClose}
                    user={editingUser}
                />
            </main>
        </div>
    );
}
