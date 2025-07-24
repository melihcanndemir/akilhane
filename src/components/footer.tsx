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
                  <Link href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
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
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">X</span>
                        <svg
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">GitHub</span>
                        <Github className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-500">
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
        </div>
      </div>
    </footer>
  );
} 