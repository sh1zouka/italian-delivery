// ===== Page Loader =====
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 400);
  }
}

// ===== Notification Toast =====
function showNotif(msg, type = 'success') {
  let toast = document.getElementById('notif-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'notif-toast';
    toast.className = 'notif-toast';
    document.body.appendChild(toast);
  }
  toast.className = `notif-toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type]||'✓'}</span> ${msg}`;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Burger Menu =====
function initBurger() {
  const btn = document.getElementById('burger-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on backdrop click
  menu.addEventListener('click', (e) => {
    if (e.target === menu) {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Update mobile auth state
  const user = getCurrentUser();
  const authLinks = document.getElementById('mobile-auth-links');
  const userLinks = document.getElementById('mobile-user-links');
  const adminLink = document.getElementById('mobile-admin-link');
  if (authLinks) authLinks.style.display = user ? 'none' : '';
  if (userLinks) userLinks.style.display = user ? '' : 'none';
  if (adminLink) adminLink.style.display = (user && user.role === 'admin') ? '' : 'none';
}

// ===== Phone Mask =====
function applyPhoneMask(input) {
  if (!input) return;
  input.addEventListener('input', (e) => {
    let val = input.value.replace(/\D/g, '');
    if (val.startsWith('8')) val = '7' + val.slice(1);
    if (!val.startsWith('7') && val.length > 0) val = '7' + val;
    val = val.slice(0, 11);
    let formatted = '';
    if (val.length > 0) formatted = '+7';
    if (val.length > 1) formatted += ' (' + val.slice(1, 4);
    if (val.length >= 4) formatted += ') ' + val.slice(4, 7);
    if (val.length >= 7) formatted += '-' + val.slice(7, 9);
    if (val.length >= 9) formatted += '-' + val.slice(9, 11);
    input.value = formatted;
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && input.value.length <= 3) {
      input.value = '';
    }
  });
}
// ===== App Init =====
document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  hideLoader();
  initBurger();
  updateNavAuth();
  updateCartBadge();

  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  else if (page === 'menu') initMenuPage();
  else if (page === 'cart') initCartPage();
  else if (page === 'auth') initAuthPage();
  else if (page === 'profile') initProfilePage();
  else if (page === 'admin') initAdminPage();
});

// ===== MENU CARD HTML =====
function menuCardHTML(item) {
  const macros = item.macros || {};
  return `
    <div class="menu-card" data-id="${item.id}">
      <div class="menu-card-photo">
        <img src="${item.photo}" alt="${item.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'menu-card-photo-fallback\\'>${item.img||'🍽️'}</div>'">
        ${item.popular ? '<span class="badge-popular">Хит</span>' : ''}
      </div>
      <div class="menu-card-body">
        <h3 class="menu-card-name">${item.name}</h3>
        <p class="menu-card-desc">${item.desc}</p>
        <div class="macros-row">
          <div class="macro-item"><span class="macro-val">${macros.kcal||0}</span><span class="macro-label">ккал</span></div>
          <div class="macro-sep"></div>
          <div class="macro-item"><span class="macro-val">${macros.protein||0}г</span><span class="macro-label">белки</span></div>
          <div class="macro-sep"></div>
          <div class="macro-item"><span class="macro-val">${macros.fat||0}г</span><span class="macro-label">жиры</span></div>
          <div class="macro-sep"></div>
          <div class="macro-item"><span class="macro-val">${macros.carbs||0}г</span><span class="macro-label">углев.</span></div>
        </div>
        <div class="menu-card-footer">
          <div>
            <span class="menu-card-price">${item.price} ₽</span>
            <span class="menu-card-weight">${item.weight}</span>
          </div>
          <button class="btn-add-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-photo="${item.photo||''}" data-img="${item.img||'🍽️'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            В корзину
          </button>
        </div>
      </div>
    </div>`;
}

function attachAddToCartHandlers(container) {
  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        id: +btn.dataset.id,
        name: btn.dataset.name,
        price: +btn.dataset.price,
        photo: btn.dataset.photo,
        img: btn.dataset.img
      });
      btn.classList.add('added');
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Добавлено`;
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> В корзину`;
      }, 1500);
    });
  });
}

// ===== HOME PAGE =====
function initHome() { renderFeaturedMenu(); }

