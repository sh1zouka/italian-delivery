// ===== Auth Module =====
const AUTH_KEY = 'italianDelivery_user';

function getCurrentUser() {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

function isAdmin() {
  const u = getCurrentUser();
  return u && u.role === 'admin';
}

function setCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'index.html';
}

async function register(name, email, password, phone) {
  const existing = await dbGetByIndexSingle('users', 'email', email);
  if (existing) throw new Error('Пользователь с таким email уже существует');

  const user = {
    name, email,
    password: btoa(password),
    phone,
    role: 'user',
    bonusPoints: 100,
    createdAt: new Date().toISOString()
  };

  const id = await dbAdd('users', user);
  user.id = id;
  setCurrentUser({ id, name, email, phone, role: 'user', bonusPoints: 100 });
  return user;
}

async function login(email, password) {
  const user = await dbGetByIndexSingle('users', 'email', email);
  if (!user) throw new Error('Пользователь не найден');
  if (user.password !== btoa(password)) throw new Error('Неверный пароль');

  setCurrentUser({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role || 'user', bonusPoints: user.bonusPoints });
  return user;
}

async function updateUserBonuses(userId, points) {
  const user = await dbGet('users', userId);
  if (!user) return;
  user.bonusPoints = (user.bonusPoints || 0) + points;
  await dbPut('users', user);
  const current = getCurrentUser();
  if (current && current.id === userId) {
    current.bonusPoints = user.bonusPoints;
    setCurrentUser(current);
  }
  return user.bonusPoints;
}

function updateNavAuth() {
  const user = getCurrentUser();
  document.querySelectorAll('.nav-auth').forEach(el => el.style.display = user ? 'none' : '');
  document.querySelectorAll('.nav-user').forEach(el => el.style.display = user ? '' : 'none');
  document.querySelectorAll('.bonus-badge').forEach(el => {
    if (user) el.textContent = user.bonusPoints + ' бонусов';
  });
  document.querySelectorAll('.nav-admin-link').forEach(el => {
    el.style.display = (user && user.role === 'admin') ? '' : 'none';
  });
  const nameEl = document.getElementById('nav-username');
  if (nameEl && user) nameEl.textContent = user.name;
}
