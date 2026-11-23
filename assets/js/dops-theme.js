/**
 * DOPS — Theme Controller (Dark/Light Mode Engine)
 * Manages instant theme switching with localStorage persistence.
 */
(function() {
  'use strict';

  var THEME_KEY = 'dops-theme';

  function getPreferredTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Default to dark as requested in DOPS specs
    return 'dark';
  }

  function applyTheme(theme) {
    var html = document.documentElement;
    if (theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
    updateToggleIcons(theme);
  }

  function updateToggleIcons(theme) {
    var icons = document.querySelectorAll('.theme-toggle-icon, [data-theme-icon]');
    icons.forEach(function(icon) {
      if (theme === 'light') {
        icon.textContent = 'light_mode';
      } else {
        icon.textContent = 'dark_mode';
      }
    });
  }

  // Toggle function exposed globally
  window.dopsToggleTheme = function() {
    var current = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  };

  // Immediate execution before body renders to eliminate flash of light/dark (FOUC)
  var initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  document.addEventListener('DOMContentLoaded', function() {
    updateToggleIcons(initialTheme);
    var toggleButtons = document.querySelectorAll('.theme-toggle-btn, [data-theme-toggle]');
    toggleButtons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        window.dopsToggleTheme();
      });
    });
  });
})();
