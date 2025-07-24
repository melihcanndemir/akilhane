'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  BookOpen,
  Brain,
  Database,
  GraduationCap,
  Users,
  Play,
  Menu,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const navLinks = [
  { href: '/', label: 'Ana Sayfa', icon: Brain },
  { href: '/login', label: 'Giriş Yap', icon: Users },
  { href: '/demo', label: 'Demo', icon: Play },
  { href: '/question-manager', label: 'Soru Yöneticisi', icon: Database },
  { href: '/subject-manager', label: 'Ders Yöneticisi', icon: GraduationCap },
  { href: '/quiz', label: 'Test Çöz', icon: BookOpen },
  { href: '/flashcard', label: 'Flashcard', icon: Brain },
  { href: '/ai-chat', label: 'AI Asistan', icon: Users },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-slate-900/10 dark:border-slate-50/10 bg-background/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/25 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline font-bold text-xl text-blue-600">AkılHane</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right"
                className="glass-sheet"
              >
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Ana navigasyon menüsü
                </SheetDescription>
                <div className="flex flex-col gap-4 p-4">
                <Link href="/" className="flex items-center gap-2 mb-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                        <Brain className="h-8 w-8 text-white" />
                    </div>
                    <span className="font-headline font-bold text-2xl text-blue-600">AkılHane</span>
                </Link>
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  ))}
                  <div className="mt-auto">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
} 