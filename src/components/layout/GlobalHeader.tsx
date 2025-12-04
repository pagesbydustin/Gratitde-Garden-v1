
'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GratitudeIcon } from '@/components/icons';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

export function GlobalHeader() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { currentUser } = useContext(UserContext);
  const { toast } = useToast();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/overview', label: 'Yearly Overview' },
    { href: '/archive', label: 'Weekly Archive' },
  ];
  
  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/overview', label: 'Stats Overview' },
  ];

  const NavLink = ({ href, label, isMobile }: { href: string; label: string; isMobile?: boolean }) => (
    <Button
      asChild
      variant={pathname === href ? 'secondary' : 'ghost'}
      size={isMobile ? 'lg' : 'sm'}
      className={cn(isMobile && 'w-full justify-start text-lg')}
      onClick={() => setIsSheetOpen(false)}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
  
  const isAdmin = currentUser?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const linksToShow = isAdmin ? adminLinks : navLinks.filter(link => link.href !== '/');

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
        <div className="flex items-center gap-2">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
                <NavLink href="/" label="Home" />
                {linksToShow.map((link) => (
                    <NavLink key={link.href} href={link.href} label={link.label} />
                ))}
            </nav>

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
