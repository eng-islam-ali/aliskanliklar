// Uygulamanın anad dosyası. Sayfa açıldığında ilk burası çalışır.

// Şuan hangi yıl ve ayı görüntülüyoruz?
let currentYear;
let currentMonth;

// Sidebardaki butonlara tıklayınca bölümler arası geçiş yap (güzel çalışıyo)
function showSection(sectionName) {
  // Önce tüm bölümleri gizle
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  // Tüm butonların aktifliğini kaldır
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Tıklanan bölümü göster
  document.getElementById('section-' + sectionName).classList.add('active');

  // Tıklanan butonu vurgula
  document.querySelector(`.nav-btn[data-section="${sectionName}"]`)?.classList.add('active');

  // Bölüme göre içeriği yenile
  if (sectionName === 'dashboard') renderDashboard();
  if (sectionName === 'goals')     renderGoalList();
  if (sectionName === 'archive')   renderArchiveList();
}

// Sidebar ı aç/kapat (mobilde)
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}

// Sidebar ı kapat (mesela bir bölüme tıklayınca)
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

// Uygulama ilk yüklendiğinde çalışan ana fonksiyon
function init() {
  const now    = new Date();
  currentYear  = now.getFullYear();
  currentMonth = now.getMonth() + 1;

  populateDateSelectors();
  renderDashboard();
  renderGoalList();
  renderArchiveList();
  loadSettings();
  updateAvatar();
  populateRangeSelectors();
}

// Sayfa yüklenince uygulamayı başlat
window.onload = init;
