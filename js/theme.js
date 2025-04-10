export function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const htmlElement = document.documentElement;

  // Проверяем сохранённую тему или предпочтения системы
  const savedTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  // Применяем тему при загрузке
  setTheme(savedTheme);

  // Обработчик клика
  themeToggle.addEventListener("click", () => {
    const newTheme =
      htmlElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    console.log("Тема установлена:", localStorage.getItem("theme"));
  });

  function setTheme(theme) {
    htmlElement.setAttribute("data-bs-theme", theme);
    if (theme === "light") {
      themeIcon.classList.remove("bi-moon");
      themeIcon.classList.add("bi-sun");
    }
    if (theme === "dark") {
      themeIcon.classList.remove("bi-sun");
      themeIcon.classList.add("bi-moon");
    }
  }
}
