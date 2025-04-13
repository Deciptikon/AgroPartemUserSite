export function initNavbar() {
  // Установка активного пункта меню
  setActiveNavItem();

  // Мобильное меню
  initMobileMenu();

  // Дополнительные обработчики
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", smoothScroll);
  });
}

/**
 * Устанавливает активный пункт меню на основе текущего URL
 */
function setActiveNavItem() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navItems = document.querySelectorAll(".nav-link");

  navItems.forEach((item) => {
    const itemHref = item.getAttribute("href");
    if (itemHref) {
      const itemPath = itemHref.split("/").pop();

      // Сравниваем без учета регистра и параметров
      if (currentPath.toLowerCase() === itemPath.toLowerCase()) {
        item.classList.add("active");
        item.setAttribute("aria-current", "page");
      } else {
        item.classList.remove("active");
        item.removeAttribute("aria-current");
      }
    }
  });
}

/**
 * Инициализация мобильного меню
 */
function initMobileMenu() {
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.querySelector(".navbar-collapse");

  navbarToggler.addEventListener("click", () => {
    const isExpanded = navbarToggler.getAttribute("aria-expanded") === "true";
    navbarToggler.setAttribute("aria-expanded", !isExpanded);
    navbarCollapse.classList.toggle("show");
  });
}

/**
 * Плавная прокрутка для якорных ссылок
 */
function smoothScroll(e) {
  const targetId = this.getAttribute("href");
  if (targetId.startsWith("#")) {
    e.preventDefault();
    document.querySelector(targetId)?.scrollIntoView({
      behavior: "smooth",
    });
  }
}

/**
 * Обновляет навигацию при изменении размера окна
 */
function handleResize() {
  const navbarCollapse = document.querySelector(".navbar-collapse");
  if (window.innerWidth >= 992) {
    navbarCollapse.classList.remove("show");
  }
}

// Слушатель изменения размера окна
window.addEventListener("resize", handleResize);