function skeletonCards(n) {
  return Array.from({length:n}, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-desc"></div>
        <div class="skeleton skeleton-desc-short"></div>
        <div class="skeleton-footer">
          <div class="skeleton skeleton-price"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
      </div>
    </div>`).join('');
}

async function renderFeaturedMenu() {
  const grid = document.getElementById('featured-grid');
  if (grid) grid.innerHTML = skeletonCards(6);
  const all = await dbGetAll('menu');
  const featured = all.filter(i => i.popular).slice(0, 6);
  if (!grid) return;
  grid.innerHTML = featured.map(menuCardHTML).join('');
  attachAddToCartHandlers(grid);
}

// ===== MENU PAGE =====
async function initMenuPage() {
  const _mc = document.getElementById('menu-container');
  if (_mc) _mc.innerHTML = '<div class="menu-grid">' + skeletonCards(8) + '</div>';
  const all = await dbGetAll('menu');
  renderMenuByCategory(all);

  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      const filtered = cat === 'all' ? all : all.filter(i => i.category === cat);
      renderMenuByCategory(filtered, cat !== 'all');
    });
  });

  const searchInput = document.getElementById('menu-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const filtered = all.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
      renderMenuByCategory(filtered, true);
    });
  }
}

function renderMenuByCategory(items, flat = false) {
  const container = document.getElementById('menu-container');
  if (!container) return;

  if (flat) {
    container.innerHTML = items.length
      ? `<div class="menu-grid">${items.map(menuCardHTML).join('')}</div>`
      : `<div class="empty-search"><p>Ничего не найдено</p></div>`;
  } else {
    const cats = { pizza: 'Пицца', pasta: 'Паста и ризотто', starters: 'Закуски и супы', desserts: 'Десерты', drinks: 'Напитки' };
    let html = '';
    for (const [key, label] of Object.entries(cats)) {
      const catItems = items.filter(i => i.category === key);
      if (!catItems.length) continue;
      html += `<div class="menu-section" id="cat-${key}">
        <h2 class="section-title">${label}</h2>
        <div class="menu-grid">${catItems.map(menuCardHTML).join('')}</div>
      </div>`;
    }
    container.innerHTML = html;
  }
  attachAddToCartHandlers(container);
}

// ===== VALIDATION HELPERS =====
/**
 * Имя и фамилия: минимум 2 слова, только кириллица/латиница, дефис, пробел
 * Примеры: "Иван Иванов", "Анна-Мария Петрова"
 */
function validateFullName(val) {
  const trimmed = val.trim();
  if (!trimmed) return 'Введите имя и фамилию';
  if (!/^[А-ЯЁа-яёA-Za-z][А-ЯЁа-яёA-Za-z\-]+([\s][А-ЯЁа-яёA-Za-z][А-ЯЁа-яёA-Za-z\-]+)+$/.test(trimmed))
    return 'Введите имя и фамилию (например: Иван Иванов)';
  return '';
}

/**
 * Телефон: российский формат +7 или 8, 10 цифр после кода
 * Принимает: +7 (999) 000-00-00, 89991234567, +79991234567
 */
function validatePhone(val) {
  const digits = val.replace(/\D/g, '');
  if (!digits) return 'Введите номер телефона';
  if (!/^(7|8)\d{10}$/.test(digits))
    return 'Введите корректный российский номер (+7 XXX XXX-XX-XX)';
  return '';
}

/**
 * Адрес Москвы: должен содержать улицу/проспект/бульвар/etc + номер дома
 * Ключевые слова: ул., улица, пр-т, проспект, бул., бульвар, пер., переулок,
 *                 ш., шоссе, наб., набережная, пл., площадь, туп., тупик, аллея
 */
function validateMoscowAddress(val) {
  const v = val.trim().toLowerCase();
  if (!v) return 'Введите адрес доставки';

  const streetKeywords = /(^|\s)(ул\.|улица|пр-т|просп\.|проспект|бул\.|бульвар|пер\.|переулок|ш\.|шоссе|наб\.|набережная|пл\.|площадь|туп\.|тупик|аллея|линия|проезд|тракт)(\s|,|$)/i;
  if (!streetKeywords.test(v))
    return 'Укажите тип улицы (ул., пр-т, бул., шоссе и т.д.)';

  // должен быть номер дома
  if (!/д\.?\s*\d+|дом\s*\d+|\bд\s+\d+|\b\d+[а-яёa-z]?\b/.test(v))
    return 'Укажите номер дома (д. 10)';

  return '';
}

function setFieldState(inputId, errorId, errorMsg) {
  const input = document.getElementById(inputId);
  const errEl = document.getElementById(errorId);
  if (!input) return;
  if (errorMsg) {
    input.classList.add('input-error');
    input.classList.remove('input-ok');
    if (errEl) errEl.textContent = errorMsg;
  } else {
    input.classList.remove('input-error');
    input.classList.add('input-ok');
    if (errEl) errEl.textContent = '';
  }
  return !errorMsg;
}

// Live validation on blur
function attachLiveValidation() {
  const nameEl = document.getElementById('order-name');
  const phoneEl = document.getElementById('order-phone');
  const addrEl = document.getElementById('order-address');

  nameEl?.addEventListener('blur', () => setFieldState('order-name', 'err-name', validateFullName(nameEl.value)));
  phoneEl?.addEventListener('blur', () => setFieldState('order-phone', 'err-phone', validatePhone(phoneEl.value)));
  addrEl?.addEventListener('blur', () => setFieldState('order-address', 'err-address', validateMoscowAddress(addrEl.value)));
}

// ===== CART PAGE =====
function initCartPage() {
  const user = getCurrentUser();
  const noAuth = document.getElementById('cart-no-auth');
  const cartPage = document.getElementById('cart-page');
  const emptyMsg = document.getElementById('cart-empty');

  if (!user) {
    if (noAuth) noAuth.style.display = 'flex';
    if (cartPage) cartPage.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'none';
    return;
  }

  renderCart();
  applyPhoneMask(document.getElementById('order-phone'));
  attachLiveValidation();
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-items');
  const summary = document.getElementById('cart-summary');
  const emptyMsg = document.getElementById('cart-empty');

  if (!cart.length) {
    if (container) container.innerHTML = '';
    if (summary) summary.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'flex';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (summary) summary.style.display = '';

  if (container) {
    container.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          ${item.photo
            ? `<img src="${item.photo}" alt="${item.name}" onerror="this.outerHTML='<span>${item.img||'🍽️'}</span>'">`
            : `<span>${item.img||'🍽️'}</span>`}
        </div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${item.price} ₽ / шт.</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1); renderCart()">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${item.id}, 1); renderCart()">+</button>
        </div>
        <span class="cart-item-total">${item.price * item.qty} ₽</span>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id}); renderCart()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`).join('');
  }

  const total = getCartTotal();
  const user = getCurrentUser();
  const bonusEl = document.getElementById('bonus-section');
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = total + ' ₽';

  if (bonusEl) {
    if (user && user.bonusPoints > 0) {
      const maxBonus = Math.min(user.bonusPoints, Math.floor(total * 0.3));
      bonusEl.style.display = '';
      bonusEl.innerHTML = `
        <label class="bonus-toggle">
          <input type="checkbox" id="use-bonus" onchange="recalcTotal()">
          <span>Списать бонусы (доступно: <b>${user.bonusPoints}</b>, спишется до <b>${maxBonus}</b>)</span>
        </label>`;
    } else {
      bonusEl.style.display = 'none';
    }
  }
  recalcTotal();
}

