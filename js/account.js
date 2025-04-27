import { initTheme } from "./theme.js";
import { initNavbar } from "./navbar.js";
import { userDataIsActual } from "./auth.js";
import {
  getDeviceTracks,
  getListDevices,
  getTrack,
  sendBindCode,
  sendBindDevice,
  sendDeleteDevice,
} from "./transaction.js";
import { dateToStr, getUserData, strToDate } from "./utils.js";
import { LOCAL_USER_DATA, PERIOD_GPS_UPDATE } from "./constants.js";

// Глобальные переменные
const globalUser = getUserData(LOCAL_USER_DATA);

//линия трека на карте
let trackLine = null;
let lenTrack = 0;
let startMarker = null;
let endMarker = null;

let currentDeviceId = null;
let deviceModal = null;
let intervalId = null;

let serialNumber = null;

let globalTrack = null;
let globalDevice = null;

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

      if (tabId !== "gps") stopInterval();

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
  console.log(devicesData);
  const devicesTab = document.getElementById("devices");
  const template = document.getElementById("devicesTemplate");
  const itemTemplate = document.getElementById("deviceItemTemplate");

  const content = template.content.cloneNode(true);
  const devicesList = content.querySelector(".devices-list");

  let id = 0;
  for (let serial_key in devicesData) {
    const data = devicesData[serial_key];

    const device = {
      name: data.name,
      serial: serial_key,
      id: id,
    };
    id++;

    const item = itemTemplate.content.cloneNode(true);
    item.querySelector(".device-name").textContent = device.name;
    item.querySelector(".device-serial").textContent = device.serial;
    item.querySelector(".device-item").dataset.deviceId = device.id;
    item.querySelector(".device-item").onclick = () => openDeviceModal(device);
    devicesList.appendChild(item);
  }

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
  globalDevice = device;
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
    //console.log(tracks);

    const tracksList = document.getElementById("deviceTracksList");
    tracksList.innerHTML = "";
    const template = document.getElementById("trackItemTemplate");

    for (let track_key in tracks) {
      const track_data = tracks[track_key];
      const track = {
        track_key: track_key,
        track_lat: track_data.track_lat,
        track_lon: track_data.track_lon,
        timestamp: track_data.timestamp,
      };

      const item = template.content.cloneNode(true);
      const trackElement = item.querySelector("a"); // Получаем ссылку из шаблона

      // Заполняем данные
      item.querySelector(".track-date").textContent = strToDate(
        track.timestamp
      ).toLocaleString();
      item.querySelector(
        ".track-coords"
      ).textContent = `${track.track_lat}° N, ${track.track_lon}° E`;
      document.getElementById("deviceLastActiveInput").value = strToDate(
        track.timestamp
      ).toLocaleString();

      // Обработчик клика на весь элемент трека
      trackElement.addEventListener("click", (e) => {
        e.preventDefault(); // Отменяем стандартное поведение ссылки
        setTimeout(initMapWithTrack(track), 300);
      });

      tracksList.appendChild(item);
    }
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
  globalTrack = track;
  switchToGpsTab();
  initMap(track);
  deviceModal.hide();
  setTimeout(async function () {
    stopInterval();
    if (startMarker) {
      map.removeLayer(startMarker);
      startMarker = null;
    }
    if (endMarker) {
      map.removeLayer(endMarker);
      endMarker = null;
    }

    try {
      updateMap();
    } catch (e) {
      console.error(e);
    }
    startInterval(async function () {
      try {
        updateMap();
      } catch (e) {
        console.error(e);
      }
    }, PERIOD_GPS_UPDATE);
  }, 300);

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

// Функция инициализации карты
function initMap(track = null) {
  // Проверяем, существует ли уже карта
  if (map) {
    map.remove();
  }

  let point = [55.751244, 37.618423];
  if (track) point = [track.track_lat, track.track_lon];

  // Создаем карту с центром в Москве
  map = L.map("trackingMap").setView(point, 15);

  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
  }

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
  if (track) point = [track.track_lat, track.track_lon];

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

function openAddDeviceModal() {
  console.log("Открыть модалку добавления");
  showBindDeviceModal();
}

