// PDF oluşturma işlemleri. Bu dosyada sadece PDF içeriği hazırlanıyor, indirme işlemi export.js de.

// PDF'de kullanılan renkler (RGB, googledan baktım)
const COLOR_PRIMARY = [74, 108, 247];
const COLOR_SUCCESS = [39, 174, 96];
const COLOR_WARNING = [243, 156, 18];
const COLOR_GRAY    = [149, 165, 166];
const COLOR_DARK    = [30, 41, 59];
const COLOR_LIGHT   = [240, 242, 245];

// jsPDF kütüphanesini ihtiyaç olunca yükle (lazy loading yani)
function loadJSPDF(callback) {
  if (typeof jspdf !== 'undefined' && jspdf.jsPDF) {
    callback(jspdf.jsPDF);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

  script.onload = function () {
    if (typeof jspdf !== 'undefined' && jspdf.jsPDF) {
      callback(jspdf.jsPDF);
    } else {
      setTimeout(() => callback(null), 2000);
    }
  };

  script.onerror = function () {
    alert('PDF kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.');
  };

  document.head.appendChild(script);
}

// Başarı yüzdesine göre renk seç
function pickBarColor(pct) {
  if (pct >= 70) return COLOR_SUCCESS;
  if (pct >= 30) return COLOR_WARNING;
  return COLOR_GRAY;
}

// Tek bir ay için PDF belgesi oluştur
function buildPDF(doc, year, month, habits, tracking, title) {
  let y = 20;

  doc.setFontSize(20);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('Aliskanlik Takip Ozeti', 105, y, { align: 'center' });

  y += 9;
  doc.setFontSize(13);
  doc.setTextColor(...COLOR_DARK);
  doc.text(title, 105, y, { align: 'center' });

  y += 6;
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  const days = daysInMonth(year, month);
  let totalPlanned = 0;
  let totalDone    = 0;

  habits.forEach(habit => {
    for (let d = 1; d <= days; d++) {
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      if (habit.days && habit.days.includes(dayOfWeek)) {
        totalPlanned++;
        if (tracking[habit.id + '_' + d]) totalDone++;
      }
    }
  });

  const overallRate = totalPlanned > 0 ? Math.round((totalDone / totalPlanned) * 100) : 0;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('GENEL ISTATISTIKLER', 20, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Toplam Hedef Sayisi: ' + habits.length, 25, y);   y += 6;
  doc.text('Toplam Planli Gun: '   + totalPlanned,  25, y);   y += 6;
  doc.text('Tamamlanan: '          + totalDone,      25, y);   y += 6;
  doc.text('Genel Basari Orani: %' + overallRate,   25, y);   y += 10;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('HEDEF BAZINDA ILERLEME', 20, y);
  y += 8;

  habits.forEach(habit => {
    let planned = 0;
    let done    = 0;

    for (let d = 1; d <= days; d++) {
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      if (habit.days && habit.days.includes(dayOfWeek)) {
        planned++;
        if (tracking[habit.id + '_' + d]) done++;
      }
    }

    const pct      = planned > 0 ? Math.round((done / planned) * 100) : 0;
    const barColor = pickBarColor(pct);

    if (y > 265) { doc.addPage(); y = 20; }

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...COLOR_DARK);
    doc.text(habit.name, 20, y);
    y += 4;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${habit.category} - ${planned} gunde ${done} tamamlandi`, 20, y);
    y += 5;

    const barWidth = (pct / 100) * 120;
    doc.setFillColor(...COLOR_LIGHT);
    doc.roundedRect(20, y, 120, 6, 2, 2, 'F');
    doc.setFillColor(...barColor);
    if (barWidth > 1) doc.roundedRect(20, y, barWidth, 6, 2, 2, 'F');

    doc.setTextColor(...COLOR_DARK);
    doc.setFontSize(9);
    doc.text('%' + pct, 145, y + 4);
    y += 12;
  });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Olusturulma: ' + new Date().toLocaleDateString('tr-TR'), 105, 282, { align: 'center' });
}

// Birden fazla ayı tek PDF'te birleştir
function buildRangePDF(doc, startYear, startMonth, endYear, endMonth) {
  let yPos = 20;

  doc.setFontSize(20);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('Aliskanlik Takip Ozeti', 105, yPos, { align: 'center' });
  yPos += 9;

  doc.setFontSize(13);
  doc.setTextColor(...COLOR_DARK);
  doc.text(
    `${MONTHS_TR[startMonth]} ${startYear} - ${MONTHS_TR[endMonth]} ${endYear}`,
    105, yPos, { align: 'center' }
  );
  yPos += 6;

  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  const months = [];
  let y = startYear, m = startMonth;

  while (y < endYear || (y === endYear && m <= endMonth)) {
    months.push({ year: y, month: m, data: getMonthData(y, m) });
    m++;
    if (m > 12) { m = 1; y++; }
  }

  const allHabits = {};
  months.forEach(mo => {
    if (!mo.data) return;
    mo.data.habits.forEach(habit => {
      if (!allHabits[habit.id]) {
        allHabits[habit.id] = {
          name: habit.name,
          category: habit.category,
          days: habit.days,
          planned: 0,
          done: 0,
        };
      }
    });
  });

  let grandPlanned = 0, grandDone = 0;
  let hasData = false;

  months.forEach(mo => {
    if (!mo.data) return;
    hasData = true;
    const days = daysInMonth(mo.year, mo.month);

    mo.data.habits.forEach(habit => {
      for (let d = 1; d <= days; d++) {
        const dow = new Date(mo.year, mo.month - 1, d).getDay();
        if (habit.days && habit.days.includes(dow)) {
          grandPlanned++;
          if (mo.data.tracking[habit.id + '_' + d]) grandDone++;
          if (allHabits[habit.id]) {
            allHabits[habit.id].planned++;
            if (mo.data.tracking[habit.id + '_' + d]) allHabits[habit.id].done++;
          }
        }
      }
    });
  });

  const monthsWithData = months.filter(mo => mo.data).length;
  const overallPct     = grandPlanned > 0 ? Math.round((grandDone / grandPlanned) * 100) : 0;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('GENEL ISTATISTIKLER', 20, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Kapsanan Ay: '       + monthsWithData + ' / ' + months.length, 25, yPos); yPos += 6;
  doc.text('Toplam Hedef: '      + Object.keys(allHabits).length,           25, yPos); yPos += 6;
  doc.text('Toplam Planli Gun: ' + grandPlanned,                             25, yPos); yPos += 6;
  doc.text('Tamamlanan: '        + grandDone,                                25, yPos); yPos += 6;
  doc.text('Genel Basari: %'     + overallPct,                               25, yPos); yPos += 10;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('AY BAZINDA DAGILIM', 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Ay',      20,  yPos);
  doc.text('Hedef',   55,  yPos);
  doc.text('Planli',  85,  yPos);
  doc.text('Yapilan', 110, yPos);
  doc.text('Basari',  140, yPos);
  yPos += 1;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 170, yPos);
  yPos += 4;

  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLOR_DARK);

  months.forEach(mo => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }

    if (!mo.data) {
      doc.setFontSize(9);
      doc.text(`${MONTHS_TR[mo.month]} ${mo.year}`, 20, yPos);
      doc.text('(veri yok)', 55, yPos);
      yPos += 5;
      return;
    }

    let p = 0, d = 0;
    const days = daysInMonth(mo.year, mo.month);

    mo.data.habits.forEach(habit => {
      for (let i = 1; i <= days; i++) {
        const dow = new Date(mo.year, mo.month - 1, i).getDay();
        if (habit.days && habit.days.includes(dow)) {
          p++;
          if (mo.data.tracking[habit.id + '_' + i]) d++;
        }
      }
    });

    const pct      = p > 0 ? Math.round((d / p) * 100) : 0;
    const barColor = pickBarColor(pct);

    doc.setFontSize(9);
    doc.setTextColor(...COLOR_DARK);
    doc.text(`${MONTHS_TR[mo.month]} ${mo.year}`, 20, yPos);
    doc.text(String(mo.data.habits.length), 55,  yPos);
    doc.text(String(p),                     85,  yPos);
    doc.text(String(d),                     110, yPos);

    doc.setTextColor(...barColor);
    doc.setFont(undefined, 'bold');
    doc.text('%' + pct, 140, yPos);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLOR_DARK);
    yPos += 5;
  });

  yPos += 5;

  if (yPos > 250) { doc.addPage(); yPos = 20; }

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('HEDEF BAZINDA TOPLAM ILERLEME', 20, yPos);
  yPos += 8;

  for (const habitId in allHabits) {
    const habit    = allHabits[habitId];
    const pct      = habit.planned > 0 ? Math.round((habit.done / habit.planned) * 100) : 0;
    const barColor = pickBarColor(pct);

    if (yPos > 265) { doc.addPage(); yPos = 20; }

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...COLOR_DARK);
    doc.text(habit.name, 20, yPos);
    yPos += 4;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${habit.category} - ${habit.planned} gunde ${habit.done} tamamlandi`, 20, yPos);
    yPos += 5;

    const barWidth = (pct / 100) * 120;
    doc.setFillColor(...COLOR_LIGHT);
    doc.roundedRect(20, yPos, 120, 6, 2, 2, 'F');
    doc.setFillColor(...barColor);
    if (barWidth > 1) doc.roundedRect(20, yPos, barWidth, 6, 2, 2, 'F');

    doc.setTextColor(...COLOR_DARK);
    doc.setFontSize(9);
    doc.text('%' + pct, 145, yPos + 4);
    yPos += 12;
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Olusturulma: ' + new Date().toLocaleDateString('tr-TR'), 105, 282, { align: 'center' });

  if (!hasData) {
    doc.setFontSize(14);
    doc.setTextColor(...COLOR_WARNING);
    doc.text('Secili aralikta veri bulunamadi.', 105, 120, { align: 'center' });
  }
}