function recalcTotal() {
  const total = getCartTotal();
  const user = getCurrentUser();
  const useBonus = document.getElementById('use-bonus')?.checked;
  const bonusDiscount = useBonus && user ? Math.min(user.bonusPoints, Math.floor(total * 0.3)) : 0;
  const final = total - bonusDiscount;
  const earn = Math.floor(final * 0.05);

  const discountEl = document.getElementById('cart-discount');
  const finalEl = document.getElementById('cart-final');
  const earnEl = document.getElementById('cart-earn');
  if (discountEl) discountEl.textContent = bonusDiscount > 0 ? `−${bonusDiscount} ₽` : '0 ₽';
  if (finalEl) finalEl.textContent = final + ' ₽';
  if (earnEl) earnEl.textContent = `+${earn} бонусов`;
}

async function submitOrder() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'auth.html'; return; }

  const nameVal = document.getElementById('order-name')?.value || '';
  const phoneVal = document.getElementById('order-phone')?.value || '';
  const addrVal = document.getElementById('order-address')?.value || '';

  const nameErr = validateFullName(nameVal);
  const phoneErr = validatePhone(phoneVal);
  const addrErr = validateMoscowAddress(addrVal);

  const nameOk = setFieldState('order-name', 'err-name', nameErr);
  const phoneOk = setFieldState('order-phone', 'err-phone', phoneErr);
  const addrOk = setFieldState('order-address', 'err-address', addrErr);

  if (!nameOk || !phoneOk || !addrOk) return;

  const useBonuses = document.getElementById('use-bonus')?.checked || false;
  try {
    const result = await placeOrder({ name: nameVal.trim(), phone: phoneVal.trim(), address: addrVal.trim() }, useBonuses);
    document.getElementById('cart-page').style.display = 'none';
    const success = document.getElementById('order-success');
    if (success) {
      success.style.display = 'flex';
      document.getElementById('success-order-id').textContent = '#' + result.orderId;
      document.getElementById('success-total').textContent = result.finalTotal + ' ₽';
      document.getElementById('success-bonus').textContent = '+' + result.earnedBonuses + ' бонусов';
    }
    updateNavAuth();
  } catch (e) { alert(e.message); }
}

