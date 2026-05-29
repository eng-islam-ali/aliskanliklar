// Ana sayfa (Dashboard) işlemleri: takvim, grafik, checkbox işaretleme (baya kod yazdım burda)

// Ay ve yıl seçicilerini doldur (bunu stackoverflowdan buldum)
function populateDateSelectors() {
  const monthSel = document.getElementById('monthSelect');
  const yearSel  = document.getElementById('yearSelect');

  // Ay seçenekleri: 1'den 12'ye kadar
  monthSel.innerHTML = '';
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement('option');
    opt.value       = m;
    opt.textContent = MONTHS_TR[m];
    if (m === currentMonth) opt.selected = true;
    monthSel.appendChild(opt);
  }

  // Yıl seçenekleri: içinde bulunduğumuz yılın 3 yıl öncesi ve 3 yıl sonrası (yeterli heralde)
  yearSel.innerHTML = '';
  for (let y = currentYear - 3; y <= currentYear + 3; y++) {
    const opt = document.createElement('option');
    opt.value       = y;
    opt.textContent = y;
    if (y === currentYear) opt.selected = true;
    yearSel.appendChild(opt);
  }

  monthSel.onchange = () => { currentMonth = parseInt(monthSel.value); renderDashboard(); };
  yearSel.onchange  = () => { currentYear  = parseInt(yearSel.value);  renderDashboard(); };
}

// Grafik ve takvimi baştan çiz (render işte)
function renderDashboard() {
  const { year, month } = { year: currentYear, month: currentMonth };
  const days   = daysInMonth(year, month);
  const habits = Store.getHabits();

  renderDailyChart(year, month, days, habits);
  renderCalendar(year, month, days, habits);
}

