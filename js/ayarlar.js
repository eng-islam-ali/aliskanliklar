// Kullanıcı ayarları ve profil resmi işlemleri bu dosyada (basit aslında).

// Sayfa açılırken kayıtlı ayarları forma yükle
function loadSettings() {
  const settings = Store.getSettings();
  if (settings.avatar) {
    document.getElementById('settingsAvatar').src = settings.avatar;
    document.getElementById('avatarUrl').value    = settings.avatar;
  }
}

// URL ye yazı yazdıkça resmi önizle (oninput)
function previewAvatar() {
  const url = document.getElementById('avatarUrl').value.trim();
  if (url) {
    document.getElementById('settingsAvatar').src = url;
  }
}

// Bilgisayardan resim seçince çalışır
function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('settingsAvatar').src = e.target.result;
    document.getElementById('avatarUrl').value    = '';
  };
  reader.readAsDataURL(file);
}

// Profil resmini kaydet (localStorage)
function saveAvatar() {
  const urlInput   = document.getElementById('avatarUrl').value.trim();
  const previewSrc = document.getElementById('settingsAvatar').src;

  const settings = Store.getSettings();
  settings.avatar = urlInput || previewSrc || '';
  Store.saveSettings(settings);

  updateAvatar();
  alert('Profil resmi kaydedildi.');
}

// Sidebar'daki avatarı güncelle
function updateAvatar() {
  const settings    = Store.getSettings();
  const sidebarImg  = document.getElementById('sidebarAvatar');

  if (settings.avatar) {
    sidebarImg.src          = settings.avatar;
    sidebarImg.style.display = 'block';
  } else {
    sidebarImg.style.display = 'none';
  }
}
