import Link from 'next/link';
import MobileNav from '@/components/mobile-nav';

export default function PrivacyPolicyPage() {
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
              <li className="text-foreground font-medium">Gizlilik Politikası</li>
            </ol>
          </nav>

          {/* Content Card */}
          <div className="glass-card p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gizlilik Politikası
            </h1>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-lg mb-6 text-muted-foreground">
                Bu Gizlilik Politikası, AkılHane platformunu kullandığınızda kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar. AkılHane'yi kullanarak aşağıda açıklanan şartları kabul etmiş olursunuz.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  1. Veri Toplama
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kayıt sırasında adınız, e-posta adresiniz ve öğrenme tercihlerinizi toplarız. Ayrıca, deneyiminizi iyileştirmek için kullanım verileri, cihaz bilgileri ve çerezler de toplanabilir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  2. Verilerin Kullanımı
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Verileriniz, öğrenme deneyiminizi kişiselleştirmek, platform özelliklerini sunmak ve hizmetlerimizi geliştirmek için kullanılır. Kişisel bilgileriniz üçüncü şahıslara satılmaz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  3. Veri Güvenliği
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Verilerinizin yetkisiz erişim, değiştirilme veya ifşa edilmesine karşı korunması için endüstri standartlarında güvenlik önlemleri uygulanır. Ancak, internet üzerinden iletim hiçbir zaman %100 güvenli değildir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  4. Kullanıcı Hakları
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Kişisel verilerinize istediğiniz zaman erişme, güncelleme veya silme hakkına sahipsiniz. Talepleriniz veya sorularınız için lütfen{' '}
                  <a href="mailto:support@akilhane.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@akilhane.com
                  </a>{' '}
                  adresinden bize ulaşın.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  5. KVKK Uyumluluğu
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  AkılHane, Türkiye Cumhuriyeti Kişisel Verilerin Korunması Kanunu (KVKK) hükümlerine uygun olarak faaliyet göstermektedir. Kişisel verileriniz yasal dayanaklar çerçevesinde işlenmekte ve korunmaktadır.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  6. Çerezler (Cookies)
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Platformumuz, kullanıcı deneyimini iyileştirmek ve tercihlerinizi hatırlamak için çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz, ancak bu durumda bazı özellikler düzgün çalışmayabilir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                  7. Politika Değişiklikleri
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Bu Gizlilik Politikası zaman zaman güncellenebilir. Değişiklikler bu sayfada güncellenmiş tarih ile yayınlanacaktır. Önemli değişikliklerde kullanıcılarımız e-posta yoluyla bilgilendirilecektir.
                </p>
              </section>
            </div>

            {/* Last Updated */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Son Güncelleme: {new Date().toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ana Sayfaya Dön
              </Link>
              <Link 
                href="/terms-of-service" 
                className="inline-flex items-center justify-center px-6 py-3 border border-border hover:bg-muted text-foreground font-medium rounded-lg transition-all duration-300 hover:scale-105"
              >
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}