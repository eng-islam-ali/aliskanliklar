// Bu dosyada verileri kaydedip okuyoruz.
// localStorage sayesinde bilgiler tarayıcıda saklanır, sunucuya gerek yok (çok ii oldu bu).

const Store = {

  // localStorage'dan veri al (hata olursa boş değer döndür, try catch işte)
  _get(key, defaultValue) {
    try {
      const raw = localStorage.getItem('hab__' + key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  // localStorage'a veri kaydet
  _set(key, value) {
    localStorage.setItem('hab__' + key, JSON.stringify(value));
  },

  // Kullanıcı ayarları (avatar falan)
  getSettings()     { return this._get('settings', { avatar: '' }); },
  saveSettings(s)   { this._set('settings', s); },

  // Alışkanlıklar (hedefler) listesi (burası önemli)
  getHabits()       { return this._get('habits', []); },
  saveHabits(h)     { this._set('habits', h); },

  // Hangi gün ne yapıldı onun bilgisi (çok karışık oldu burası biraz)
  _trackingKey(year, month) {
    return 'track_' + year + '_' + month;
  },

  getTracking(year, month) {
    return this._get(this._trackingKey(year, month), {});
  },

  saveTracking(year, month, data) {
    this._set(this._trackingKey(year, month), data);
  },

  // Kayıtlı tüm takip anahtarlarını bul (temizlik vs. için)
  getAllTrackingKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('hab__track_')) {
        keys.push(k.replace('hab__track_', ''));
      }
    }
    return keys;
  },

  // Arşivlenmiş ayların listesi
  getArchives()           { return this._get('archives', []); },
  saveArchives(a)         { this._set('archives', a); },

  // Belirli bir ayın arşiv verisi
  getArchiveData(key)     { return this._get('arch_' + key, null); },
  saveArchiveData(key, d) { this._set('arch_' + key, d); },
};
