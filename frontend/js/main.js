// ==========================================
// PAU HOUSING — MAIN JS
// ==========================================

// API_BASE is set in config.js which loads first
// Falls back to localhost if config not loaded
if (typeof API_BASE === 'undefined') {
  var API_BASE = 'http://localhost:3000/api';
}

const SELF_CONTAIN_IMGS = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
];

const TYPE_IMGS = {
  'self-contain': SELF_CONTAIN_IMGS,
  'single': [
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
  ],
  'shared': [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80',
  ],
  'flat': [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
  ],
};

const typeCtrs = {};
function getImg(roomType) {
  const t = (roomType || '').toLowerCase();
  const k = t.includes('self') ? 'self-contain'
    : t.includes('single') ? 'single'
    : t.includes('shared') ? 'shared'
    : t.includes('flat') ? 'flat'
    : 'self-contain';
  if (!typeCtrs[k]) typeCtrs[k] = 0;
  const imgs = TYPE_IMGS[k];
  return imgs[(typeCtrs[k]++) % imgs.length];
}

function resolveAppPath(path) {
  if (!path || /^(https?:)?\/\//.test(path) || path.startsWith('#') || path.startsWith('/')) return path;
  const isInsidePages = window.location.pathname.includes('/frontend/pages/');
  if (isInsidePages) {
    return path === 'index.html' ? '../../index.html' : path;
  }
  return path === 'index.html' ? 'index.html' : `frontend/pages/${path}`;
}

// ==========================================
// NAVBAR
// ==========================================
function updateNavbar() {
  const user  = JSON.parse(localStorage.getItem('pau_user') || 'null');
  const token = localStorage.getItem('pau_token');
  const nav   = document.getElementById('navLinks');
  if (!nav) return;

  if (token && user) {
    if (user.role === 'landlord') {
      nav.querySelectorAll('li').forEach(li => {
        const a = li.querySelector('a');
        if (a && (a.href.includes('properties.html') || a.href.includes('landlords.html'))) {
          li.remove();
        }
      });
    }

    nav.querySelectorAll('li').forEach(li => {
      const a = li.querySelector('a');
      if (a && (a.href.includes('login.html') || a.href.includes('register.html'))) {
        li.remove();
      }
    });

    const dashUrl = resolveAppPath(user.role === 'landlord' ? 'owner-dashboard.html' : 'student-dashboard.html');
    const dashLi  = document.createElement('li');
    dashLi.innerHTML = `<a href="${dashUrl}" class="btn-nav">👤 ${user.name.split(' ')[0]}</a>`;
    nav.appendChild(dashLi);

    const logoutLi = document.createElement('li');
    logoutLi.innerHTML = `<a href="#" class="btn-nav-outline" onclick="logoutUser(event)">Logout</a>`;
    nav.appendChild(logoutLi);
  }
}

function logoutUser(e) {
  e && e.preventDefault();
  localStorage.removeItem('pau_token');
  localStorage.removeItem('pau_user');
  window.location.href = resolveAppPath('index.html');
}

function updateHomeGreeting() {
  const user = JSON.parse(localStorage.getItem('pau_user') || 'null');
  const greeting = document.getElementById('homeGreeting');
  const nameSpan = document.getElementById('homeUserName');
  if (!greeting || !nameSpan) return;
  if (user && user.name) {
    nameSpan.textContent = user.name.split(' ')[0];
    greeting.style.display = 'block';
  } else {
    greeting.style.display = 'none';
  }
}

// ==========================================
// STATS
// ==========================================
async function loadStats() {
  try {
    const [p, l] = await Promise.all([
      fetch(`${API_BASE}/properties`),
      fetch(`${API_BASE}/landlords`)
    ]);
    const props = await p.json();
    const lands = await l.json();
    const ce = document.getElementById('countProperties');
    const le = document.getElementById('countLandlords');
    if (ce) ce.textContent = props.length;
    if (le) le.textContent = lands.length;
  } catch (e) {}
}

// ==========================================
// FEATURED PROPERTIES
// ==========================================
const FEATURED_SAMPLE_PROPERTIES = [
  { id:1, name:'Sunrise Lodge',    address:'Beside PAU Gate, Ibeju-Lekki',  rent:350000, room_type:'self-contain', distance_from_school:0.3, available:true },
  { id:2, name:'Grace Apartment',  address:'Abraham Adesanya, Ajah',      rent:280000, room_type:'shared',       distance_from_school:0.8, available:true },
  { id:3, name:'Royal Chambers',   address:'Bogije, Ibeju-Lekki',         rent:480000, room_type:'flat',         distance_from_school:1.2, available:false },
  { id:4, name:'Palm View Hostel', address:'Lakowe Estate',              rent:220000, room_type:'single',       distance_from_school:2.0, available:true },
  { id:5, name:'Lekki Gardens',    address:'Ibeju-Lekki Town',            rent:400000, room_type:'self-contain', distance_from_school:0.6, available:true },
  { id:6, name:'Ambassador Lodge', address:'Beside PAU Road',             rent:380000, room_type:'self-contain', distance_from_school:0.4, available:true },
];

async function loadFeaturedProperties() {
  const grid = document.getElementById('featuredProperties');
  if (!grid) return;
  Object.keys(typeCtrs).forEach(k => typeCtrs[k] = 0);
  let data = FEATURED_SAMPLE_PROPERTIES;
  try {
    const res = await fetch(`${API_BASE}/properties?limit=6`);
    if (res.ok) {
      const apiData = await res.json();
      if (Array.isArray(apiData) && apiData.length) {
        data = apiData;
      }
    }
  } catch (err) {
    console.warn('Featured properties fetch failed, using sample cards.', err);
  }
  grid.innerHTML = data.map((p, i) => makeCard(p, i)).join('');
}

async function loadHomeSpotlightProperties() {
  const grid = document.getElementById('homeSpotlightProperties');
  if (!grid) return;
  Object.keys(typeCtrs).forEach(k => typeCtrs[k] = 0);
  let data = FEATURED_SAMPLE_PROPERTIES.slice(0, 4);
  try {
    const res = await fetch(`${API_BASE}/properties?limit=4`);
    if (res.ok) {
      const apiData = await res.json();
      if (Array.isArray(apiData) && apiData.length) {
        data = apiData.slice(0, 4);
      }
    }
  } catch (err) {
    console.warn('Spotlight properties fetch failed, using sample cards.', err);
  }
  grid.innerHTML = data.map((p, i) => makeCard(p, i)).join('');
}

function makeCard(p, index) {
  const img = p.image_url
    ? `${API_BASE.replace('/api', '')}${p.image_url}`
    : getImg(p.room_type);
  const detailUrl = `${resolveAppPath('property-detail.html')}?id=${p.id}`;
  const available = p.available === false ? false : true;
  return `
    <div class="property-card" onclick="window.location.href='${detailUrl}'">
      <div class="property-img-wrap">
        <img src="${img}" alt="${p.name}"
          onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80'"/>
        <span class="property-status ${available ? 'available' : 'unavailable'}">
          ${available ? 'Available' : 'Unavailable'}
        </span>
        <button class="save-btn" title="Save"
          onclick="event.stopPropagation();saveProperty(${JSON.stringify(p).replace(/"/g, '&quot;')})">&#9825;</button>
      </div>
      <div class="property-body">
        <span class="property-badge">${p.room_type || 'Room'}</span>
        <p class="property-name">${p.name}</p>
        <p class="property-meta">📍 ${p.address} &nbsp;|&nbsp; 🚶 ${p.distance_from_school || '?'}km from PAU</p>
        <div class="property-footer">
          <div class="property-price">&#8358;${Number(p.rent).toLocaleString()} <span>/yr</span></div>
          <a class="btn-details" href="${detailUrl}">View Details</a>
        </div>
      </div>
    </div>`;
}

function getSampleCards(limit = 6) {
  const s = [
    { id:1, name:'Sunrise Lodge',    address:'Beside PAU Gate, Ibeju-Lekki', rent:350000, room_type:'self-contain', distance_from_school:0.3 },
    { id:2, name:'Grace Apartment',  address:'Abraham Adesanya, Ajah',        rent:280000, room_type:'shared',       distance_from_school:0.8 },
    { id:3, name:'Royal Chambers',   address:'Bogije, Ibeju-Lekki',           rent:480000, room_type:'flat',         distance_from_school:1.2 },
    { id:4, name:'Palm View Hostel', address:'Lakowe Estate',                  rent:220000, room_type:'single',       distance_from_school:2.0 },
    { id:5, name:'Lekki Gardens',    address:'Ibeju-Lekki Town',              rent:400000, room_type:'self-contain', distance_from_school:0.6 },
    { id:6, name:'Ambassador Lodge', address:'Beside PAU Road',               rent:380000, room_type:'self-contain', distance_from_school:0.4 },
  ];
  return s.slice(0, limit).map((p, i) => makeCard(p, i)).join('');
}

// ==========================================
// SAVE PROPERTY
// ==========================================
function saveProperty(p) {
  const token = localStorage.getItem('pau_token');
  if (!token) {
    const g = document.getElementById('authGuard');
    if (g) { g.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
    else window.location.href = resolveAppPath('login.html');
    return;
  }
  let saved = JSON.parse(localStorage.getItem('pau_saved') || '[]');
  if (saved.find(s => s.id === p.id)) { showToast('This property is already saved.', 'info'); return; }
  saved.push(p);
  localStorage.setItem('pau_saved', JSON.stringify(saved));
  showToast('Property saved to your dashboard.', 'success');
}

// ==========================================
// SEARCH
// ==========================================
function searchProperties() {
  const name    = document.getElementById('searchName')?.value  || '';
  const type    = document.getElementById('roomType')?.value    || '';
  const maxRent = document.getElementById('maxRent')?.value     || '';
  const params  = new URLSearchParams();
  if (name)    params.append('name', name);
  if (type)    params.append('room_type', type);
  if (maxRent) params.append('max_rent', maxRent);
  window.location.href = `${resolveAppPath('properties.html')}?${params.toString()}`;
}

// ==========================================
// HAMBURGER MENU — FIXED FOR MOBILE
// ==========================================
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  // Create backdrop overlay (only once)
  let backdrop = document.getElementById('menu-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'menu-backdrop';
    backdrop.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 998;
      backdrop-filter: blur(2px);
      cursor: pointer;
    `;
    document.body.appendChild(backdrop);
  }

  // Close menu function
  function closeMenu() {
    navLinks.classList.remove('open');
    backdrop.style.display = 'none';
  }

  // Hamburger click handler
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    backdrop.style.display = isOpen ? 'block' : 'none';
  });

  // Close menu when clicking backdrop
  backdrop.addEventListener('click', function(e) {
    e.stopPropagation();
    closeMenu();
  });

  // Close menu when clicking on nav links
  navLinks.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
      closeMenu();
    }
  });

  // Close menu when clicking anywhere else on the page
  document.addEventListener('click', function(e) {
    const isMenuOpen = navLinks.classList.contains('open');
    if (isMenuOpen && !hamburger.contains(e.target) && !navLinks.contains(e.target) && !backdrop.contains(e.target)) {
      closeMenu();
    }
  }, { capture: false });

  // Also close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
    }
  });
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  updateHomeGreeting();
  loadStats();
  loadFeaturedProperties();
  loadHomeSpotlightProperties();
  initHamburger();

  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }
});