// Функция для показа модального окна
function showBindDeviceModal() {
  const modal = new bootstrap.Modal(document.getElementById("deviceBindModal"));
  renderSerialNumberComponent();
  modal.show();
}

// Рендер первого компонента (серийный номер)
function renderSerialNumberComponent() {
  const content = document.getElementById("bindModalContent");
  const template = document.getElementById("serialNumberComponent");
  content.innerHTML = "";
  content.appendChild(template.content.cloneNode(true));

  // Обработчик кнопки "Привязать"
  document
    .getElementById("bindDeviceBtn")
    .addEventListener("click", async () => {
      serialNumber = document.getElementById("serialNumberInput").value.trim();

      if (!serialNumber) {
        alert("Пожалуйста, введите серийный номер");
        return;
      }

      try {
        // Отправка серийного номера на сервер
        const result = await sendBindDevice(serialNumber);

        if (result) {
          // Если сервер подтвердил, переключаем на компонент с кодом
          renderVerificationCodeComponent();
        } else {
          alert(result.message || "Ошибка при отправке серийного номера");
        }
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при отправке данных");
      }
    });
}

// Рендер второго компонента (код подтверждения)
function renderVerificationCodeComponent() {
  const content = document.getElementById("bindModalContent");
  const template = document.getElementById("verificationCodeComponent");
  content.innerHTML = "";
  content.appendChild(template.content.cloneNode(true));

  // Обработчик кнопки "Отправить"
  document
    .getElementById("submitCodeBtn")
    .addEventListener("click", async () => {
      const verificationCode = document
        .getElementById("verificationCodeInput")
        .value.trim();

      if (!verificationCode) {
        alert("Пожалуйста, введите код подтверждения");
        return;
      }

      try {
        // Отправка кода подтверждения на сервер
        const result = await sendBindCode(serialNumber, verificationCode);

        if (result) {
          alert("Устройство успешно привязано!");
          // Закрываем модальное окно
          bootstrap.Modal.getInstance(
            document.getElementById("deviceBindModal")
          ).hide();

          initTabDevices(); // Обновляем список устройств
        } else {
          alert(result.message || "Неверный код подтверждения");
        }
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при отправке кода");
      }
    });
}

async function updateMap() {
  console.log("Обновляем состояние карты");
  const data = {
    user_name: globalUser.user_name,
    serial_key: globalDevice.serial,
    track_key: globalTrack.track_key,
    timestamp: dateToStr(new Date()),
    get_track_data: true,
  };

  const track = await getTrack(data);
  console.log(track);

  let point = [];
  let trackPoints = [];
  for (let time in track) {
    const p = track[time];
    point = [p.track_lat, p.track_lon];
    trackPoints.push(point);
  }

  if (!trackLine) {
    trackLine = L.polyline(trackPoints, { color: "blue", weight: 5 }).addTo(
      map
    );
  } else {
    // Обновляем существующую линию
    trackLine.setLatLngs(trackPoints);
  }

  updateMarkers(trackPoints);

  // Автоматически подгоняем карту под трек
  map.fitBounds(trackLine.getBounds());
}

function updateMarkers(trackPoints) {
  /*// Удаляем старые маркеры (если есть)
  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
  }*/

  // Добавляем новые
  if (trackPoints && trackPoints.length === 0) {
    if (startMarker) {
      map.removeLayer(startMarker);
      startMarker = null;
    }
    if (endMarker) {
      map.removeLayer(endMarker);
      endMarker = null;
    }
  }
  if (trackPoints.length === lenTrack) return;

  lenTrack = trackPoints.length;
  if (trackPoints.length === 1) {
    if (startMarker) map.removeLayer(startMarker);
    startMarker = L.marker(trackPoints[0]).addTo(map).bindPopup("Start");
  }
  if (trackPoints.length > 1) {
    if (!startMarker)
      startMarker = L.marker(trackPoints[0]).addTo(map).bindPopup("Start");

    if (endMarker) map.removeLayer(endMarker);
    endMarker = L.marker(trackPoints[trackPoints.length - 1])
      .addTo(map)
      .bindPopup("End");
  }
}

// Запуск интервальных вызовов
function startInterval(func, period) {
  if (!intervalId) {
    intervalId = setInterval(func, period);
  }
}

// Остановка интервальных вызовов
function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
