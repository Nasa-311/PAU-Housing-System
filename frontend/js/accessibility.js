// ==========================================
// PAU HOUSING — ACCESSIBILITY
// Silently applies saved preferences.
// DEFAULT = light mode (no dark unless user chose it)
// ==========================================
(function () {
  // Only apply dark mode if user explicitly set it to true
  const dark = localStorage.getItem('pau_darkmode') === 'true';
  const size = localStorage.getItem('pau_textsize') || 'medium';

  if (dark) {
    document.documentElement.classList.add('dark-mode');
  } else {
    // Make absolutely sure dark mode is off by default
    document.documentElement.classList.remove('dark-mode');
  }

  document.documentElement.setAttribute('data-size', size);
})();