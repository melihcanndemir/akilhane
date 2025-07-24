'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // Check if already installed
    if (checkIfInstalled()) {
      return;
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay to not interrupt user
      setTimeout(() => {
        if (!isDismissed && !isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Listen for app install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      console.log('🎉 PWA installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, [isDismissed, isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ User accepted the install prompt');
          setShowInstallPrompt(false);
        } else {
          console.log('❌ User dismissed the install prompt');
          handleDismiss();
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ Error during install:', error);
        handleDismiss();
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleRemindLater = () => {
    setShowInstallPrompt(false);
    // Show again in 1 hour
    setTimeout(() => {
      if (!isInstalled && !isDismissed) {
        setShowInstallPrompt(true);
      }
    }, 60 * 60 * 1000);
  };

  if (isInstalled || isDismissed || !showInstallPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  AkılHane'i Yükle
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Daha hızlı erişim
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              AkılHane'i ana ekranınıza ekleyerek daha hızlı erişim sağlayın ve çevrimdışı çalışın.
            </p>
            
            {/* Benefits */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Hızlı erişim</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Çevrimdışı çalışma</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Push bildirimleri</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleInstall} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Yükle
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRemindLater}
              size="sm"
              className="text-xs"
            >
              Daha Sonra
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 