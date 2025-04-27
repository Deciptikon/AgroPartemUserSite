import { sendAuth } from "./transaction.js";
import { AUTH_URL, LOCAL_USER_DATA, MAX_TIME_FOR_TOKEN } from "./constants.js";
import { dateToStr, diffStrDates, getUserData } from "./utils.js";

export function initAuth() {
  const authModal = new bootstrap.Modal("#authModal");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const authButton = document.getElementById("authButton");
  const authForm = document.getElementById("authForm");

  const accountModal = new bootstrap.Modal("#accountModal");
  const accountName = document.getElementById("accountName");
  const accountButton = document.getElementById("accountButton");
  const optionsButton = document.getElementById("optionsButton");
  const logoutButton = document.getElementById("logoutButton");

  if (userDataIsActual()) {
    const userData = getUserData(LOCAL_USER_DATA);
    authButton.innerText = "Мой аккаунт";
    if (userData) accountName.textContent = userData.user_nikname;
  } else {
    authButton.innerText = "Вход/Регистрация";
    accountName.textContent = "Мой аккаунт";
    if (accountModal) accountModal.hide();
  }

  accountButton.addEventListener("click", () => {
    // Закрываем модальное окно (пример для Bootstrap)
    if (accountModal) accountModal.hide();

    // Переход после закрытия анимации
    setTimeout(() => {
      window.location.href = "./account.html";
    }, 300);
  });

  optionsButton.addEventListener("click", () => {
    console.log("OPTIONS --->");
  });

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("LOCAL_USER_DATA");

    authButton.innerText = "Вход/Регистрация";
    accountName.textContent = "Мой аккаунт";
    if (accountModal) accountModal.hide();
  });

  // Открытие модалки по кнопке
  authButton.addEventListener("click", () => {
    if (userDataIsActual()) {
      accountModal.show();
    } else {
      authModal.show();
    }
  });

  // Обработка формы
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await sendAuth(username, password);

      console.log(response);

      if (response && response?.data && "secret_key" in response?.data) {
        let userData = response.data;
        userData.timestamp = dateToStr(new Date());
        localStorage.setItem(LOCAL_USER_DATA, JSON.stringify(userData));
        authButton.innerText = "Мой аккаунт";
        accountName.textContent = userData.user_nikname;
      }

      authModal.hide();

      //alert(`Добро пожаловать, ${username}! Токен: ${response.token}`);
    } catch (error) {
      console.error("Ошибка:", error);
      //alert(error.message);
    }
  });

  togglePassword.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Меняем иконку
    const icon = togglePassword.querySelector("i");
    icon.classList.toggle("bi-eye");
    icon.classList.toggle("bi-eye-slash");
  });
}

export function userDataIsActual() {
  const userData = getUserData(LOCAL_USER_DATA);
  const now = dateToStr(new Date());

  if (
    userData &&
    userData?.timestamp &&
    diffStrDates(now, userData.timestamp) < MAX_TIME_FOR_TOKEN
  ) {
    return true;
  }

  return false;
}
