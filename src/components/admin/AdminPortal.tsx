
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BarChart2, ArrowRight } from 'lucide-react';

export function AdminPortal() {
    return (
        <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
            <main className="w-full max-w-4xl px-4 py-8 md:py-12 flex flex-col">
                <header className="text-center space-y-2 mb-12">
                    <h1 className="text-4xl font-headline font-bold text-primary">Admin Portal</h1>
                    <p className="text-muted-foreground">Welcome, Admin. Select an option below to manage the application.</p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 flex-grow">
                    <Card className="flex flex-col">
                        <CardHeader className="flex-grow">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-6 w-6 text-primary" />
                                User Management
                            </CardTitle>
                            <CardDescription>
                                Access the main dashboard to add new user profiles, edit existing user details and permissions, or permanently remove users from the application. This is also where you can manage global application settings like the daily prompt.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/admin/dashboard">
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col">
                        <CardHeader className="flex-grow">
                            <CardTitle className="flex items-center gap-2">
                                <BarChart2 className="h-6 w-6 text-primary" />
                                Application Stats
                            </CardTitle>
                            <CardDescription>
                                Get a high-level overview of application usage. This section provides aggregated mood charts and other statistics from all non-admin users to help you understand overall trends and well-being. User data is anonymized.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/admin/overview">
                                    View Stats Overview
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
