// ===== Cart Module =====
const CART_KEY = 'italianDelivery_cart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
  showCartToast(item.name);
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeFromCart(id);
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function showCartToast(name) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.className = 'cart-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = `✓ ${name} добавлен в корзину`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

async function placeOrder(deliveryData, useBonuses) {
  const user = getCurrentUser();
  if (!user) throw new Error('Необходима авторизация для оформления заказа');
  const cart = getCart();
  if (!cart.length) throw new Error('Корзина пуста');

  const total = getCartTotal();
  const bonusDiscount = useBonuses && user ? Math.min(user.bonusPoints, Math.floor(total * 0.3)) : 0;
  const finalTotal = total - bonusDiscount;
  const earnedBonuses = Math.floor(finalTotal * 0.05);

  const order = {
    userId: user ? user.id : null,
    items: cart,
    total,
    bonusDiscount,
    finalTotal,
    earnedBonuses,
    deliveryData,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  const orderId = await dbAdd('orders', order);

  if (user) {
    const bonusDelta = earnedBonuses - bonusDiscount;
    await updateUserBonuses(user.id, bonusDelta);
  }

  clearCart();
  return { orderId, earnedBonuses, bonusDiscount, finalTotal };
}
