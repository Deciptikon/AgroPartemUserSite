import { generateSignature } from "./crypto-utils.js";
import { dateToStr, getUserData } from "./utils.js";
import {
  DELETE_DEVICE_URL,
  GET_LIST_DEVICES_URL,
  GET_LIST_TRACKS_URL,
  LOCAL_USER_DATA,
} from "./constants.js";
import { userDataIsActual } from "./auth.js";

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

export async function sendDeleteDevice(device) {
  // получение аккаунта из локального хранилища
  const userData = getUserData(LOCAL_USER_DATA);

  if (userDataIsActual()) {
    // формируем данные
    const data = {
      user_name: userData.user_name,
      timestamp: dateToStr(new Date()),
      serial: device.serial,
      delete_device: true,
    };

    // запрос к БД из аккаунта
    const result = await sendDataToServer(DELETE_DEVICE_URL, data, true);

    return result.code === 200 ? true : false;
  } else {
    return null;
  }
}

export async function getListDevices() {
  /*
  // получение аккаунта из локального хранилища
  const userData = getUserData(LOCAL_USER_DATA);

  if (userDataIsActual()) {
    // формируем данные
    const data = {
      user_name: userData.user_name,
      timestamp: dateToStr(new Date()),
      get_list_devices: true,
    };

    // запрос к БД из аккаунта
    const listDevices = await sendDataToServer(
      GET_LIST_DEVICES_URL,
      data,
      true
    );

    return listDevices;
  } else {
    return null;
  }*/

  return [
    { id: 1, name: "GPS-автопилот 1", serial: "12345-ABCDE-65913" },
    { id: 2, name: "Дачник X200", serial: "SXF99-5FGH1-YCSFG" },
    { id: 3, name: "Тестовый", serial: "5G3T8-HFC95-X9542" },
  ];
}

export async function getDeviceTracks(device) {
  /*
  // получение аккаунта из локального хранилища
  const userData = getUserData(LOCAL_USER_DATA);

  if (userDataIsActual()) {
    // формируем данные
    const data = {
      user_name: userData.user_name,
      timestamp: dateToStr(new Date()),
      serial: device.serial,
      get_list_tracks: true,
    };

    // запрос к БД из аккаунта
    const listTracks = await sendDataToServer(GET_LIST_TRACKS_URL, data, true);

    return listTracks;
  } else {
    return null;
  }*/

  let arr = [];
  for (let i = 0; i < 5; i++) {
    arr.push({
      lat: (55.7558 + Math.random() * 10.1).toFixed(7),
      lng: (37.6173 + Math.random() * 10.1).toFixed(7),
      timestamp: new Date(Date.now() - i * 3600000),
    });
  }

  return arr;
}
