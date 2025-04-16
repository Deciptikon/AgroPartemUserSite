import { generateSignature } from "./crypto-utils.js";
import { dateToStr, getUserData } from "./utils.js";
import { GET_LIST_DEVICES_URL, LOCAL_USER_DATA } from "./constants.js";

export async function sendDataToServer(url, data, signed = null) {
  const baseUrl = new URL(url);
  for (let key in data) {
    baseUrl.searchParams.append(key, data[key]);
  }
  if (signed) {
    const signature = await generateSignature(baseUrl.toString());
    baseUrl.searchParams.append("sig", signature);
  }
  const finalUrl = baseUrl.toString();
  console.log(finalUrl);
  const response = await fetch(finalUrl);
  //console.log(response);
  return response.json();
}

export async function getListDevices() {
  /*
  // получение аккаунта из локального хранилища
  const userData = getUserData(LOCAL_USER_DATA);

  // формируем данные
  const data = {
    user_name: userData.user_name,
    timestamp: dateToStr(new Date()),
    get_list_devices: true,
  };

  // запрос к БД из аккаунта
  const listDevices = await sendDataToServer(GET_LIST_DEVICES_URL, data, true);
  
  return listDevices;
  */

  return [
    { id: 1, name: "GPS-автопилот 1", serial: "12345-ABCDE-65913" },
    { id: 2, name: "Дачник X200", serial: "SXF99-5FGH1-YCSFG" },
    { id: 3, name: "Тестовый", serial: "5G3T8-HFC95-X9542" },
  ];
}
