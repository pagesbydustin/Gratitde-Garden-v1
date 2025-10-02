'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GratitudeIcon } from '@/components/icons';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserSelection } from './UserSelection';

export function GlobalHeader() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/overview', label: 'Yearly Overview' },
    { href: '/archive', label: 'Weekly Archive' },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                {navLinks.map((link) => (
                    <NavLink key={link.href} href={link.href} label={link.label} />
                ))}
            </nav>

            <div className="hidden md:block">
              <UserSelection />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center">
              <UserSelection />
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
                    {navLinks.map((link) => (
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
