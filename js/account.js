import { initTheme } from "./theme.js";
import { initNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavbar();

  const logoutButton = document.getElementById("logoutButton");
  logoutButton.addEventListener("click", () => {
    console.log("LOGOUT --->");
    localStorage.removeItem("LOCAL_USER_DATA");
    // Переход после закрытия анимации
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 300);
  });

  // Специфичный для страницы код
  console.log('Страница "Аккаунт" загружена');

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      // Удаляем активный класс у всех кнопок и вкладок
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((tab) => tab.classList.remove("active"));

      // Добавляем активный класс текущей кнопке
      button.classList.add("active");

      // Показываем соответствующую вкладку
      const tabId = button.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });
});
