// Hedef ekleme, düzenleme ve silme işlemleri burada (çok uğraştım oldu).

// Form gönderilince hedef ekle veya güncelle (submit eventi)
function saveGoal(event) {
  event.preventDefault();

  const habits  = Store.getHabits();
  const editId  = document.getElementById('editGoalId').value;
  const category    = document.getElementById('goalCategory').value;
  const name        = document.getElementById('goalName').value.trim();
  const description = document.getElementById('goalDesc').value.trim();

  // Hangi günler seçilmiş onu topla (checkboxları tek tek dolanıyorum)
  const dayCheckboxes = document.querySelectorAll('#dayCheckboxes input[type="checkbox"]');
  const selectedDays  = [];
  dayCheckboxes.forEach(cb => {
    if (cb.checked) selectedDays.push(parseInt(cb.value));
  });

  const warningEl = document.getElementById('frequencyWarning');

  // En az bir gün seçilmeli
  if (!selectedDays.length) {
    warningEl.classList.remove('hidden');
    return;
  }
  warningEl.classList.add('hidden');

  if (!editId) {
    // Yeni hedef ekle (max 25 tane olabilir)
    if (habits.length >= 25) {
      alert('Maksimum 25 hedef ekleyebilirsiniz.');
      return;
    }
    habits.push({
      id: Date.now(),
      category,
      name,
      description,
      days: selectedDays,
    });
  } else {
    // Var olan hedefi güncelle
    const index = habits.findIndex(h => h.id == editId);
    if (index !== -1) {
      habits[index] = { ...habits[index], category, name, description, days: selectedDays };
    }
    resetGoalForm();
  }

  Store.saveHabits(habits);
  event.target.reset();
  document.querySelectorAll('#dayCheckboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
  renderGoalList();
  renderDashboard();
}

// "Düzenle" butonuna basınca formu hedef bilgileriyle doldur
function editGoal(id) {
  const habits = Store.getHabits();
  const habit  = habits.find(h => h.id === id);
  if (!habit) return;

  document.getElementById('editGoalId').value  = habit.id;
  document.getElementById('goalCategory').value = habit.category;
  document.getElementById('goalName').value     = habit.name;
  document.getElementById('goalDesc').value     = habit.description || '';

  const checkboxes = document.querySelectorAll('#dayCheckboxes input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = habit.days && habit.days.includes(parseInt(cb.value));
  });

  document.getElementById('goalSubmitBtn').textContent = 'Güncelle';
  document.getElementById('cancelEditBtn').classList.remove('hidden');
  document.getElementById('frequencyWarning').classList.add('hidden');
  document.getElementById('section-goals').scrollIntoView({ behavior: 'smooth' });
}

// "İptal" butonuna basınca düzenleme modundan çık
function cancelEdit() {
  resetGoalForm();
  document.getElementById('goalForm').reset();
  document.querySelectorAll('#dayCheckboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('frequencyWarning').classList.add('hidden');
}

// Formu "ekleme" moduna geri döndür
function resetGoalForm() {
  document.getElementById('editGoalId').value = '';
  document.getElementById('goalSubmitBtn').textContent = 'Hedef Ekle';
  document.getElementById('cancelEditBtn').classList.add('hidden');
}

// Hedef sil (onay aldıktan sonra)
function deleteGoal(id) {
  if (!confirm('Bu hedefi silmek istediğinize emin misiniz?')) return;

  const habits = Store.getHabits().filter(h => h.id !== id);
  Store.saveHabits(habits);
  renderGoalList();
  renderDashboard();
}

// Tüm hedefleri ekrana listele
function renderGoalList() {
  const habits    = Store.getHabits();
  const container = document.getElementById('goalList');

  document.getElementById('goalCount').textContent = habits.length;

  if (!habits.length) {
    container.innerHTML = '<div class="empty-state"><p>Henüz hedef eklenmemiş.</p></div>';
    return;
  }

  let html = '';
  habits.forEach(habit => {
    const dayNames = (habit.days || []).map(d => DAYS_TR[d]).join(', ');

    html += `
      <div class="goal-item">
        <div class="goal-info">
          <strong>${escHtml(habit.name)}</strong>
          <div class="goal-meta">
            ${escHtml(habit.category)}
            ${habit.description ? ' &middot; ' + escHtml(habit.description) : ''}
            &middot; ${dayNames}
          </div>
        </div>
        <div class="goal-actions">
          <button class="btn btn-sm btn-outline" onclick="editGoal(${habit.id})">Düzenle</button>
          <button class="btn btn-sm btn-danger"  onclick="deleteGoal(${habit.id})">Sil</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}
