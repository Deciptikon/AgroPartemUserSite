import { initTheme } from "./theme.js";
import { initAuth } from "./auth.js";
import { initNavbar } from "./navbar.js";

// Обработчик кнопки входа/регистрации
document.getElementById("authButton").addEventListener("click", function () {
  // Здесь можно реализовать логику входа/регистрации
  alert("Функционал входа/регистрации будет реализован позже");

  // Пример: открытие модального окна
  // const authModal = new bootstrap.Modal(document.getElementById('authModal'));
  // authModal.show();
});

document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  initAuth();
  initNavbar();
});
