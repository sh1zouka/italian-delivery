// ===== IndexedDB Database =====
const DB_NAME = 'ItalianDeliveryDB';
const DB_VERSION = 4; // bumped for schema update

let db;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      db = e.target.result;
      const oldVersion = e.oldVersion;

      if (!db.objectStoreNames.contains('users')) {
        const users = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        users.createIndex('email', 'email', { unique: true });
      }
      if (!db.objectStoreNames.contains('orders')) {
        const orders = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        orders.createIndex('userId', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains('menu')) {
        const menu = db.createObjectStore('menu', { keyPath: 'id' });
        menu.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      seedMenu();
      seedAdmin();
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

// ===== Menu Data with photos (Unsplash) + macros =====
const MENU_DATA = [
  // Пицца
  {
    id: 1, category: 'pizza', name: 'Маргарита',
    desc: 'Томатный соус, моцарелла фиор ди латте, свежий базилик',
    price: 590, weight: '400г',
    photo: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 820, protein: 34, fat: 28, carbs: 108 }, popular: true
  },
  {
    id: 2, category: 'pizza', name: 'Пепперони',
    desc: 'Томатный соус, моцарелла, острое пепперони',
    price: 690, weight: '420г',
    photo: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 980, protein: 42, fat: 38, carbs: 110 }, popular: true
  },
  {
    id: 3, category: 'pizza', name: 'Четыре сыра',
    desc: 'Моцарелла, горгонзола, пармезан, рикотта',
    price: 750, weight: '430г',
    photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 1050, protein: 48, fat: 46, carbs: 98 }, popular: false
  },
  {
    id: 4, category: 'pizza', name: 'Прошутто',
    desc: 'Томатный соус, моцарелла, пармская ветчина, руккола',
    price: 780, weight: '440г',
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 890, protein: 44, fat: 32, carbs: 102 }, popular: false
  },
  {
    id: 5, category: 'pizza', name: 'Дьябола',
    desc: 'Острый томатный соус, моцарелла, салями, перец чили',
    price: 710, weight: '420г',
    photo: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 960, protein: 40, fat: 40, carbs: 106 }, popular: true
  },
  {
    id: 6, category: 'pizza', name: 'Вегетариана',
    desc: 'Томатный соус, моцарелла, грибы, перец, оливки, томаты',
    price: 650, weight: '450г',
    photo: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 760, protein: 28, fat: 22, carbs: 112 }, popular: false
  },
  // Паста
  {
    id: 7, category: 'pasta', name: 'Карбонара',
    desc: 'Спагетти, бекон, яйцо, пармезан, чёрный перец',
    price: 520, weight: '320г',
    photo: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 680, protein: 28, fat: 30, carbs: 74 }, popular: true
  },
  {
    id: 8, category: 'pasta', name: 'Болоньезе',
    desc: 'Тальятелле, говяжий фарш, томатный соус, пармезан',
    price: 540, weight: '340г',
    photo: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 620, protein: 32, fat: 22, carbs: 72 }, popular: true
  },
  {
    id: 9, category: 'pasta', name: 'Аматричана',
    desc: 'Букатини, гуанчале, томаты, пекорино романо',
    price: 560, weight: '330г',
    photo: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 590, protein: 24, fat: 20, carbs: 76 }, popular: false
  },
  {
    id: 10, category: 'pasta', name: 'Путтанеска',
    desc: 'Спагетти, оливки, каперсы, анчоусы, томаты',
    price: 530, weight: '320г',
    photo: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 540, protein: 20, fat: 18, carbs: 70 }, popular: false
  },
  {
    id: 11, category: 'pasta', name: 'Лазанья',
    desc: 'Листы пасты, болоньезе, бешамель, пармезан',
    price: 580, weight: '380г',
    photo: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 720, protein: 36, fat: 28, carbs: 80 }, popular: true
  },
  {
    id: 12, category: 'pasta', name: 'Ризотто с грибами',
    desc: 'Рис арборио, белые грибы, пармезан, трюфельное масло',
    price: 620, weight: '350г',
    photo: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 580, protein: 18, fat: 20, carbs: 82 }, popular: false
  },
  // Закуски
  {
    id: 13, category: 'starters', name: 'Брускетта классик',
    desc: 'Хлеб чиабатта, томаты черри, базилик, оливковое масло',
    price: 290, weight: '180г',
    photo: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 280, protein: 8, fat: 10, carbs: 38 }, popular: true
  },
  {
    id: 14, category: 'starters', name: 'Капрезе',
    desc: 'Моцарелла буффало, томаты, базилик, бальзамик',
    price: 420, weight: '220г',
    photo: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 320, protein: 18, fat: 22, carbs: 12 }, popular: false
  },
  {
    id: 15, category: 'starters', name: 'Антипасто',
    desc: 'Ассорти из вяленых мясных деликатесов и сыров',
    price: 680, weight: '280г',
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 480, protein: 28, fat: 36, carbs: 10 }, popular: true
  },
  {
    id: 16, category: 'starters', name: 'Суп минестроне',
    desc: 'Овощной суп с пастой, фасолью и пармезаном',
    price: 350, weight: '300мл',
    photo: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 220, protein: 10, fat: 6, carbs: 32 }, popular: false
  },
  // Десерты
  {
    id: 17, category: 'desserts', name: 'Тирамису',
    desc: 'Маскарпоне, савоярди, эспрессо, какао',
    price: 380, weight: '180г',
    photo: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 420, protein: 8, fat: 24, carbs: 44 }, popular: true
  },
  {
    id: 18, category: 'desserts', name: 'Панна котта',
    desc: 'Нежный сливочный десерт с ягодным соусом',
    price: 320, weight: '160г',
    photo: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 340, protein: 4, fat: 20, carbs: 36 }, popular: true
  },
  {
    id: 19, category: 'desserts', name: 'Каннoli',
    desc: 'Хрустящие трубочки с рикоттой и цукатами',
    price: 290, weight: '140г',
    photo: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 380, protein: 10, fat: 18, carbs: 46 }, popular: false
  },
  {
    id: 20, category: 'desserts', name: 'Джелато',
    desc: 'Итальянское мороженое, 2 шарика на выбор',
    price: 250, weight: '120г',
    photo: 'https://images.unsplash.com/photo-1567206563114-c179706a56b4?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 260, protein: 4, fat: 10, carbs: 38 }, popular: false
  },
  // Напитки
  {
    id: 21, category: 'drinks', name: 'Лимонад Лимончелло',
    desc: 'Домашний лимонад с лимончелло (б/а версия)',
    price: 220, weight: '400мл',
    photo: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 120, protein: 0, fat: 0, carbs: 30 }, popular: true
  },
  {
    id: 22, category: 'drinks', name: 'Эспрессо',
    desc: 'Двойной эспрессо из зерен арабики',
    price: 150, weight: '60мл',
    photo: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 10, protein: 0, fat: 0, carbs: 2 }, popular: false
  },
  {
    id: 23, category: 'drinks', name: 'Сан Пеллегрино',
    desc: 'Газированная минеральная вода',
    price: 180, weight: '500мл',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 0, protein: 0, fat: 0, carbs: 0 }, popular: false
  },
  {
    id: 24, category: 'drinks', name: 'Апероль Шприц',
    desc: 'Апероль, просекко, содовая (б/а версия)',
    price: 280, weight: '300мл',
    photo: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 140, protein: 0, fat: 0, carbs: 18 }, popular: true
  },
  // Дополнительные блюда
  {
    id: 25, category: 'pizza', name: 'Бьянка',
    desc: 'Белый соус бешамель, моцарелла, рикотта, чеснок, розмарин',
    price: 720, weight: '420г',
    photo: 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 890, protein: 36, fat: 38, carbs: 96 }, popular: false
  },
  {
    id: 26, category: 'pizza', name: 'Трюфельная',
    desc: 'Трюфельный крем, моцарелла, шампиньоны, пармезан, руккола',
    price: 950, weight: '430г',
    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 920, protein: 38, fat: 42, carbs: 94 }, popular: true
  },
  {
    id: 27, category: 'pasta', name: 'Качо э Пепе',
    desc: 'Спагетти, пекорино романо, чёрный перец — классика Рима',
    price: 490, weight: '300г',
    photo: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 560, protein: 22, fat: 18, carbs: 72 }, popular: true
  },
  {
    id: 28, category: 'pasta', name: 'Тальятелле с трюфелем',
    desc: 'Свежая паста, сливочный соус, белый трюфель, пармезан',
    price: 780, weight: '320г',
    photo: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 640, protein: 24, fat: 28, carbs: 70 }, popular: true
  },
  {
    id: 29, category: 'pasta', name: 'Пенне Арабьята',
    desc: 'Пенне, острый томатный соус, чеснок, перец чили, базилик',
    price: 460, weight: '310г',
    photo: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 480, protein: 16, fat: 10, carbs: 82 }, popular: false
  },
  {
    id: 30, category: 'starters', name: 'Суппли',
    desc: 'Жареные рисовые шарики с моцареллой и томатным соусом',
    price: 320, weight: '200г',
    photo: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 380, protein: 14, fat: 18, carbs: 42 }, popular: true
  },
  {
    id: 31, category: 'starters', name: 'Карпаччо из говядины',
    desc: 'Тонкие ломтики говядины, руккола, пармезан, каперсы, лимон',
    price: 580, weight: '180г',
    photo: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 290, protein: 28, fat: 16, carbs: 4 }, popular: false
  },
  {
    id: 32, category: 'starters', name: 'Фокачча',
    desc: 'Хлеб на оливковом масле с розмарином, чесноком и морской солью',
    price: 240, weight: '200г',
    photo: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 320, protein: 8, fat: 12, carbs: 46 }, popular: true
  },
  {
    id: 33, category: 'desserts', name: 'Аффогато',
    desc: 'Шарик ванильного джелато, залитый двойным эспрессо',
    price: 290, weight: '150г',
    photo: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 220, protein: 4, fat: 8, carbs: 32 }, popular: true
  },
  {
    id: 34, category: 'desserts', name: 'Сфольятелла',
    desc: 'Слоёное неаполитанское пирожное с рикоттой и цедрой апельсина',
    price: 270, weight: '130г',
    photo: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 340, protein: 8, fat: 16, carbs: 42 }, popular: false
  },
  {
    id: 35, category: 'drinks', name: 'Капучино',
    desc: 'Двойной эспрессо с нежной молочной пенкой',
    price: 190, weight: '180мл',
    photo: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 80, protein: 4, fat: 3, carbs: 10 }, popular: true
  },
  {
    id: 36, category: 'drinks', name: 'Лимонад Базилик-Клубника',
    desc: 'Свежая клубника, базилик, лимонный сок, газированная вода',
    price: 240, weight: '400мл',
    photo: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=95',
    macros: { kcal: 110, protein: 0, fat: 0, carbs: 28 }, popular: true
  },
];

function seedMenu() {
  const tx = db.transaction('menu', 'readwrite');
  const store = tx.objectStore('menu');
  MENU_DATA.forEach(item => store.put(item));
}

async function seedAdmin() {
  try {
    const existing = await dbGetByIndexSingle('users', 'email', 'admin@labellaitalia.ru');
    if (!existing) {
      await dbAdd('users', {
        name: 'Администратор',
        email: 'admin@labellaitalia.ru',
        password: btoa('admin123'),
        phone: '+7 (495) 123-45-67',
        role: 'admin',
        bonusPoints: 0,
        createdAt: new Date().toISOString()
      });
    }
  } catch (e) { /* already exists */ }
}

// ===== DB Operations =====
function dbGet(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbGetAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbGetByIndex(storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).index(indexName).getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbAdd(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).add(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbPut(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).put(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbDelete(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function dbGetByIndexSingle(storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).index(indexName).get(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}






