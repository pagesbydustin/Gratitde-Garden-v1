
'use client';

import { ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserContext } from '@/context/UserContext';
import { AdminAuthContext } from '@/context/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';

const formSchema = z.object({
  passcode: z.string().min(1, 'Passcode is required.'),
});

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSCODE = 'admin123';

export function AdminAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { currentUser, loading: userLoading } = useContext(UserContext);
  const { isAdminAuthenticated, login } = useContext(AdminAuthContext);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { passcode: '' },
  });

  useEffect(() => {
    // If a non-admin user tries to access an admin page, redirect them.
    if (!userLoading && currentUser?.email !== ADMIN_EMAIL) {
      router.push('/');
    }
  }, [currentUser, userLoading, router]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (login(values.passcode)) {
      toast({ title: 'Access Granted', description: 'Welcome, Admin!' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The passcode you entered is incorrect.',
      });
      form.reset();
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (currentUser?.email !== ADMIN_EMAIL) {
    return null; // Render nothing while redirecting
  }
  
  if (isAdminAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Admin Access Required
          </CardTitle>
          <CardDescription>Please enter the passcode to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="passcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Passcode</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Authenticate
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
