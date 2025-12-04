
'use client';

import { useEffect, useContext, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/context/UserContext';
import type { User } from '@/lib/types';
import { addUser } from '@/lib/actions';

type UserFormDialogProps = {
    isOpen: boolean;
    onClose: (wasSaved: boolean) => void;
    user: User | null;
};

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email.'),
    'can-edit': z.boolean().default(false),
});

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';

export function UserFormDialog({ isOpen, onClose, user }: UserFormDialogProps) {
    const [isPending, startTransition] = useTransition();
    const { updateUser } = useContext(UserContext);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            'can-edit': false,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (user) {
                form.reset({ name: user.name ?? '', email: user.email ?? '', 'can-edit': user['can-edit'] });
            } else {
                form.reset({ name: '', email: '', 'can-edit': false });
            }
        }
    }, [user, form, isOpen]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(async () => {
            const result = user && user.id 
                ? await updateUser({ id: user.id, ...values })
                : await addUser({ id: crypto.randomUUID(), ...values });

            if (result.success) {
                toast({
                    title: user ? 'User Updated' : 'User Added',
                    description: `The user ${values.name} has been saved.`,
                });
                onClose(true);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error?.name?.[0] || result.error?.form?.[0] || 'There was a problem saving the user.',
                });
            }
        });
    };
    
    const isEditingAdmin = user?.email === ADMIN_EMAIL;

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {user ? 'Change the details for this user.' : 'Create a new user profile.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Jane Doe" {...field} disabled={isEditingAdmin}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="e.g., jane@example.com" {...field} disabled={isEditingAdmin}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="can-edit"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Editing Permissions</FormLabel>
                                        <FormDescription>
                                            Allow this user to edit their own journal entries.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isEditingAdmin}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onClose(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending || isEditingAdmin}>
                                {isPending ? 'Saving...' : 'Save User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
