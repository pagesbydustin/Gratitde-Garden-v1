
'use client';

import { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GratitudeIcon } from '@/components/icons';
import { Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminAuthContext } from '@/context/AdminAuthContext';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';

export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { users, currentUser, setCurrentUser, loading: userLoading } = useContext(UserContext);
  const { isAdminLoggedIn, login } = useContext(AdminAuthContext);
  const { toast } = useToast();

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
        setCurrentUser(selectedUser);
        toast({
            title: `Switched to ${selectedUser.name}`,
            description: `You are now viewing the journal as ${selectedUser.name}.`,
        });
        if (selectedUser.email !== ADMIN_EMAIL) {
          router.push('/');
        }
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/overview', label: 'Yearly Overview' },
    { href: '/archive', label: 'Weekly Archive' },
  ];
  
  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/overview', label: 'Stats Overview' },
  ];
  
  const isAdminSelected = currentUser?.email === ADMIN_EMAIL;
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (isAdminSelected && href.startsWith('/admin')) {
        if (!isAdminLoggedIn) {
            e.preventDefault();
            login().then(success => {
                if (success) {
                    router.push(href);
                }
            });
        }
      }
      setIsSheetOpen(false);
  }

  const NavLink = ({ href, label, isMobile }: { href: string; label: string; isMobile?: boolean }) => (
    <Button
      asChild
      variant={pathname === href ? 'secondary' : 'ghost'}
      size={isMobile ? 'lg' : 'sm'}
      className={cn(isMobile && 'w-full justify-start text-lg')}
    >
      <Link href={href} onClick={(e) => handleNavClick(e, href)}>{label}</Link>
    </Button>
  );
  
  const linksToShow = isAdminSelected ? adminLinks : navLinks.filter(link => link.href !== '/');

  useEffect(() => {
    if (userLoading) return;
    
    // If the admin user is selected but not logged in, and tries to access an admin page directly
    if (isAdminSelected && !isAdminLoggedIn && pathname.startsWith('/admin')) {
      login().then(success => {
        if (!success) {
          router.push('/');
        }
      })
    } else if (!isAdminSelected && pathname.startsWith('/admin')) {
      // If a non-admin user tries to access an admin page
      router.push('/');
    }
  }, [isAdminSelected, isAdminLoggedIn, pathname, router, login, userLoading]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left side: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <GratitudeIcon className="h-6 w-6 text-primary" />
            <span className="font-bold hidden sm:inline-block">Gratitude Garden</span>
          </Link>
        </div>
        
        {/* Right side: Desktop and Mobile Navigation */}
        <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
                <NavLink href="/" label="Home" />
                {linksToShow.map((link) => (
                    <NavLink key={link.href} href={link.href} label={link.label} />
                ))}
            </nav>
            
            <Select onValueChange={handleUserChange} value={currentUser?.id}>
              <SelectTrigger className="w-[180px] hidden md:flex">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <SelectValue placeholder="Select a user" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className='ml-2'>
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-4 pt-8">
                             <div className="px-2">
                                <Select onValueChange={handleUserChange} value={currentUser?.id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <NavLink href="/" label="Home" isMobile />
                            {linksToShow.map((link) => (
                                <NavLink key={`mobile-${link.href}`} href={link.href} label={link.label} isMobile />
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