// ===== AUTH PAGE =====
function initAuthPage() {
  if (getCurrentUser()) { window.location.href = isAdmin() ? 'admin.html' : 'profile.html'; return; }

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      document.getElementById(target + '-form').classList.add('active');
    });
  });

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('login-error');
    try {
      const user = await login(document.getElementById('login-email').value, document.getElementById('login-password').value);
      window.location.href = user.role === 'admin' ? 'admin.html' : 'profile.html';
    } catch (err) { if (errEl) errEl.textContent = err.message; }
  });

  applyPhoneMask(document.getElementById('reg-phone'));
  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('reg-error');
    try {
      await register(
        document.getElementById('reg-name').value,
        document.getElementById('reg-email').value,
        document.getElementById('reg-password').value,
        document.getElementById('reg-phone').value
      );
      window.location.href = 'profile.html';
    } catch (err) { if (errEl) errEl.textContent = err.message; }
  });
}

// ===== PROFILE PAGE =====
async function initProfilePage() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'auth.html'; return; }
  if (user.role === 'admin') { window.location.href = 'admin.html'; return; }

  const dbUser = await dbGet('users', user.id);
  if (dbUser && dbUser.bonusPoints !== user.bonusPoints) {
    user.bonusPoints = dbUser.bonusPoints;
    setCurrentUser(user);
    updateNavAuth();
  }
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-phone').textContent = user.phone || '—';
  document.getElementById('profile-bonus').textContent = user.bonusPoints;

  const orders = await dbGetByIndex('orders', 'userId', user.id);
  const ordersContainer = document.getElementById('orders-list');
  if (ordersContainer) {
    if (!orders.length) {
      ordersContainer.innerHTML = '<p class="no-orders">Заказов пока нет</p>';
    } else {
      ordersContainer.innerHTML = orders.reverse().map(o => `
        <div class="order-card">
          <div class="order-card-header">
            <span class="order-id">Заказ #${o.id}</span>
            <span class="order-status status-${o.status}">${statusLabel(o.status)}</span>
            <span class="order-date">${new Date(o.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
          <div class="order-items">${o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</div>
          <div class="order-total">Итого: <b>${o.finalTotal} ₽</b></div>
        </div>`).join('');
    }
  }

  const nextLevel = user.bonusPoints < 500 ? 500 : user.bonusPoints < 1500 ? 1500 : 3000;
  const progress = Math.min((user.bonusPoints / nextLevel) * 100, 100);
  const bar = document.getElementById('bonus-bar');
  if (bar) bar.style.width = progress + '%';
  const levelEl = document.getElementById('bonus-level');
  if (levelEl) levelEl.textContent = user.bonusPoints < 500 ? 'Новичок' : user.bonusPoints < 1500 ? 'Гурман' : 'Шеф';
}

function statusLabel(s) {
  return { confirmed: 'Подтверждён', preparing: 'Готовится', delivering: 'В пути', done: 'Доставлен' }[s] || s;
}

// ===== ADMIN PAGE =====
async function initAdminPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') { window.location.href = 'auth.html'; return; }

  document.getElementById('admin-name').textContent = user.name;
  loadAdminTab('orders');

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadAdminTab(tab.dataset.tab);
    });
  });
}

