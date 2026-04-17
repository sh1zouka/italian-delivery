// ===== IndexedDB Database =====
const DB_NAME = 'ItalianDeliveryDB';
const DB_VERSION = 5; // bumped for schema update

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
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 820, protein: 34, fat: 28, carbs: 108 }, popular: true
  },
  {
    id: 2, category: 'pizza', name: 'Пепперони',
    desc: 'Томатный соус, моцарелла, острое пепперони',
    photo: 'https://cdn.pixabay.com/photo/2020/06/08/16/18/pizza-5275191_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 980, protein: 42, fat: 38, carbs: 110 }, popular: true
  },
  {
    id: 3, category: 'pizza', name: 'Четыре сыра',
    desc: 'Моцарелла, горгонзола, пармезан, рикотта',
    photo: 'https://cdn.pixabay.com/photo/2016/11/29/03/36/pizza-1869599_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 1050, protein: 48, fat: 46, carbs: 98 }, popular: false
  },
  {
    id: 4, category: 'pizza', name: 'Прошутто',
    desc: 'Томатный соус, моцарелла, пармская ветчина, руккола',
    photo: 'https://cdn.pixabay.com/photo/2018/09/26/17/31/pizza-3705962_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 890, protein: 44, fat: 32, carbs: 102 }, popular: false
  },
  {
    id: 5, category: 'pizza', name: 'Дьябола',
    desc: 'Острый томатный соус, моцарелла, салями, перец чили',
    photo: 'https://cdn.pixabay.com/photo/2017/08/02/19/30/pizza-2571392_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 960, protein: 40, fat: 40, carbs: 106 }, popular: true
  },
  {
    id: 6, category: 'pizza', name: 'Вегетариана',
    desc: 'Томатный соус, моцарелла, грибы, перец, оливки, томаты',
    photo: 'https://cdn.pixabay.com/photo/2021/01/08/09/28/pizza-5898636_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 760, protein: 28, fat: 22, carbs: 112 }, popular: false
  },
  // Паста
  {
    id: 7, category: 'pasta', name: 'Карбонара',
    desc: 'Спагетти, бекон, яйцо, пармезан, чёрный перец',
    photo: 'https://cdn.pixabay.com/photo/2018/07/16/11/05/spaghetti-3541447_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 680, protein: 28, fat: 30, carbs: 74 }, popular: true
  },
  {
    id: 8, category: 'pasta', name: 'Болоньезе',
    desc: 'Тальятелле, говяжий фарш, томатный соус, пармезан',
    photo: 'https://cdn.pixabay.com/photo/2017/01/26/19/15/pasta-2011460_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 620, protein: 32, fat: 22, carbs: 72 }, popular: true
  },
  {
    id: 9, category: 'pasta', name: 'Аматричана',
    desc: 'Букатини, гуанчале, томаты, пекорино романо',
    photo: 'https://cdn.pixabay.com/photo/2016/10/25/07/55/pasta-1768949_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 590, protein: 24, fat: 20, carbs: 76 }, popular: false
  },
  {
    id: 10, category: 'pasta', name: 'Путтанеска',
    desc: 'Спагетти, оливки, каперсы, анчоусы, томаты',
    photo: 'https://cdn.pixabay.com/photo/2021/03/17/09/29/pasta-6101778_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 540, protein: 20, fat: 18, carbs: 70 }, popular: false
  },
  {
    id: 11, category: 'pasta', name: 'Лазанья',
    desc: 'Листы пасты, болоньезе, бешамель, пармезан',
    photo: 'https://cdn.pixabay.com/photo/2018/07/16/11/05/spaghetti-3541447_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 720, protein: 36, fat: 28, carbs: 80 }, popular: true
  },
  {
    id: 12, category: 'pasta', name: 'Ризотто с грибами',
    desc: 'Рис арборио, белые грибы, пармезан, трюфельное масло',
    photo: 'https://cdn.pixabay.com/photo/2017/01/26/19/15/pasta-2011460_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 580, protein: 18, fat: 20, carbs: 82 }, popular: false
  },
  // Закуски
  {
    id: 13, category: 'starters', name: 'Брускетта классик',
    desc: 'Хлеб чиабатта, томаты черри, базилик, оливковое масло',
    photo: 'https://cdn.pixabay.com/photo/2016/10/25/07/55/pasta-1768949_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 280, protein: 8, fat: 10, carbs: 38 }, popular: true
  },
  {
    id: 14, category: 'starters', name: 'Капрезе',
    desc: 'Моцарелла буффало, томаты, базилик, бальзамик',
    photo: 'https://cdn.pixabay.com/photo/2021/03/17/09/29/pasta-6101778_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 320, protein: 18, fat: 22, carbs: 12 }, popular: false
  },
  {
    id: 15, category: 'starters', name: 'Антипасто',
    desc: 'Ассорти из вяленых мясных деликатесов и сыров',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 480, protein: 28, fat: 36, carbs: 10 }, popular: true
  },
  {
    id: 16, category: 'starters', name: 'Суп минестроне',
    desc: 'Овощной суп с пастой, фасолью и пармезаном',
    photo: 'https://cdn.pixabay.com/photo/2016/11/29/03/36/pizza-1869599_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 220, protein: 10, fat: 6, carbs: 32 }, popular: false
  },
  // Десерты
  {
    id: 17, category: 'desserts', name: 'Тирамису',
    desc: 'Маскарпоне, савоярди, эспрессо, какао',
    photo: 'https://cdn.pixabay.com/photo/2017/08/02/19/30/pizza-2571392_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 420, protein: 8, fat: 24, carbs: 44 }, popular: true
  },
  {
    id: 18, category: 'desserts', name: 'Панна котта',
    desc: 'Нежный сливочный десерт с ягодным соусом',
    photo: 'https://cdn.pixabay.com/photo/2020/06/08/16/18/pizza-5275191_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 340, protein: 4, fat: 20, carbs: 36 }, popular: true
  },
  {
    id: 19, category: 'desserts', name: 'Каннoli',
    desc: 'Хрустящие трубочки с рикоттой и цукатами',
    photo: 'https://cdn.pixabay.com/photo/2018/09/26/17/31/pizza-3705962_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 380, protein: 10, fat: 18, carbs: 46 }, popular: false
  },
  {
    id: 20, category: 'desserts', name: 'Джелато',
    desc: 'Итальянское мороженое, 2 шарика на выбор',
    photo: 'https://cdn.pixabay.com/photo/2021/01/08/09/28/pizza-5898636_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 260, protein: 4, fat: 10, carbs: 38 }, popular: false
  },
  // Напитки
  {
    id: 21, category: 'drinks', name: 'Лимонад Лимончелло',
    desc: 'Домашний лимонад с лимончелло (б/а версия)',
    photo: 'https://cdn.pixabay.com/photo/2018/07/16/11/05/spaghetti-3541447_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 120, protein: 0, fat: 0, carbs: 30 }, popular: true
  },
  {
    id: 22, category: 'drinks', name: 'Эспрессо',
    desc: 'Двойной эспрессо из зерен арабики',
    photo: 'https://cdn.pixabay.com/photo/2017/01/26/19/15/pasta-2011460_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 10, protein: 0, fat: 0, carbs: 2 }, popular: false
  },
  {
    id: 23, category: 'drinks', name: 'Сан Пеллегрино',
    desc: 'Газированная минеральная вода',
    photo: 'https://cdn.pixabay.com/photo/2016/10/25/07/55/pasta-1768949_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 0, protein: 0, fat: 0, carbs: 0 }, popular: false
  },
  {
    id: 24, category: 'drinks', name: 'Апероль Шприц',
    desc: 'Апероль, просекко, содовая (б/а версия)',
    photo: 'https://cdn.pixabay.com/photo/2021/03/17/09/29/pasta-6101778_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 140, protein: 0, fat: 0, carbs: 18 }, popular: true
  },
  // Дополнительные блюда
  {
    id: 25, category: 'pizza', name: 'Бьянка',
    desc: 'Белый соус бешамель, моцарелла, рикотта, чеснок, розмарин',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 890, protein: 36, fat: 38, carbs: 96 }, popular: false
  },
  {
    id: 26, category: 'pizza', name: 'Трюфельная',
    desc: 'Трюфельный крем, моцарелла, шампиньоны, пармезан, руккола',
    photo: 'https://cdn.pixabay.com/photo/2020/06/08/16/18/pizza-5275191_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 920, protein: 38, fat: 42, carbs: 94 }, popular: true
  },
  {
    id: 27, category: 'pasta', name: 'Качо э Пепе',
    desc: 'Спагетти, пекорино романо, чёрный перец — классика Рима',
    photo: 'https://cdn.pixabay.com/photo/2018/07/16/11/05/spaghetti-3541447_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 560, protein: 22, fat: 18, carbs: 72 }, popular: true
  },
  {
    id: 28, category: 'pasta', name: 'Тальятелле с трюфелем',
    desc: 'Свежая паста, сливочный соус, белый трюфель, пармезан',
    photo: 'https://cdn.pixabay.com/photo/2017/01/26/19/15/pasta-2011460_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 640, protein: 24, fat: 28, carbs: 70 }, popular: true
  },
  {
    id: 29, category: 'pasta', name: 'Пенне Арабьята',
    desc: 'Пенне, острый томатный соус, чеснок, перец чили, базилик',
    photo: 'https://cdn.pixabay.com/photo/2016/10/25/07/55/pasta-1768949_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 480, protein: 16, fat: 10, carbs: 82 }, popular: false
  },
  {
    id: 30, category: 'starters', name: 'Суппли',
    desc: 'Жареные рисовые шарики с моцареллой и томатным соусом',
    photo: 'https://cdn.pixabay.com/photo/2021/03/17/09/29/pasta-6101778_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 380, protein: 14, fat: 18, carbs: 42 }, popular: true
  },
  {
    id: 31, category: 'starters', name: 'Карпаччо из говядины',
    desc: 'Тонкие ломтики говядины, руккола, пармезан, каперсы, лимон',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 290, protein: 28, fat: 16, carbs: 4 }, popular: false
  },
  {
    id: 32, category: 'starters', name: 'Фокачча',
    desc: 'Хлеб на оливковом масле с розмарином, чесноком и морской солью',
    photo: 'https://cdn.pixabay.com/photo/2016/11/29/03/36/pizza-1869599_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 320, protein: 8, fat: 12, carbs: 46 }, popular: true
  },
  {
    id: 33, category: 'desserts', name: 'Аффогато',
    desc: 'Шарик ванильного джелато, залитый двойным эспрессо',
    photo: 'https://cdn.pixabay.com/photo/2017/08/02/19/30/pizza-2571392_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 220, protein: 4, fat: 8, carbs: 32 }, popular: true
  },
  {
    id: 34, category: 'desserts', name: 'Сфольятелла',
    desc: 'Слоёное неаполитанское пирожное с рикоттой и цедрой апельсина',
    photo: 'https://cdn.pixabay.com/photo/2020/06/08/16/18/pizza-5275191_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 340, protein: 8, fat: 16, carbs: 42 }, popular: false
  },
  {
    id: 35, category: 'drinks', name: 'Капучино',
    desc: 'Двойной эспрессо с нежной молочной пенкой',
    photo: 'https://cdn.pixabay.com/photo/2018/09/26/17/31/pizza-3705962_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 80, protein: 4, fat: 3, carbs: 10 }, popular: true
  },
  {
    id: 36, category: 'drinks', name: 'Лимонад Базилик-Клубника',
    desc: 'Свежая клубника, базилик, лимонный сок, газированная вода',
    photo: 'https://cdn.pixabay.com/photo/2021/01/08/09/28/pizza-5898636_640.jpg',
    photo: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
    macros:macros: { kcal: 110, protein: 0, fat: 0, carbs: 28 }, popular: true
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













