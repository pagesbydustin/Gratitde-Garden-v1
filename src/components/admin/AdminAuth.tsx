
'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/UserContext';
import { AdminAuthContext } from '@/context/AdminAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';

type AdminAuthProps = {
  children: React.ReactNode;
};

export function AdminAuth({ children }: AdminAuthProps) {
  const router = useRouter();
  const { currentUser, loading: userLoading } = useContext(UserContext);
  const { isAdminLoggedIn, login } = useContext(AdminAuthContext);
  const isAdminUser = currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (userLoading) {
      return;
    }

    if (!isAdminUser) {
      router.push('/');
      return;
    }

    if (!isAdminLoggedIn) {
      login().then((success) => {
        if (!success) {
          router.push('/');
        }
      });
    }
  }, [isAdminUser, isAdminLoggedIn, userLoading, login, router]);

  if (userLoading) {
    return (
      <div className="flex justify-center min-h-screen">
          <main className="w-full max-w-4xl px-4 py-8 md:py-12 space-y-12">
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-8 w-2/3" />
          </main>
      </div>
    );
  }

  if (!isAdminUser) {
    // This part is mostly a fallback, as the useEffect should have redirected.
    return (
      <div className="flex justify-center min-h-screen items-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <ShieldAlert /> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page.</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdminLoggedIn) {
    return <>{children}</>;
  }

  // Show a loading/prompting state while login is in progress
  return (
    <div className="flex justify-center min-h-screen items-center">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please enter the admin passcode.</p>
          <p className="text-muted-foreground text-sm mt-2">A prompt should have appeared.</p>
        </CardContent>
      </Card>
    </div>
  );
}
