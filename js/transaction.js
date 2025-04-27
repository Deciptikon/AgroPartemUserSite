import { generateSignature } from "./crypto-utils.js";
import { dateToStr, getUserData } from "./utils.js";
import {
  LOCAL_USER_DATA,
  AUTH_URL,
  DELETE_DEVICE_URL,
  BIND_DEVICE_URL,
  GET_LIST_DEVICES_URL,
  GET_LIST_TRACKS_URL,
  CHECK_BIND_KEY_URL,
  GET_TRACK_URL,
} from "./constants.js";
import { userDataIsActual } from "./auth.js";

export async function sendDataToServer(url, data, signed = null) {
  let URL = url;
  let QS = data ? buildSortedQueryString(data) : "";

  if (signed) {
    const signature = await generateSignature(QS);
    QS = `${QS}&sign=${signature}`;
  }
  const finalUrl = `${URL}?${QS}`;
  console.log(finalUrl);
  const response = await fetch(finalUrl);
  //console.log(response);
  return response.json();
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

export async function sendAuth(userName, userPassword) {
  //return true;

  const data = {
    user_name: userName,
    user_password: userPassword,
    timestamp: dateToStr(new Date()),
  };

  // запрос к БД из аккаунта
  const result = await sendDataToServer(AUTH_URL, data, true);

  return result;
}

export async function sendDeleteDevice(device) {
  // получение аккаунта из локального хранилища
  const userData = getUserData(LOCAL_USER_DATA);

  if (userDataIsActual()) {
    // формируем данные
    const data = {
      user_name: userData.user_name,
      timestamp: dateToStr(new Date()),
      serial_key: device.serial,
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
  /**/
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
    const response = await sendDataToServer(GET_LIST_DEVICES_URL, data, true);

    console.log(response);

    return response?.data?.list_devices;
  } else {
    return null;
  }
}

export async function getDeviceTracks(device) {
  /**/
  // получение аккаунта из локального хранилища
  const userData = getUserData(LOCAL_USER_DATA);

  if (userDataIsActual()) {
    // формируем данные
    const data = {
      user_name: userData.user_name,
      timestamp: dateToStr(new Date()),
      serial_key: device.serial,
      get_list_tracks: true,
    };

    // запрос к БД из аккаунта
    const response = await sendDataToServer(GET_LIST_TRACKS_URL, data, true);
    console.log(response);
    const lt = response?.data?.list_tracks;
    console.log(lt);
    const listTracks = JSON.parse(lt.replace(/'/g, '"'));
    console.log(listTracks);
    return listTracks;
  } else {
    return null;
  }
}

export async function getTrack(data) {
  // получение аккаунта из локального хранилища

  if (userDataIsActual()) {
    // запрос к БД из аккаунта
    const response = await sendDataToServer(GET_TRACK_URL, data, true);
    //console.log(response);
    const td = response?.data?.gps_data;
    //console.log(td);
    const trackData = JSON.parse(td.replace(/'/g, '"'));
    //console.log(trackData);
    return trackData;
  } else {
    return null;
  }
}

export async function sendBindDevice(serial) {
  //return true;
  // получение аккаунта из локального хранилища
  const userData = getUserData(LOCAL_USER_DATA);
  print(userData);

  if (userDataIsActual()) {
    // формируем данные
    const data = {
      user_name: userData.user_name,
      timestamp: dateToStr(new Date()),
      serial_key: serial,
      bind_device: true,
    };

    // запрос к БД из аккаунта
    const result = await sendDataToServer(BIND_DEVICE_URL, data, true);

    return result.code === 200 ? true : false;
  } else {
    return null;
  }
}

export async function sendBindCode(serialNumber, bindCode) {
  //return true;
  // получение аккаунта из локального хранилища
  const userData = getUserData(LOCAL_USER_DATA);

  if (userDataIsActual()) {
    // формируем данные
    const data = {
      user_name: userData.user_name,
      timestamp: dateToStr(new Date()),
      serial_key: serialNumber,
      bind_key: bindCode,
      check_bind_key: true,
    };

    // запрос к БД из аккаунта
    const result = await sendDataToServer(CHECK_BIND_KEY_URL, data, true);

    return result.code === 200 ? true : false;
  } else {
    return null;
  }
}
