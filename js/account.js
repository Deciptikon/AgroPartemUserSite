import { initTheme } from "./theme.js";
import { initNavbar } from "./navbar.js";
import { userDataIsActual } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!userDataIsActual()) {
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 300);
  }
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
      if (tabId === "devices") initTabDevices();
      document.getElementById(tabId).classList.add("active");
    });
  });
});

async function initTabDevices() {
  console.log(`initTabDevices()`);
  const devicesTab = document.getElementById("devices");

  // Показываем загрузку
  devicesTab.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p>Загружаем список устройств...</p>
      </div>
    `;

  try {
    // Получаем данные с сервера
    //const response = await fetch('/api/devices');
    //const devicesData = await response.json();
    //const devicesData = [];
    //throw new Error("Сервер не отвечает!");
    /**/
    const devicesData = [
      { id: 1, name: "GPS-автопилот 1", serial: "12345-ABCDE-65913" },
      { id: 2, name: "Дачник X200", serial: "SXF99-5FGH1-YCSFG" },
      { id: 3, name: "Тестовый", serial: "5G3T8-HFC95-X9542" },
    ];

    // Если данные пусты
    if (!devicesData || devicesData.length === 0) {
      renderEmptyState();
      return;
    }

    renderDevices(devicesData);
  } catch (error) {
    renderErrorState(error);
  }
}

// Вынесем рендеринг в отдельную функцию
function renderDevices(devicesData) {
  const devicesTab = document.getElementById("devices");
  const template = document.getElementById("devicesTemplate");
  const itemTemplate = document.getElementById("deviceItemTemplate");

  const content = template.content.cloneNode(true);
  const devicesList = content.querySelector(".devices-list");

  devicesData.forEach((device) => {
    const item = itemTemplate.content.cloneNode(true);
    item.querySelector(".device-name").textContent = device.name;
    item.querySelector(".device-serial").textContent = device.serial;
    item.querySelector(".device-item").dataset.deviceId = device.id;
    item.querySelector(".device-item").onclick = () =>
      openDeviceModal(device.id);
    devicesList.appendChild(item);
  });

  // Кнопка добавления
  const addBtn = document.createElement("div");
  addBtn.className = "device-item p-3 text-primary";
  addBtn.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-plus-circle fs-4 me-2"></i>
        <span>Добавить устройство</span>
      </div>
    `;
  addBtn.onclick = openAddDeviceModal;
  devicesList.appendChild(addBtn);

  devicesTab.innerHTML = "";
  devicesTab.appendChild(content);
}

// Состояние при пустом списке
function renderEmptyState() {
  const devicesTab = document.getElementById("devices");
  const template = document.getElementById("devicesTemplate");

  const content = template.content.cloneNode(true);
  const devicesList = content.querySelector(".devices-list");

  const emptyMsg = document.createElement("p");
  emptyMsg.className = "mt-3 text-muted text-center";
  emptyMsg.textContent = "Устройства не найдены";
  devicesList.appendChild(emptyMsg);

  // Кнопка добавления
  const addBtn = document.createElement("div");
  addBtn.className = "device-item p-3 text-primary";
  addBtn.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-plus-circle fs-4 me-2"></i>
          <span>Добавить устройство</span>
        </div>
      `;
  addBtn.onclick = openAddDeviceModal;
  devicesList.appendChild(addBtn);

  devicesTab.innerHTML = "";
  devicesTab.appendChild(content);
}

// Состояние при ошибке
function renderErrorState(error) {
  const devicesTab = document.getElementById("devices");

  // Создаём основной контейнер ошибки
  const errorContainer = document.createElement("div");
  errorContainer.className = "alert alert-danger text-center";

  // Сообщение об ошибке
  const errorMessage = document.createElement("div");
  errorMessage.className = "mb-3"; // Отступ снизу
  errorMessage.innerHTML = `
      <i class="bi bi-exclamation-triangle-fill"></i>
      Ошибка загрузки: ${error.message}
    `;

  // Создаём кнопку в вашем стиле
  const retryBtn = document.createElement("button"); // Используем <button> вместо <div>
  retryBtn.className = "btn btn-sm btn-outline-danger";
  retryBtn.innerHTML = `
      <div class="d-flex align-items-center justify-content-center">
        <i class="bi bi-arrow-repeat me-2"></i>
        <span>Повторить</span>
      </div>
    `;
  retryBtn.onclick = initTabDevices;

  // Собираем всё вместе
  errorContainer.appendChild(errorMessage);
  errorContainer.appendChild(retryBtn);

  // Очищаем и вставляем
  devicesTab.innerHTML = "";
  devicesTab.appendChild(errorContainer);
}

function openDeviceModal(deviceId) {
  console.log("Открыть модалку устройства", deviceId);
}

function openAddDeviceModal() {
  console.log("Открыть модалку добавления");
}
