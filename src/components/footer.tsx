import Link from 'next/link';
import { Brain, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t mt-auto">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                AkılHane
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400">
              AI Destekli Kişiselleştirilmiş Eğitim Platformu.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                Sayfalar
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <Link href="/quiz" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Test Çöz
                  </Link>
                </li>
                <li>
                  <Link href="/flashcard" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Flashcard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                Yasal
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Kullanım Şartları
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex justify-center md:justify-end items-start">
             <div className="text-left md:text-right">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                    Bizi Takip Edin
                </h3>
                <div className="flex mt-4 space-x-6 justify-start md:justify-end">
                    <a href="https://www.producthunt.com/@melihcandemir" className="text-gray-400 hover:text-gray-500 transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                        <span className="sr-only">Product Hunt</span>
                        {/* Product Hunt icon styled to match other icons */}
                        <span className="flex items-center justify-center h-6 w-6 rounded-full border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 font-bold text-base hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-200" style={{fontFamily: 'Inter, sans-serif'}}>P</span>
                    </a>
                    <a href="https://github.com/melihcanndemir/akilhane" className="text-gray-400 hover:text-gray-500 transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                        <span className="sr-only">GitHub</span>
                        <Github className="h-6 w-6" />
                    </a>
                    <a href="https://www.linkedin.com/in/melihcandemir/" className="text-gray-400 hover:text-gray-500 transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                        <span className="sr-only">LinkedIn</span>
                        <Linkedin className="h-6 w-6" />
                    </a>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-400">
            © {new Date().getFullYear()} AkılHane. Tüm hakları saklıdır.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            <a 
              href="https://www.linkedin.com/in/melihcandemir/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Melih Can Demir
            </a>
            {' '}tarafından ❤️ ile oluşturuldu
          </p>
        </div>
      </div>
    </footer>
  );
} 