
'use client';

import { useContext, useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserContext } from '@/context/UserContext';
import { SettingsContext, type Settings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash, UserPlus, Check, ShieldAlert, Save } from 'lucide-react';
import { UserFormDialog } from '@/components/admin/UserFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getUsers } from '@/lib/actions';
import { AdminAuth } from '@/components/admin/AdminAuth';

const settingsFormSchema = z.object({
    gratitudePrompt: z.string().min(5, 'Prompt must be at least 5 characters.'),
    showExplanation: z.boolean(),
});

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';

function DashboardPageContent() {
    const { deleteUser, users } = useContext(UserContext);
    const { settings, updateSettings } = useContext(SettingsContext);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSettingsPending, startSettingsTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof settingsFormSchema>>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            gratitudePrompt: '',
            showExplanation: true,
        },
    });

    const fetchUsers = async () => {
        setUsersLoading(true);
        const users = await getUsers();
        setAllUsers(users);
        setUsersLoading(false);
    }

    useEffect(() => {
        fetchUsers();
    }, []);
    
    useEffect(() => {
        if (settings) {
            form.reset(settings);
        }
    }, [settings, form]);
    
    const handleAddUser = () => {
        setEditingUser(null);
        setIsDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsDialogOpen(true);
    };
    
    const handleDeleteUser = async (userId: string) => {
        const result = await deleteUser(userId);
        if (result.success) {
            toast({ title: 'User Deleted', description: 'The user has been successfully removed.' });
            fetchUsers(); // Refresh users list
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not delete the user.' });
        }
    }
    
    const handleDialogClose = (wasSaved: boolean) => {
        setIsDialogOpen(false);
        if (wasSaved) {
            fetchUsers(); // Refresh users list
        }
    }

    const onSettingsSubmit = (values: z.infer<typeof settingsFormSchema>) => {
        startSettingsTransition(async () => {
            const result = await updateSettings(values as Settings);
            if (result.success) {
                toast({
                    title: 'Settings Saved',
                    description: 'The application settings have been updated.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'There was a problem saving the settings.',
                });
            }
        });
    }

    if (usersLoading) {
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

    return (
        <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
            <main className="w-full max-w-4xl px-4 py-8 md:py-12 space-y-12">
                <header className="space-y-2">
                    <h1 className="text-4xl font-headline font-bold text-primary">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage user profiles and application settings.</p>
                </header>

                 <Card>
                    <CardHeader>
                        <CardTitle>Application Settings</CardTitle>
                        <CardDescription>Manage global settings for the application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSettingsSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="gratitudePrompt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gratitude Prompt</FormLabel>
                                            <FormControl>
                                                <Input placeholder="What are you grateful for?" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                The prompt displayed on the new entry form.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="showExplanation"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Show "How To" Guide</FormLabel>
                                                <FormDescription>
                                                    Display the "How to Get Started" section on the homepage.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSettingsPending}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSettingsPending ? 'Saving...' : 'Save Settings'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>Add, edit, or remove user profiles.</CardDescription>
                        </div>
                        <Button onClick={handleAddUser} disabled={false}>
                            <UserPlus className="mr-2" />
                            Add User
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Can Edit Entries?</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usersLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            <Skeleton className="h-8 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ) : allUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user['can-edit'] ? <Check className="text-green-500" /> : <div className="w-4 h-4" />}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} disabled={user.email === ADMIN_EMAIL}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={user.email === ADMIN_EMAIL}>
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
                                                        <AlertDialogAction onClick={() => user.id && handleDeleteUser(user.id)}>Delete</AlertDialogAction>
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


export default function Dashboard() {
    return (
        <AdminAuth>
            <DashboardPageContent />
        </AdminAuth>
    )
}
