import { LOCAL_USER_DATA } from "./constants.js";

export async function generateSignature(urlString) {
  return "123456";

  const userData = localStorage.getItem(LOCAL_USER_DATA);
  secretKey = userData?.secret_key;

  if (!secretKey) return "null";
  // создаём подпись
}

function buildSortedQueryString(params) {
  // Сортируем параметры по ключу и собираем строку
  return Object.keys(params)
    .sort() // Сортировка параметров по алфавиту
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
}
