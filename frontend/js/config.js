// PAU HOUSING — API CONFIG
// Sets the correct backend URL automatically
// Use window.API_BASE in all pages to avoid duplicate declaration errors

window.API_BASE = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  ? 'http://localhost:3000/api'
  : 'https://pau-housing-system.onrender.com/api';

// Shortcut — also available as API_BASE without window prefix
var API_BASE = window.API_BASE;