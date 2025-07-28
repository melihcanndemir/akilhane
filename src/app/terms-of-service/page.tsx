import Link from 'next/link';
import MobileNav from '@/components/mobile-nav';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <MobileNav />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">Kullanım Şartları</li>
            </ol>
          </nav>

          {/* Content Card */}
          <div className="glass-card p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Kullanım Şartları
            </h1>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-lg mb-6 text-muted-foreground">
                Bu Kullanım Şartları, AkılHane platformunu kullanımınızı düzenler. AkılHane'ye erişerek veya kullanarak bu şartlara uymayı kabul etmiş olursunuz.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  1. Şartların Kabulü
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  AkılHane'ye kayıt olarak veya kullanarak bu Kullanım Şartları'nı ve Gizlilik Politikası'nı kabul etmiş olursunuz. Kabul etmiyorsanız lütfen platformu kullanmayınız.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  2. Platformun Kullanımı
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  AkılHane'yi kişisel ve ticari olmayan eğitim amaçlı kullanabilirsiniz. Platformu kötüye kullanmamayı veya yetkisiz erişim girişiminde bulunmamayı kabul edersiniz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  3. Kullanıcı Sorumlulukları
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Hesabınızın gizliliğini korumak ve hesabınız üzerinden yapılan tüm işlemlerden sorumlu olmak sizin yükümlülüğünüzdedir. Doğru bilgi vermeyi ve gerektiğinde güncellemeyi kabul edersiniz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  4. Sınırlamalar ve Sorumluluk Reddi
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  AkılHane "olduğu gibi" sunulmaktadır ve herhangi bir garanti verilmemektedir. Platformun kullanımından doğabilecek zararlardan sorumlu değiliz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  5. İletişim
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Bu şartlarla ilgili sorularınız için lütfen{' '}
                  <a href="mailto:support@akilhane.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@akilhane.com
                  </a>{' '}
                  adresinden bize ulaşın.
                </p>
              </section>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border">
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ana Sayfaya Dön
              </Link>
              <Link 
                href="/privacy-policy" 
                className="inline-flex items-center justify-center px-6 py-3 border border-border hover:bg-muted text-foreground font-medium rounded-lg transition-all duration-300 hover:scale-105"
              >
                Gizlilik Politikası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}