// ==========================================
// PAU HOUSING SYSTEM — MAIN JAVASCRIPT
// Connects frontend to Node.js backend API
// ==========================================

const API_BASE = 'http://localhost:3000/api';

// Sample images to cycle through for property cards
const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=70',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=70',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&q=70',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=70',
];

// ==========================================
// LOAD STATS (homepage counters)
// ==========================================
async function loadStats() {
  try {
    const [propsRes, landRes] = await Promise.all([
      fetch(`${API_BASE}/properties`),
      fetch(`${API_BASE}/landlords`)
    ]);
    const props     = await propsRes.json();
    const landlords = await landRes.json();

    const countEl = document.getElementById('countProperties');
    const landEl  = document.getElementById('countLandlords');
    if (countEl) countEl.textContent = props.length;
    if (landEl)  landEl.textContent  = landlords.length;
  } catch (err) {
    console.log('Backend not connected yet — showing default stats.');
  }
}

// ==========================================
// LOAD FEATURED PROPERTIES (homepage grid)
// ==========================================
async function loadFeaturedProperties() {
  const grid = document.getElementById('featuredProperties');
  if (!grid) return;

  try {
    const res        = await fetch(`${API_BASE}/properties?limit=6`);
    const properties = await res.json();

    if (properties.length === 0) {
      grid.innerHTML = '<p class="loading-text">No properties listed yet.</p>';
      return;
    }
    grid.innerHTML = properties.map((p, i) => createPropertyCard(p, i)).join('');
  } catch (err) {
    // Show sample cards when backend is not running
    grid.innerHTML = getSampleCards();
  }
}

// ==========================================
// BUILD A SINGLE PROPERTY CARD
// ==========================================
function createPropertyCard(p, index = 0) {
  const img = PROPERTY_IMAGES[index % PROPERTY_IMAGES.length];
  return `
    <div class="property-card" onclick="window.location.href='property-detail.html?id=${p.id}'">
      <div class="property-img-wrap">
        <img src="${img}" alt="${p.name}"/>
        <button class="save-btn" title="Save Property"
          onclick="event.stopPropagation(); saveProperty(${JSON.stringify(p).replace(/"/g, '&quot;')})">♡</button>
      </div>
      <div class="property-body">
        <span class="property-badge">${p.room_type || 'Room'}</span>
        <p class="property-name">${p.name}</p>
        <p class="property-meta">📍 ${p.address} &nbsp;|&nbsp; 🚶 ${p.distance_from_school || '?'}km from PAU</p>
        <div class="property-footer">
          <div class="property-price">₦${Number(p.rent).toLocaleString()} <span>/yr</span></div>
          <a class="btn-details" href="property-detail.html?id=${p.id}">View Details</a>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// SAMPLE CARDS (shown before backend runs)
// ==========================================
function getSampleCards() {
  const samples = [
    { id:1, name:'Sunrise Lodge',    address:'Beside PAU Gate, Ibeju-Lekki', rent:350000, room_type:'Self Contain', distance_from_school:0.3 },
    { id:2, name:'Grace Apartment',  address:'Abraham Adesanya Estate, Ajah', rent:280000, room_type:'Shared Room',  distance_from_school:0.8 },
    { id:3, name:'Royal Chambers',   address:'Bogije, Ibeju-Lekki',           rent:480000, room_type:'Flat',         distance_from_school:1.2 },
    { id:4, name:'Palm View Hostel', address:'Lakowe Estate',                  rent:220000, room_type:'Single Room',  distance_from_school:2.0 },
    { id:5, name:'Lekki Gardens',    address:'Ibeju-Lekki',                    rent:400000, room_type:'Self Contain', distance_from_school:0.6 },
    { id:6, name:'Blue Crest Rooms', address:'Ajah, Lagos',                    rent:310000, room_type:'Shared Room',  distance_from_school:1.5 },
  ];
  return samples.map((p, i) => createPropertyCard(p, i)).join('');
}

// ==========================================
// SAVE A PROPERTY TO DASHBOARD
// ==========================================
function saveProperty(p) {
  // Check if user is logged in
  const token = localStorage.getItem('pau_token');
  if (!token) {
    alert('Please log in first to save properties.');
    window.location.href = 'login.html';
    return;
  }

  let saved = JSON.parse(localStorage.getItem('pau_saved') || '[]');

  // Check if already saved
  if (saved.find(s => s.id === p.id)) {
    alert('You have already saved this property!');
    return;
  }

  saved.push(p);
  localStorage.setItem('pau_saved', JSON.stringify(saved));
  alert('✅ Property saved to your Student Dashboard!');
}

// ==========================================
// SEARCH FUNCTION (redirects to properties page)
// ==========================================
function searchProperties() {
  const name    = document.getElementById('searchName')?.value || '';
  const type    = document.getElementById('roomType')?.value   || '';
  const maxRent = document.getElementById('maxRent')?.value    || '';

  const params = new URLSearchParams();
  if (name)    params.append('name', name);
  if (type)    params.append('room_type', type);
  if (maxRent) params.append('max_rent', maxRent);

  window.location.href = `properties.html?${params.toString()}`;
}

// ==========================================
// NAV: HIGHLIGHT ACTIVE LINK
// ==========================================
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
}

// ==========================================
// CHECK LOGIN STATUS (show/hide nav items)
// ==========================================
function checkLoginStatus() {
  const user  = JSON.parse(localStorage.getItem('pau_user') || '{}');
  const token = localStorage.getItem('pau_token');

  if (token && user.name) {
    // User is logged in — update nav
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      // Remove login/signup buttons
      const loginBtn  = navLinks.querySelector('a[href="login.html"]');
      const signupBtn = navLinks.querySelector('a[href="register.html"]');
      if (loginBtn)  loginBtn.closest('li') && loginBtn.closest('li').remove();
      if (signupBtn) signupBtn.closest('li') && signupBtn.closest('li').remove();

      // Add dashboard link and user name
      const dashUrl = user.role === 'landlord' ? 'owner-dashboard.html' : 'student-dashboard.html';
      const li1 = document.createElement('li');
      li1.innerHTML = `<a href="${dashUrl}" class="btn-nav">👤 ${user.name.split(' ')[0]}</a>`;
      navLinks.appendChild(li1);
    }
  }
}

// ==========================================
// INITIALIZE — runs when page loads
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Load homepage content
  loadStats();
  loadFeaturedProperties();

  // Nav helpers
  setActiveNavLink();
  checkLoginStatus();

  // Hamburger menu toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Navbar scroll effect (makes it solid on scroll)
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }
});