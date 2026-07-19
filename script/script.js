/* =============================================================
   ТД СпецЗапчасть — script.js
   
   ЧТО ЗДЕСЬ ПРОИСХОДИТ:
   1. Загружаем шапку из /components/header.html в каждую страницу
   2. Загружаем подвал из /components/footer.html в каждую страницу
   3. Загружаем данные каталога из нужного JSON-файла
   4. Рендерим карточки товаров в гриды
   5. Инициализируем мобильное меню и cookie-баннер
   
   КАК ПОДКЛЮЧИТЬ К СТРАНИЦЕ:
   
   В HTML нужно:
   а) Поставить пустые теги-заглушки:
      <header id="site-header"></header>
      ...контент страницы...
      <div id="site-footer"></div>
   
   б) Перед </body> добавить конфиг и подключить скрипт:
      <script>
        window.PAGE_CONFIG = { dataFile: '/data/dz-122.json' };
      </script>
      <script src="/script.js"></script>
   ============================================================= */


/* =============================================================
   ЗАГРУЗКА HTML-КОМПОНЕНТОВ (шапка, подвал)
   ============================================================= */

async function loadComponent(elementId, filePath) {
  const target = document.getElementById(elementId);
  if (!target) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Не удалось загрузить ${filePath}`);
    const html = await response.text();
    target.outerHTML = html;
  } catch (error) {
    console.error('Ошибка загрузки компонента:', error);
  }
}


/* =============================================================
   СОЗДАНИЕ КАРТОЧКИ ТОВАРА
   ============================================================= */

function createCard(item) {
  const article = document.createElement('article');
  article.className = 'product-card';

  article.innerHTML = `
    <img
      class="product-card__img"
      src="${item.image}"
      alt="${item.alt || item.title}"
      loading="lazy"
      decoding="async"
    >
    <h3 class="product-card__title">${item.title}</h3>
    ${item.text ? `<p class="product-card__text">${item.text}</p>` : ''}
    <a class="btn" href="${item.url}" aria-label="Перейти в раздел: ${item.title}">
      Подробнее
    </a>
  `;

  return article;
}


/* =============================================================
   РЕНДЕР ГРИДА ПО ID
   ============================================================= */

function renderGrid(gridId, items) {
  const grid = document.getElementById(gridId);
  if (!grid || !items || items.length === 0) return;

  const fragment = document.createDocumentFragment();
  items.forEach(item => fragment.appendChild(createCard(item)));
  grid.innerHTML = '';
  grid.appendChild(fragment);
}


/* =============================================================
   ЗАГРУЗКА JSON И РЕНДЕР ВСЕХ ГРИДОВ НА СТРАНИЦЕ
   ============================================================= */

async function loadAndRender(dataFile) {
  try {
    const response = await fetch(dataFile);
    if (!response.ok) throw new Error(`Не удалось загрузить ${dataFile}: ${response.status}`);
    const data = await response.json();

    if (Array.isArray(data)) {
      renderGrid('productGrid', data);
    } else {
      Object.entries(data).forEach(([gridId, items]) => {
        renderGrid(gridId, items);
      });
    }

  } catch (error) {
    console.error('Ошибка загрузки данных каталога:', error);
  }
}


/* =============================================================
   МОБИЛЬНОЕ МЕНЮ
   ============================================================= */

   function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('nav');
    if (!mobileToggle || !nav) return;
  
    function closeMenu() {
      nav.classList.remove('is-open');
      nav.setAttribute('aria-hidden', 'true');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.classList.remove('active');
    }
  
    function openMenu() {
      nav.classList.add('is-open');
      nav.setAttribute('aria-hidden', 'false');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileToggle.classList.add('active');
    }
  
    nav.setAttribute('aria-hidden', 'true');
    mobileToggle.setAttribute('aria-expanded', 'false');
  
    mobileToggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeMenu() : openMenu();
    });
  
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 980) closeMenu();
      });
    });
  
    document.addEventListener('click', e => {
      if (
        nav.classList.contains('is-open') &&
        !nav.contains(e.target) &&
        !mobileToggle.contains(e.target)
      ) {
        closeMenu();
      }
    });
  
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        mobileToggle.focus();
      }
    });
  
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) {
        closeMenu();
        nav.removeAttribute('aria-hidden');
      } else if (!nav.classList.contains('is-open')) {
        nav.setAttribute('aria-hidden', 'true');
      }
    });
  }

/* =============================================================
   БАННЕР COOKIE
   ============================================================= */

function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  const accept = document.getElementById('cookieAccept');
  const closeBtn = document.getElementById('cookieClose');
  if (!banner) return;

  if (!localStorage.getItem('cookieAccepted')) {
    banner.style.display = 'block';
  }

  accept?.addEventListener('click', () => {
    localStorage.setItem('cookieAccepted', 'true');
    banner.style.display = 'none';
  });

  closeBtn?.addEventListener('click', () => {
    banner.style.display = 'none';
  });
}


/* =============================================================
   ЗАПУСК
   ============================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Загружаем шапку и подвал параллельно (одновременно)
  await Promise.all([
    loadComponent('site-header', './components/header.html'),
    loadComponent('site-footer', './components/footer.html'),
    loadComponent('site-sidebar', './components/sidebar.html'),
  ]);

  // 2. Шапка и подвал уже в DOM — инициализируем интерактивность
  initMobileMenu();
  initCookieBanner();

  // 3. Загружаем данные каталога, если страница указала файл
  if (window.PAGE_CONFIG?.dataFile) {
    loadAndRender(window.PAGE_CONFIG.dataFile);
  }

});
