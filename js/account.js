import { initTheme } from "./theme.js";
import { initNavbar } from "./navbar.js";
import { userDataIsActual } from "./auth.js";
import {
  getDeviceTracks,
  getListDevices,
  sendDeleteDevice,
} from "./transaction.js";

// Глобальные переменные
let currentDeviceId = null;
let deviceModal = null;

let tracksData = []; // Здесь будут храниться треки устройства
let mapInitialized = false;
let map; // Глобальная переменная для хранения карты
let markers = []; // Массив для маркеров

document.addEventListener("DOMContentLoaded", () => {
  if (!userDataIsActual()) {
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 300);
  }
  initTheme();
  initNavbar();

  // Вставляем модальные окна в DOM

  // Модальное окно редактирования устройств
  const deviceModalTemplate = document.getElementById("deviceModalTemplate");
  document.body.appendChild(deviceModalTemplate.content.cloneNode(true));
  deviceModal = new bootstrap.Modal("#deviceModal");

  // Модальное окно просмотра треков
  //const mapModalTemplate = document.getElementById("mapModalTemplate");
  //document.body.appendChild(mapModalTemplate.content.cloneNode(true));
  //mapModal =

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

      if (tabId === "devices") initTabDevices();
      if (tabId === "gps") initMap();
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
    const devicesData = await getListDevices();

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
    item.querySelector(".device-item").onclick = () => openDeviceModal(device);
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

/*
function openDeviceModal(deviceId) {
  currentDeviceId = deviceId;
  modal.show(); /////////////////////////////////
  // Загрузка данных устройства
  fetch(`/api/devices/${deviceId}`)
    .then((response) => response.json())
    .then((device) => {
      // Заполняем форму
      document.getElementById("deviceNameInput").value = device.name;
      document.getElementById("deviceSerialInput").value = device.serial;
      document.getElementById("deviceLastActiveInput").value =
        device.lastActive || "Неизвестно";

      // Загружаем треки
      loadDeviceTracks(deviceId);

      // Настройка кнопки удаления
      document.getElementById("deleteDeviceBtn").onclick = () => {
        if (confirm("Вы уверены, что хотите удалить это устройство?")) {
          deleteDevice(deviceId);
        }
      };

      // Показываем модальное окно
      modal.show();
    })
    .catch((error) => {
      console.error("Ошибка загрузки устройства:", error);
      alert("Не удалось загрузить данные устройства");
    });
}*/

async function openDeviceModal(device) {
  document.getElementById("deviceNameInput").value = device.name;
  document.getElementById("deviceSerialInput").value = device.serial;
  document.getElementById("deviceLastActiveInput").value = device?.lastActive;

  const bttDeleteDevice = document.getElementById("deleteDeviceBtn");
  bttDeleteDevice.addEventListener("click", function () {
    const isConfirmed = confirm("Вы уверены, что хотите удалить устройство?");
    if (isConfirmed) {
      deleteDevice(device);
    }
  });

  try {
    // Получаем данные с сервера
    const tracks = await getDeviceTracks(device);
    console.log(tracks);

    const tracksList = document.getElementById("deviceTracksList");
    tracksList.innerHTML = "";
    const template = document.getElementById("trackItemTemplate");

    tracks.forEach((track) => {
      const item = template.content.cloneNode(true);
      const trackElement = item.querySelector("a"); // Получаем ссылку из шаблона

      // Заполняем данные
      item.querySelector(".track-date").textContent =
        track.timestamp.toLocaleString();
      item.querySelector(
        ".track-coords"
      ).textContent = `${track.lat}° N, ${track.lng}° E`;

      // Обработчик клика на весь элемент трека
      trackElement.addEventListener("click", (e) => {
        e.preventDefault(); // Отменяем стандартное поведение ссылки
        setTimeout(initMapWithTrack(track), 300);
      });

      tracksList.appendChild(item);
    });
  } catch (error) {
    //
  }

  deviceModal.show();
}

function switchToGpsTab() {
  // Убираем активный класс у всех кнопок вкладок
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.classList.remove("active");
  });

  // Убираем активный класс у всех контентов вкладок
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => {
    content.classList.remove("active");
  });

  // Добавляем активный класс к нужной кнопке и контенту
  const gpsButton = document.querySelector('.tab-button[data-tab="gps"]');
  const gpsContent = document.getElementById("gps");

  if (gpsButton && gpsContent) {
    gpsButton.classList.add("active");
    gpsContent.classList.add("active");
  }
}

function initMapWithTrack(track) {
  switchToGpsTab();
  initMap(track);
  deviceModal.hide();

  console.log("Открытие карты с треком:", track);
}

// Удаление устройства
async function deleteDevice(device) {
  console.log("УДАЛЯЕМ");
  //return null;
  if (await sendDeleteDevice(device)) {
    deviceModal.hide();
    initTabDevices(); // Обновляем список устройств
    alert("Устройство успешно удалено");
  } else {
    console.error("Ошибка удаления:", error);
    alert("Не удалось удалить устройство");
  }
}

// Сохранение изменений
document.getElementById("deviceForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const updatedData = {
    name: document.getElementById("deviceNameInput").value,
    // Другие редактируемые поля при необходимости
  };

  fetch(`/api/devices/${currentDeviceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  })
    .then(() => {
      deviceModal.hide();
      initTabDevices(); // Обновляем список устройств
    })
    .catch((error) => {
      console.error("Ошибка сохранения:", error);
      alert("Не удалось сохранить изменения");
    });
});

function openAddDeviceModal() {
  console.log("Открыть модалку добавления");
}

// Функция инициализации карты
function initMap(track = null) {
  // Проверяем, существует ли уже карта
  if (map) {
    map.remove();
  }

  let point = [55.751244, 37.618423];
  if (track) point = [track.lat, track.lng];

  // Создаем карту с центром в Москве
  map = L.map("trackingMap").setView(point, 13);

  // Добавляем слой OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Добавляем кнопки управления
  addMapControls(track);
}

// Добавляем элементы управления
function addMapControls(track = null) {
  let point = [55.751244, 37.618423];
  if (track) point = [track.lat, track.lng];

  // Кнопка центрирования
  document.getElementById("centerMapBtn").addEventListener("click", () => {
    map.setView(point, 13);
  });

  // Кнопка добавления маркера
  document.getElementById("addMarkerBtn").addEventListener("click", () => {
    const center = map.getCenter();
    const marker = L.marker([center.lat, center.lng])
      .addTo(map)
      .bindPopup(
        `Тестовый маркер<br>Широта: ${center.lat.toFixed(
          4
        )}<br>Долгота: ${center.lng.toFixed(4)}`
      );
    markers.push(marker);
  });
}
