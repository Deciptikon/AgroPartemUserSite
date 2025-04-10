import { initTheme } from "./theme.js";
import { initAuth } from "./auth.js";
import { initNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAuth();
  initNavbar();

  // Обработка формы
  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Сообщение отправлено!");
    e.target.reset();
  });
});
