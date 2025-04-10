import { initTheme } from "./theme.js";
import { initAuth } from "./auth.js";
import { initNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAuth();
  initNavbar();

  // Анимация карточек
  document.querySelectorAll(".card").forEach((card, index) => {
    card.style.transitionDelay = `${index * 100}ms`;
    card.classList.add("animate__animated", "animate__fadeInUp");
  });
});
