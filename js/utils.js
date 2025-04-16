export function getUserData(key) {
  const userDataString = localStorage.getItem(key);

  if (!userDataString) return null;

  try {
    return JSON.parse(userDataString);
  } catch (e) {
    console.error("Невалидные данные пользователя", e);
    return null;
  }
}

export function dateToStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // месяцы 0-11
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function strToDate(str) {
  const year = parseInt(str.substring(0, 4));
  const month = parseInt(str.substring(4, 6)) - 1;
  const day = parseInt(str.substring(6, 8));
  const hours = parseInt(str.substring(8, 10));
  const minutes = parseInt(str.substring(10, 12));
  const seconds = parseInt(str.substring(12, 14));
  return new Date(year, month, day, hours, minutes, seconds);
}

export function diffStrDates(dateStr1, dateStr2, unit = "seconds") {
  // Парсим строки дат в объекты Date
  const date1 = strToDate(dateStr1);
  const date2 = strToDate(dateStr2);

  // Разница в миллисекундах
  const diffMs = Math.abs(date2 - date1);

  // Конвертируем в нужные единицы
  switch (unit.toLowerCase()) {
    case "seconds":
      return Math.floor(diffMs / 1000);
    case "minutes":
      return Math.floor(diffMs / (1000 * 60));
    case "hours":
      return Math.floor(diffMs / (1000 * 60 * 60));
    case "days":
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    default:
      throw new Error(
        "Неподдерживаемая единица измерения. Используйте: seconds, minutes, hours или days"
      );
  }
}
