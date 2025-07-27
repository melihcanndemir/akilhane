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
  LogOut,
  User,
  Settings,
  Home,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout, isAuthenticated } = useAuth();

  // Debug logging
  console.log('🧭 MobileNav state:', { 
    user: user?.email || 'none', 
    loading, 
    isAuthenticated,
    userObject: user 
  });

  const navLinks = [
    { href: '/landing', label: 'Tanıtım', icon: Home },
    { href: '/demo', label: 'Demo', icon: Play },
    { href: '/dashboard', label: 'Gösterge Paneli', icon: Brain },
    { href: '/quiz', label: 'Test Çöz', icon: BookOpen },
    { href: '/flashcard', label: 'Flashcard', icon: Brain },
    { href: '/ai-chat', label: 'AI Asistan', icon: Users },
    { href: '/question-manager', label: 'Soru Yöneticisi', icon: Database },
    { href: '/subject-manager', label: 'Ders Yöneticisi', icon: GraduationCap },
  ];

  return (
    <nav className="bg-background/75 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline font-bold text-xl text-blue-600">AkılHane</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1.5 hover:bg-primary/10 dark:hover:bg-primary/20"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
            
            <ThemeToggle />
            
            {/* Authentication Status */}
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-primary/10 dark:hover:bg-primary/20 max-w-[200px]">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {user?.email?.split('@')[0] || user?.user_metadata?.full_name || 'Kullanıcı'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/95 border border-border w-64">
                  {/* User Email Display */}
                  <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border">
                    <div className="break-words break-all">
                      {user?.email}
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Ayarlar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 hover:bg-primary/10 dark:hover:bg-primary/20">
                  <User className="w-4 h-4" />
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {/* LOGIN BUTTON - RETURNED */}
            {!loading && !isAuthenticated && (
              <Link href="/login">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Giriş
                </Button>
              </Link>
            )}
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="glass-card-inner hover:scale-105 transition-all duration-300"
                >
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
                <div className="flex flex-col h-full">
                  {/* Fixed Header - Logo */}
                  <div className="flex-shrink-0 p-4 pb-2">
                    <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                          <Brain className="h-8 w-8 text-white" />
                      </div>
                      <span className="font-headline font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AkılHane</span>
                    </Link>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                    {/* User Info and Logout Button */}
                    {isAuthenticated && user && (
                      <div className="space-y-3">
                        {/* User Information */}
                        <div className="glass-card-inner p-3 rounded-lg shadow-lg">
                          <div className="flex items-start gap-2 text-sm text-foreground">
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="font-medium break-words break-all min-w-0">{user.email}</span>
                          </div>
                          {user.user_metadata?.full_name && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {user.user_metadata.full_name}
                            </div>
                          )}
                        </div>
                        
                        {/* Logout button - immediately below user information */}
                        <Button
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                          variant="ghost"
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50/20 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 justify-start transition-all duration-300 hover:scale-105 border border-red-200/30 dark:border-red-800/30"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Çıkış Yap</span>
                        </Button>
                      </div>
                    )}

                    {/* Navigation Links */}
                    <div className="space-y-2">
                      {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group hover:scale-105"
                        >
                          <Icon className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                          <span className="font-medium group-hover:text-foreground transition-colors duration-300">{label}</span>
                        </Link>
                      ))}
                      
                      {isAuthenticated && (
                        <Link
                          href="/settings"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group hover:scale-105"
                        >
                          <Settings className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                          <span className="font-medium group-hover:text-foreground transition-colors duration-300">Ayarlar</span>
                        </Link>
                      )}
                    </div>
                    
                    {/* Extra spacing for scroll */}
                    <div className="h-4"></div>
                  </div>
                  
                  {/* Fixed Footer - Theme Toggle */}
                  <div className="flex-shrink-0 border-t border-white/20 dark:border-white/10 p-4 pt-3">
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