// ==========================================
// PAU HOUSING — MAIN JS
// ==========================================

// API_BASE is defined in config.js
// If config.js is not loaded, fall back to localhost
if (typeof API_BASE === 'undefined') {
  window.API_BASE = 'http://localhost:3000/api';
}
// Use window.API_BASE throughout so there is no duplicate declaration conflict
const _API = window.API_BASE || 'http://localhost:3000/api';

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

// ==========================================
// NAVBAR
// ==========================================
function updateNavbar() {
  const user  = JSON.parse(localStorage.getItem('pau_user') || 'null');
  const token = localStorage.getItem('pau_token');
  const nav   = document.getElementById('navLinks');
  if (!nav) return;

  if (token && user) {
    // 1. Remove landlord-irrelevant links
    if (user.role === 'landlord') {
      nav.querySelectorAll('li').forEach(li => {
        const a = li.querySelector('a');
        if (a && (a.href.includes('properties.html') || a.href.includes('landlords.html'))) {
          li.remove();
        }
      });
    }

    // 2. Remove standard login and signup links
    nav.querySelectorAll('li').forEach(li => {
      const a = li.querySelector('a');
      if (a && (a.href.includes('login.html') || a.href.includes('register.html'))) {
        li.remove();
      }
    });

    // 3. Remove any previously added profile/logout links to prevent duplicates
    nav.querySelectorAll('li.nav-user-item').forEach(li => li.remove());

    // 4. Figure out path layout based on current page location
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    const pathPrefix = isIndexPage ? 'frontend/pages/' : '';

    // 5. Add dynamic dashboard link
    const dashUrl = user.role === 'landlord'
      ? 'owner-dashboard.html'
      : user.role === 'agent'
        ? 'agent-dashboard.html'
        : 'student-dashboard.html';
    const dashLi  = document.createElement('li');
    dashLi.className = 'nav-user-item';
    dashLi.innerHTML = `<a href="${pathPrefix}${dashUrl}" class="btn-nav">👤 ${user.name.split(' ')[0]}</a>`;
    nav.appendChild(dashLi);

    // 6. Add dynamic logout link
    const logoutLi = document.createElement('li');
    logoutLi.className = 'nav-user-item';
    logoutLi.innerHTML = `<a href="#" class="btn-nav-outline" id="globalLogoutBtn">Sign Out</a>`;
    nav.appendChild(logoutLi);

    // Attach click event safely
    document.getElementById('globalLogoutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser(e);
    });
  }
}

function logoutUser(e) {
  e && e.preventDefault();
  localStorage.removeItem('pau_token');
  localStorage.removeItem('pau_user');
  window.location.href = window.location.pathname.includes('pages/') ? '../../index.html' : 'index.html';
}

// ==========================================
// STATS
// ==========================================
async function loadStats() {
  try {
    const [p, l] = await Promise.all([
      fetch(`${_API}/properties`),
      fetch(`${_API}/landlords`)
    ]);
    const props = await p.json();
    const lands = await l.json();
    const ce = document.getElementById('countProperties');
    const le = document.getElementById('countLandlords');
    const re = document.getElementById('avgRating');
    if (ce) ce.textContent = props.length;
    if (le) le.textContent = lands.length;
    if (re) {
      const avg = lands.length
        ? lands.reduce((sum, item) => sum + Number(item.average_rating || 0), 0) / lands.length
        : 0;
      re.textContent = `${avg.toFixed(1)}★`;
    }
  } catch (e) {}
}

// ==========================================
// FEATURED PROPERTIES
// ==========================================
async function loadFeaturedProperties() {
  const grid = document.getElementById('featuredProperties');
  if (!grid) return;
  Object.keys(typeCtrs).forEach(k => typeCtrs[k] = 0);
  try {
    const res  = await fetch(`${_API}/properties?limit=6`);
    const data = await res.json();
    grid.innerHTML = data.length
      ? data.map((p, i) => makeCard(p, i)).join('')
      : getSampleCards();
  } catch {
    grid.innerHTML = getSampleCards();
  }
}

function makeCard(p, index) {
  const img = p.image_url
    ? `${_API.replace('/api', '')}${p.image_url}`
    : getImg(p.room_type);
  return `
    <div class="property-card" onclick="window.location.href='frontend/pages/property-detail.html?id=${p.id}'">
      <div class="property-img-wrap">
        <img src="${img}" alt="${p.name}"
          onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80'"/>
        <button class="save-btn" title="Save"
          onclick="event.stopPropagation();saveProperty(${JSON.stringify(p).replace(/"/g, '&quot;')})">&#9825;</button>
      </div>
      <div class="property-body">
        <span class="property-badge">${p.room_type || 'Room'}</span>
        <p class="property-name">${p.name}</p>
        <p class="property-meta">📍 ${p.address} &nbsp;|&nbsp; 🚶 ${p.distance_from_school || '?'}km from PAU</p>
        <div class="property-footer">
          <div class="property-price">&#8358;${Number(p.rent).toLocaleString()} <span>/yr</span></div>
          <a class="btn-details" href="frontend/pages/property-detail.html?id=${p.id}">View Details</a>
        </div>
      </div>
    </div>`;
}

function getSampleCards() {
  const s = [
    { id:1, name:'Sunrise Lodge',    address:'Beside PAU Gate, Ibeju-Lekki', rent:350000, room_type:'self-contain', distance_from_school:0.3 },
    { id:2, name:'Grace Apartment',  address:'Abraham Adesanya, Ajah',        rent:280000, room_type:'shared',        distance_from_school:0.8 },
    { id:3, name:'Royal Chambers',   address:'Bogije, Ibeju-Lekki',           rent:480000, room_type:'flat',          distance_from_school:1.2 },
    { id:4, name:'Palm View Hostel', address:'Lakowe Estate',                  rent:220000, room_type:'single',        distance_from_school:2.0 },
    { id:5, name:'Lekki Gardens',    address:'Ibeju-Lekki Town',              rent:400000, room_type:'self-contain', distance_from_school:0.6 },
    { id:6, name:'Ambassador Lodge', address:'Beside PAU Road',               rent:380000, room_type:'self-contain', distance_from_school:0.4 },
  ];
  return s.map((p, i) => makeCard(p, i)).join('');
}

// ==========================================
// SAVE PROPERTY
// ==========================================
function saveProperty(p) {
  const token = localStorage.getItem('pau_token');
  if (!token) {
    const g = document.getElementById('authGuard');
    if (g) { g.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
    else window.location.href = 'frontend/pages/login.html';
    return;
  }
  let saved = JSON.parse(localStorage.getItem('pau_saved') || '[]');
  if (saved.find(s => s.id === p.id)) { alert('Already saved!'); return; }
  saved.push(p);
  localStorage.setItem('pau_saved', JSON.stringify(saved));
  alert('✅ Property saved to your dashboard!');
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
  window.location.href = `frontend/pages/properties.html?${params.toString()}`;
}

// ==========================================
// HAMBURGER MENU — FIXED FOR MOBILE
// ==========================================
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    navLinks.classList.toggle('open');
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  loadStats();
  loadFeaturedProperties();
  initHamburger();

  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }
});