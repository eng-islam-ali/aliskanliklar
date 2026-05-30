🚀 Alışkanlık Takip Sistemi (Offline-First Habit Tracker)
Modern dünyada alışkanlıklarımızı takip etmek için kullandığımız mobil veya web uygulamaları genellikle verilerimizi uzak sunucularda saklar, üyelik gerektirir ve internet bağlantısı olmadan çalışmaz
. Bu proje; verilerin gizliliğini %100 oranında kullanıcının kendi tarayıcısında (localStorage üzerinde) tutan, sıfır sunucu bağımlılığıyla çalışan, hızlı, modern ve performanslı bir tek sayfalık web uygulamasıdır (SPA)
.
Proje, bilgisayar mühendisliği web tasarım skorlama kriterlerine (Usability, UX, UI, Performance, Responsiveness/Accessibility, Content/SEO) %100 uyumlu olarak tamamen yerel (local-first) çalışacak şekilde geliştirilmiştir
.

--------------------------------------------------------------------------------
🛠️ Kullanılan Teknolojiler
Core (Yapı): HTML5 (Semantik etiketler ve erişilebilir form ögeleri)
.
Styling (CSS): Vanilla CSS3 (Custom CSS Properties/Variables, CSS Grid, Flexbox, Media Queries)
.
Logic (Mantık): ES6+ Vanilla JavaScript (Fonksiyonel modüler mimari)
.
Grafik: HTML5 Canvas API (Yüksek DPI / Retina ekran desteğiyle sıfırdan çizim)
.
Dış Kütüphane: jsPDF (Sadece ihtiyaç anında dinamik yüklenen/lazy-loaded raporlama kütüphanesi)
.
Veri Saklama: Web Storage API (localStorage tabanlı yerel veri motoru)
.

--------------------------------------------------------------------------------
🏆 Temel Özellikler ve Web Tasarım Kriterleri
Projenin teknik tasarımı 6 temel kritere göre şu şekilde optimize edilmiştir
:
1. Kullanılabilirlik (Usability)
Tek Sayfa Yapısı (SPA): Menü geçişleri showSection fonksiyonu ile DOM manipülasyonu yapılarak sayfa yenilenmeden saniyeler içinde gerçekleşir
.
Hata Yönetimi: Kullanıcı hedefe gün seçmeden ekleme yapmaya çalışırsa frequencyWarning uyarısı tetiklenir ve formun gönderilmesi engellenir
.
CRUD Operasyonları: hedefler.js dosyası içinde hedeflerin eklenmesi, düzenlenmesi ve silinmesi son derece akıcıdır
. Maksimum 25 hedef limitiyle arayüzün şişmesi önlenir
.
2. Kullanıcı Deneyimi (UX)
Dinamik Geri Bildirim: Takvimdeki günler işaretlendiğinde ilerleme çubuğu anında güncellenir
.
Renk Kodlu İlerleme: Başarı yüzdesine göre ilerleme çubukları otomatik olarak renk değiştirir (%0-29 arası gri, %30-69 arası turuncu, %70-100 arası yeşil)
.
Offline Önizleme: Kullanıcı profil resmi yüklediğinde FileReader API kullanılarak resmi sunucuya göndermeden anında önizleme alabilir
.
3. Görsel Tasarım (UI Design)
CSS Değişkenleri (Theme Tokens): Renk paleti, yuvarlatılmış köşeler ve gölgeler CSS değişkenleriyle tanımlanmıştır
.
Mikro-Etkileşimler: Butonların hover durumları ve kartların hafif gölgeleri premium bir hava katar
.
Özel Kaydırma Çubuğu: Webkit tarayıcıları için tasarlanmış modern, ince ve estetik scrollbar tasarımı mevcuttur
.
4. Performans (Performance)
Lazy Loading (Dinamik Yükleme): Raporlama kütüphanesi olan jsPDF, sayfa ilk açıldığında yüklenmez
. "PDF İndir" butonuna basıldığında dinamik olarak CDN üzerinden çekilir, bu sayede ilk sayfa açılış hızı (FCP) maksimum düzeyde tutulur
.
Retina Ekran Grafik Desteği: HTML5 Canvas grafiklerinin bulanık görünmesini engellemek için çözünürlük window.devicePixelRatio oranına göre ölçeklendirilir
.
5. Responsive & Erişilebilirlik
Esnek Yerleşim: CSS Grid ve Flexbox kullanılarak ekran genişliğine göre elementler yerleşim değiştirir
.
Mobil Sidebar Çekmecesi: Mobil ekranlarda sol menü gizlenir ve karartmalı (overlay) bir hamburger menüye dönüşür
.
Yatay Kaydırmalı Takvim: Mobil ekranlarda kırılan büyük takvim tabloları, yatay kaydırma desteği sayesinde taşma yapmadan okunabilir kalır
.
Erişilebilir Etiketler: Etkileşimli butonlarda ve form elemanlarında semantik <label> ve title yapıları kullanılmıştır
.
6. İçerik & SEO
Semantik HTML5: Sayfa yapısı <aside>, <main>, <section>, <nav> gibi semantik etiketlerle kurgulanmıştır
.
Güvenli İçerik Filtreleme (XSS Önleme): Kullanıcıdan alınan veriler ekrana basılmadan önce escHtml fonksiyonundan geçirilerek olası XSS açıklarının önüne geçilir
.

--------------------------------------------------------------------------------
🚀 Kurulum ve Çalıştırma
Projeyi kendi bilgisayarınızda çalıştırmak oldukça basittir
. Herhangi bir sunucu kurulumu veya npm install komutu gerektirmez
.
Repoyu bilgisayarınıza indirin veya klonlayın: https://github.com/eng-islam-ali/aliskanliklar.git
.
İndirdiğiniz klasör içindeki index.html dosyasına çift tıklayarak favori tarayıcınızda açın
.
Hemen kullanmaya başlayın!
