// Arşiv işlemleri: ayı arşivleme, listeleme, görüntüleme, silme, PDF (çok işlevli)

// İçinde bulunduğumuz ayı arşive ekle (don duruyoruz)
function archiveMonth() {
  const year  = currentYear;
  const month = currentMonth;
  const key   = monthKey(year, month);
  const name  = MONTHS_TR[month] + ' ' + year;

  const habits   = Store.getHabits();
  const tracking = Store.getTracking(year, month);

  if (!habits.length) {
    alert('Arşivlenecek hedef bulunmuyor.');
    return;
  }

  if (!confirm(`'${name}' ayını arşivlemek istediğinize emin misiniz?`)) return;

  // Veriyi kopyalayıp kaydet (ilerde değişmesin diye)
  const snapshot = {
    habits:   JSON.parse(JSON.stringify(habits)),
    tracking: JSON.parse(JSON.stringify(tracking)),
  };
  Store.saveArchiveData(key, snapshot);

  // Aynı ayı tekrar eklememek için kontrol et
  const archives = Store.getArchives();
  if (!archives.find(a => a.key === key)) {
    archives.push({ key, name, date: new Date().toISOString() });
    Store.saveArchives(archives);
  }

  renderArchiveList();
  alert(`${name} arşivlendi.`);
}

