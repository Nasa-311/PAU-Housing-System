// ==========================================
// PAU HOUSING — LIVE CONFIG
// Works both locally and on live server
// ==========================================
const API_BASE = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  ? 'http://localhost:3000/api'
  : 'https://pau-housing-system.onrender.com/api';