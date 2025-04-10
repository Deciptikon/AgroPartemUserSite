import { initTheme } from "./theme.js";
import { initAuth } from "./auth.js";
import { initNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAuth();
  initNavbar();

  // Специфичный для страницы код
  console.log('Страница "О нас" загружена');
});