// Aylık takvim tablosunu oluştur
function renderCalendar(year, month, days, habits) {
  const container = document.getElementById('calendarContainer');
  const tracking  = Store.getTracking(year, month);

  // Hiç hedef yoksa boş mesaj göster (kafana göre hedef ekle)
  if (!habits.length) {
    container.innerHTML = `
      <div class="card empty-state">
        <p>Henüz hedef tanımlanmamış. Lütfen "Hedefler" bölümünden hedef ekleyin.</p>
      </div>`;
    return;
  }

  // Tablo başlığı: Hedef adı ve gün numaraları
  let html = `<div class="calendar-wrapper">
    <table id="calendarTable">
      <thead>
        <tr>
          <th style="min-width:160px; text-align:left; padding:8px 10px;">Hedef</th>`;

  for (let d = 1; d <= days; d++) {
    html += `<th class="day-header">${d}</th>`;
  }
  html += `<th style="min-width:140px; padding:8px 10px;">İlerleme</th>
        </tr>
      </thead>
      <tbody>`;

  // Her hedef için bir satır
  habits.forEach(habit => {
    html += `<tr>
      <td class="habit-header">
        <div class="habit-category">${escHtml(habit.category)}</div>
        ${escHtml(habit.name)}
        <div class="habit-desc">${escHtml(habit.description || '')}</div>
      </td>`;

    for (let d = 1; d <= days; d++) {
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      const isPlanned = habit.days && habit.days.includes(dayOfWeek);
      const cellClass = isPlanned ? 'cal-cell planned checkable' : 'cal-cell checkable';
      const checked   = tracking[habit.id + '_' + d] ? 'checked' : '';

      html += `<td class="${cellClass}">
        <input
          type="checkbox"
          class="cal-checkbox"
          data-habit="${habit.id}"
          data-day="${d}"
          ${checked}
          onchange="onCheckboxChange(this, ${year}, ${month})"
        >
      </td>`;
    }

    html += `<td class="progress-cell">${renderProgressBar(year, month, habit, tracking, days)}</td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

// Bir hedefin o ayki ilerleme yüzdesini gösteren çubuk
function renderProgressBar(year, month, habit, tracking, days) {
  let planned = 0;
  let done    = 0;

  for (let d = 1; d <= days; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    if (habit.days && habit.days.includes(dayOfWeek)) {
      planned++;
      if (tracking[habit.id + '_' + d]) done++;
    }
  }

  const pct = planned > 0 ? Math.round((done / planned) * 100) : 0;
  const colorClass = pct >= 70 ? 'high' : pct >= 30 ? 'mid' : 'low';

  return `<div class="progress-bar-container">
    <div class="progress-bar-fill ${colorClass}" style="width:${pct}%"></div>
    <div class="progress-text">${pct}% (${done}/${planned})</div>
  </div>`;
}

// Checkbox işaretlenince/işaret kalkınca veriyi kaydet
function onCheckboxChange(checkbox, year, month) {
  const habitId = parseInt(checkbox.dataset.habit);
  const day     = parseInt(checkbox.dataset.day);
  const trackingKey = habitId + '_' + day;

  const tracking = Store.getTracking(year, month);

  if (checkbox.checked) {
    tracking[trackingKey] = true;
  } else {
    delete tracking[trackingKey];
  }

  Store.saveTracking(year, month, tracking);
  renderDashboard();
}

// Tüm işaretlemeleri temizle
function clearAllMarks() {
  if (!confirm('Tüm işaretlemeleri kaldırmak istediğinize emin misiniz?')) return;
  Store.saveTracking(currentYear, currentMonth, {});
  renderDashboard();
}

// Günlük tamamlanma oranlarını sütun grafiği olarak çiz (Canvas ile)
function renderDailyChart(year, month, days, habits) {
  const canvas = document.getElementById('dailyChart');
  const ctx    = canvas.getContext('2d');

  // Yüksek çözünürlüklü ekranlar (Retina) için DPI ayarı
  const dpr  = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;

  const tracking = Store.getTracking(year, month);
  ctx.clearRect(0, 0, W, H);

  // Grafiğin kenar boşlukları
  const pad = { top: 28, bottom: 24, left: 38, right: 16 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;

  // Veri yoksa bilgi mesajı göster
  if (!habits.length || !days) {
    ctx.fillStyle  = '#64748B';
    ctx.font       = '14px sans-serif';
    ctx.textAlign  = 'center';
    ctx.fillText('Henüz veri yok', W / 2, H / 2);
    return;
  }

  const barW = Math.min(Math.floor(chartW / days) - 2, 16);
  if (barW < 1) return;

  // Her gün için tamamlanma oranını hesapla
  const dailyRates = [];
  let maxRate = 0;

  for (let d = 1; d <= days; d++) {
    let totalForDay = 0;
    let doneForDay  = 0;

    habits.forEach(habit => {
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      if (habit.days && habit.days.includes(dayOfWeek)) {
        totalForDay++;
        if (tracking[habit.id + '_' + d]) doneForDay++;
      }
    });

    const rate = totalForDay > 0 ? (doneForDay / totalForDay) * 100 : 0;
    dailyRates.push(rate);
    if (rate > maxRate) maxRate = rate;
  }

  const yMax = Math.max(100, Math.ceil(maxRate / 10) * 10);

  // Yatay çizgiler (%0, %25, %50, %75, %100)
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth   = 1;

  for (let pct = 0; pct <= 100; pct += 25) {
    const y = pad.top + chartH - (pct / yMax) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font      = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(pct + '%', pad.left - 6, y + 3);
  }

  // Sütunları çiz
  const daysToShow = Math.min(days, 31);
  const spacing    = chartW / daysToShow;
  const bw         = Math.min(spacing * 0.6, 12);

  for (let d = 0; d < daysToShow; d++) {
    const rate = dailyRates[d];
    const barH = (rate / yMax) * chartH;
    const x    = pad.left + d * spacing + (spacing - bw) / 2;
    const y    = pad.top + chartH - barH;

    // Başarıya göre renk seç: yeşil, turuncu, mavi
    const hue = rate >= 70 ? 140 : rate >= 30 ? 35 : 200;
    ctx.fillStyle = `hsla(${hue}, 70%, 55%, 0.8)`;
    ctx.fillRect(x, y, bw, barH);

    // Gün numarasını yaz (her 3 günde bir ve son gün)
    if (d % 3 === 0 || d === daysToShow - 1) {
      ctx.fillStyle = '#94A3B8';
      ctx.font      = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d + 1, x + bw / 2, pad.top + chartH + 14);
    }
  }

  // Grafik başlığı
  ctx.fillStyle = '#1E293B';
  ctx.font      = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Günlük Tamamlanma Oranı (%)', pad.left, 14);
}
