// PDF indirme işlemleri burada. PDF oluşturma kodları pdf.js de.

// Aktif ayın PDF'ini indir
function downloadPDF() {
  const habits = Store.getHabits();
  if (!habits.length) {
    alert('PDF olusturmak icin en az bir hedef tanimlayin.');
    return;
  }

  const year     = currentYear;
  const month    = currentMonth;
  const tracking = Store.getTracking(year, month);
  const title    = MONTHS_TR[month] + ' ' + year;

  loadJSPDF(function (jsPDF) {
    if (!jsPDF) { alert('PDF kütüphanesi yüklenemedi.'); return; }
    const doc = new jsPDF('p', 'mm', 'a4');
    buildPDF(doc, year, month, habits, tracking, title);
    doc.save(`aliskanlik_ozeti_${month}_${year}.pdf`);
  });
}

// Arşivlenmiş bir ayın PDF'ini indir
function downloadArchivePDF(key) {
  const data = Store.getArchiveData(key);
  if (!data) { alert('Arsiv verisi bulunamadi.'); return; }

  const [yearStr, monthStr] = key.split('-');
  const year  = parseInt(yearStr);
  const month = parseInt(monthStr);

  const habits   = data.habits   || [];
  const tracking = data.tracking || {};
  const title    = MONTHS_TR[month] + ' ' + year + ' (Arsiv)';

  if (!habits.length) { alert('Arsivde hedef bulunmuyor.'); return; }

  loadJSPDF(function (jsPDF) {
    if (!jsPDF) { alert('PDF kütüphanesi yüklenemedi.'); return; }
    const doc = new jsPDF('p', 'mm', 'a4');
    buildPDF(doc, year, month, habits, tracking, title);
    doc.save(`aliskanlik_arsiv_${month}_${year}.pdf`);
  });
}

// Seçilen tarih aralığındaki tüm ayları PDF yap
function downloadRangePDF() {
  const startMonth = parseInt(document.getElementById('rangeStartMonth').value);
  const startYear  = parseInt(document.getElementById('rangeStartYear').value);
  const endMonth   = parseInt(document.getElementById('rangeEndMonth').value);
  const endYear    = parseInt(document.getElementById('rangeEndYear').value);

  if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
    alert('Bitis tarihi baslangictan once olamaz.');
    return;
  }

  loadJSPDF(function (jsPDF) {
    if (!jsPDF) { alert('PDF kütüphanesi yüklenemedi.'); return; }
    const doc = new jsPDF('p', 'mm', 'a4');
    buildRangePDF(doc, startYear, startMonth, endYear, endMonth);
    doc.save(`aliskanlik_ozeti_${startYear}-${startMonth}_${endYear}-${endMonth}.pdf`);
  });
}
