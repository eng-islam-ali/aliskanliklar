// Bu dosyada sık kullanılan yardımcı fonksiyonlar var (heryerde lazım oluyo).
// Tarih hesaplamaları, Türkçe ay/gün isimleri ve güvenlik işlemleri burada.

// Türkçe ay isimleri (1=Ocak, 2=Şubat ... diye gider)
const MONTHS_TR = [
  '',
  'Ocak', 'Şubat', 'Mart',     'Nisan',  'Mayıs',   'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim',  'Kasım',   'Aralık'
];

// Türkçe gün isimleri (0=Pazar, 1=Pazartesi ... JavaScript'in getDay() mantığı)
const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

// Kısa gün adları (ilerde kullanılabilir)
const DAYS_TR_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// Bir ayın kaç gün olduğunu hesapla (genelde 30 ama değişiyo)
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// "2025-05" gibi bir anahtar üret (arşiv ve kayıt işlemlerinde kulanılır)
function monthKey(year, month) {
  return year + '-' + String(month).padStart(2, '0');
}

// Bugünün tarihini "YYYY-AA-GG" formatında ver
function todayStr() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// Kullanıcıdan gelen yazıyı HTML içinde güvenle kullanmak için
// zararlı karakterleri temizler (XSS saldırılarını önler, internette görmüştüm)
function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