// Arşivlenmiş ayları listele (en yenisi üstte)
function renderArchiveList() {
  const archives  = Store.getArchives();
  const container = document.getElementById('archiveList');
  const viewer    = document.getElementById('archiveViewer');

  viewer.classList.add('hidden');

  if (!archives.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Henüz arşivlenmiş ay bulunmuyor.
           Dashboard'dan "Bu Ayı Arşivle" butonunu kullanabilirsiniz.</p>
      </div>`;
    return;
  }

  // En yeni ay en üstte görünsün
  archives.sort((a, b) => b.key.localeCompare(a.key));

  let html = '<h2>Arşivlenmiş Aylar</h2>';
  archives.forEach(archive => {
    html += `
      <div class="archive-month-item">
        <span class="archive-month-name">${escHtml(archive.name)}</span>
        <div class="archive-actions">
          <button class="btn btn-sm btn-primary" onclick="viewArchive('${archive.key}')">Görüntüle</button>
          <button class="btn btn-sm btn-archive" onclick="downloadArchivePDF('${archive.key}')">PDF</button>
          <button class="btn btn-sm btn-danger"  onclick="deleteArchive('${archive.key}')">Sil</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  populateRangeSelectors();
}

// Arşivlenmiş bir ayı salt okunur olarak göster
function viewArchive(key) {
  const data = Store.getArchiveData(key);
  if (!data) { alert('Arşiv verisi bulunamadı.'); return; }

  const [yearStr, monthStr] = key.split('-');
  const year  = parseInt(yearStr);
  const month = parseInt(monthStr);
  const days  = daysInMonth(year, month);

  const habits   = data.habits   || [];
  const tracking = data.tracking || {};

  const container = document.getElementById('archiveViewer');
  container.classList.remove('hidden');

  let html = `
    <button class="btn btn-sm btn-outline archive-back" onclick="closeArchiveView()">Geri Dön</button>
    <h2>${MONTHS_TR[month]} ${year} — Arşiv Görüntüleme</h2>
    <p style="color:var(--text-secondary); margin-bottom:12px; font-size:13px;">Bu görüntü salt okunurdur.</p>`;

  if (!habits.length) {
    html += '<p>Bu aya ait hedef bulunmuyor.</p>';
    container.innerHTML = html;
    return;
  }

  // Tablo başlığı
  html += `<div class="calendar-wrapper"><table>
    <thead><tr>
      <th style="min-width:140px; text-align:left; padding:8px 10px;">Hedef</th>`;
  for (let d = 1; d <= days; d++) {
    html += `<th style="min-width:24px; font-size:11px; padding:4px 2px;">${d}</th>`;
  }
  html += `</tr></thead><tbody>`;

  // Her hedef için bir satır
  habits.forEach(habit => {
    html += `<tr>
      <td style="text-align:left; padding:6px 10px; font-weight:600; font-size:13px;">
        ${escHtml(habit.name)}
      </td>`;

    for (let d = 1; d <= days; d++) {
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      const isPlanned = habit.days && habit.days.includes(dayOfWeek);
      const isDone    = tracking[habit.id + '_' + d];

      let cellClass = '';
      if (isPlanned && isDone)  cellClass = 'archived-done';
      else if (isPlanned)       cellClass = 'archived-missed';
      else if (isDone)          cellClass = 'archived-done';

      let symbol = '-';
      if (isDone)       symbol = '&#10003;';
      else if (isPlanned) symbol = '&#10007;';

      html += `<td class="${cellClass}" style="font-size:12px; padding:4px 2px;">${symbol}</td>`;
    }
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  document.getElementById('archiveList').scrollIntoView({ behavior: 'smooth' });
}

// Arşiv görüntüleyiciyi kapat
function closeArchiveView() {
  document.getElementById('archiveViewer').classList.add('hidden');
}

// Arşivi sil
function deleteArchive(key) {
  if (!confirm('Bu arşivi silmek istediğinize emin misiniz?')) return;

  const archives = Store.getArchives().filter(a => a.key !== key);
  Store.saveArchives(archives);
  localStorage.removeItem('hab__arch_' + key);

  renderArchiveList();
  closeArchiveView();
}

// "Zaman Aralığı PDF" seçicilerini doldur
function populateRangeSelectors() {
  const archives = Store.getArchives();

  let minYear = currentYear;
  let maxYear = currentYear;
  let earliestKey = currentYear + '-' + String(currentMonth).padStart(2, '0');

  archives.forEach(archive => {
    if (archive.key < earliestKey) earliestKey = archive.key;
    const y = parseInt(archive.key.split('-')[0]);
    if (y < minYear) minYear = y;
    if (y > maxYear) maxYear = y;
  });

  const [startYStr, startMStr] = earliestKey.split('-');
  const defaultStartMonth = parseInt(startMStr);
  const defaultStartYear  = parseInt(startYStr);
  const defaultEndMonth   = currentMonth;
  const defaultEndYear    = currentYear;

  const startMonthSel = document.getElementById('rangeStartMonth');
  const startYearSel  = document.getElementById('rangeStartYear');
  const endMonthSel   = document.getElementById('rangeEndMonth');
  const endYearSel    = document.getElementById('rangeEndYear');

  function fillMonthSelect(select, defaultValue) {
    select.innerHTML = '';
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement('option');
      opt.value       = m;
      opt.textContent = MONTHS_TR[m];
      if (m === defaultValue) opt.selected = true;
      select.appendChild(opt);
    }
  }

  function fillYearSelect(select, defaultValue) {
    select.innerHTML = '';
    for (let y = minYear; y <= maxYear + 1; y++) {
      const opt = document.createElement('option');
      opt.value       = y;
      opt.textContent = y;
      if (y === defaultValue) opt.selected = true;
      select.appendChild(opt);
    }
  }

  fillMonthSelect(startMonthSel, defaultStartMonth);
  fillYearSelect (startYearSel,  defaultStartYear);
  fillMonthSelect(endMonthSel,   defaultEndMonth);
  fillYearSelect (endYearSel,    defaultEndYear);
}

// Belirli bir yıl/ay için veriyi getir (PDF için)
function getMonthData(year, month) {
  const key      = monthKey(year, month);
  const archives = Store.getArchives();
  const archived = archives.find(a => a.key === key);

  if (archived) {
    const data = Store.getArchiveData(key);
    if (data) return { habits: data.habits || [], tracking: data.tracking || {} };
  }

  if (year === currentYear && month === currentMonth) {
    return { habits: Store.getHabits(), tracking: Store.getTracking(year, month) };
  }

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    const data = Store.getArchiveData(key);
    if (data) return { habits: data.habits || [], tracking: data.tracking || {} };
  }

  return null;
}