async function loadAdminTab(tab) {
  const content = document.getElementById('admin-content');
  if (!content) return;

  if (tab === 'orders') {
    const orders = await dbGetAll('orders');
    const users = await dbGetAll('users');
    const userMap = {};
    users.forEach(u => userMap[u.id] = u.name);

    if (!orders.length) {
      content.innerHTML = '<p class="no-orders">Заказов пока нет</p>';
      return;
    }

    content.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>#</th><th>Клиент</th><th>Адрес</th><th>Состав</th><th>Сумма</th><th>Статус</th><th>Дата</th><th>Действие</th></tr></thead>
          <tbody>
            ${orders.reverse().map(o => `
              <tr>
                <td><b>#${o.id}</b></td>
                <td>${o.deliveryData?.name || userMap[o.userId] || 'Гость'}<br><small>${o.deliveryData?.phone||''}</small></td>
                <td><small>${o.deliveryData?.address||'—'}</small></td>
                <td><small>${o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</small></td>
                <td><b>${o.finalTotal} ₽</b></td>
                <td>
                  <select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)">
                    ${['confirmed','preparing','delivering','done'].map(s =>
                      `<option value="${s}" ${o.status===s?'selected':''}>${statusLabel(s)}</option>`
                    ).join('')}
                  </select>
                </td>
                <td><small>${new Date(o.createdAt).toLocaleDateString('ru-RU')}</small></td>
                <td><button class="btn-delete" onclick="deleteOrder(${o.id})">Удалить</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  } else if (tab === 'users') {
    const users = await dbGetAll('users');
    content.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>#</th><th>Имя</th><th>Email</th><th>Телефон</th><th>Роль</th><th>Бонусы</th><th>Дата</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${u.id}</td>
                <td><b>${u.name}</b></td>
                <td>${u.email}</td>
                <td>${u.phone||'—'}</td>
                <td><span class="role-badge role-${u.role||'user'}">${u.role==='admin'?'Админ':'Пользователь'}</span></td>
                <td>${u.bonusPoints||0}</td>
                <td><small>${new Date(u.createdAt).toLocaleDateString('ru-RU')}</small></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  } else if (tab === 'menu') {
    const items = await dbGetAll('menu');
    content.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Фото</th><th>Название</th><th>Категория</th><th>Цена</th><th>Вес</th><th>Ккал</th><th>Б/Ж/У</th><th>Хит</th></tr></thead>
          <tbody>
            ${items.map(i => `
              <tr>
                <td><img src="${i.photo}" style="width:48px;height:36px;object-fit:cover;border-radius:6px" onerror="this.outerHTML='<span style=font-size:1.5rem>${i.img||'🍽️'}</span>'"></td>
                <td><b>${i.name}</b><br><small style="color:#888">${i.desc.substring(0,40)}...</small></td>
                <td>${{pizza:'Пицца',pasta:'Паста',starters:'Закуски',desserts:'Десерты',drinks:'Напитки'}[i.category]||i.category}</td>
                <td><b>${i.price} ₽</b></td>
                <td>${i.weight}</td>
                <td>${i.macros?.kcal||0}</td>
                <td>${i.macros?.protein||0}/${i.macros?.fat||0}/${i.macros?.carbs||0}</td>
                <td>${i.popular?'✅':'—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  } else if (tab === 'stats') {
    const orders = await dbGetAll('orders');
    const users = await dbGetAll('users');
    const totalRevenue = orders.reduce((s, o) => s + (o.finalTotal||0), 0);
    const avgOrder = orders.length ? Math.round(totalRevenue / orders.length) : 0;
    const statusCounts = {};
    orders.forEach(o => statusCounts[o.status] = (statusCounts[o.status]||0) + 1);

    content.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-num">${orders.length}</div><div class="stat-label">Всего заказов</div></div>
        <div class="stat-card"><div class="stat-num">${totalRevenue.toLocaleString()} ₽</div><div class="stat-label">Общая выручка</div></div>
        <div class="stat-card"><div class="stat-num">${avgOrder} ₽</div><div class="stat-label">Средний чек</div></div>
        <div class="stat-card"><div class="stat-num">${users.filter(u=>u.role!=='admin').length}</div><div class="stat-label">Пользователей</div></div>
      </div>
      <div style="margin-top:2rem">
        <h3 style="margin-bottom:1rem;font-size:1rem;font-weight:700">Заказы по статусам</h3>
        ${Object.entries(statusCounts).map(([s,c]) => `
          <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem">
            <span class="order-status status-${s}" style="min-width:120px">${statusLabel(s)}</span>
            <div style="flex:1;background:#f0f0f0;border-radius:4px;height:8px">
              <div style="width:${Math.round(c/orders.length*100)}%;background:var(--red);height:8px;border-radius:4px"></div>
            </div>
            <span style="font-weight:700;min-width:30px">${c}</span>
          </div>`).join('')}
      </div>`;
  }
}

async function updateOrderStatus(orderId, status) {
  const order = await dbGet('orders', orderId);
  if (!order) return;
  order.status = status;
  await dbPut('orders', order);
}

async function deleteOrder(orderId) {
  if (!confirm('Удалить заказ #' + orderId + '?')) return;
  await dbDelete('orders', orderId);
  loadAdminTab('orders');
}









