// ==========================================
// PAU HOUSING — ACCESSIBILITY
// Applies saved theme preferences globally.
// ==========================================
(function () {
  function applyTheme(mode) {
    const isDark = mode === 'dark';
    document.documentElement.classList.toggle('dark-mode', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('pau_darkmode', String(isDark));

    const toggle = document.getElementById('global-theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.innerHTML = isDark ? '☀️' : '🌙';
      toggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  function createThemeToggle() {
    if (document.getElementById('global-theme-toggle')) return;

    const button = document.createElement('button');
    button.id = 'global-theme-toggle';
    button.className = 'theme-toggle-pill';
    button.type = 'button';
    button.setAttribute('aria-label', 'Toggle light and dark mode');
    button.innerHTML = '🌙';
    button.addEventListener('click', () => {
      const nextMode = document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark';
      applyTheme(nextMode);
    });

    const navbar = document.querySelector('.navbar');
    if (navbar) {
      let actions = navbar.querySelector('.nav-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'nav-actions';
        if (navbar.querySelector('.nav-links')) {
          navbar.querySelector('.nav-links').parentNode.insertBefore(actions, navbar.querySelector('.nav-links'));
        } else {
          navbar.appendChild(actions);
        }
      }
      actions.appendChild(button);
      button.classList.add('theme-toggle-nav');
    } else {
      document.body.appendChild(button);
    }
  }

  const dark = localStorage.getItem('pau_darkmode') === 'true';
  const size = localStorage.getItem('pau_textsize') || 'medium';

  applyTheme(dark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-size', size);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createThemeToggle);
  } else {
    createThemeToggle();
  }

  window.applyTheme = applyTheme;
  window.toggleTheme = () => applyTheme(document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark');
})();