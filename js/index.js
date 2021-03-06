//лисенер события изменения опции селектора
document.addEventListener("DOMContentLoaded", changeOption());

//убрать/добавить прелоадер
function setPreloaderStatus(obj) {
  let preloader = document.getElementById("preloader");
  if (obj.option == "REMOVE") {
    preloader.style.cssText = "display: none;";
  }
  if (obj.option == "ADD") {
    preloader.style.cssText = "display: block;";
  }
}

//реакция на событие изменения опции селектора, вызов функции изменения DOM
function changeOption() {
  let select_elem = document.getElementById("form_select");
  select_elem.onchange = function () {
    if (select_elem.value == "option1") {
      change_DOM({ type: "first_option" });
    }
    if (select_elem.value == "option2") {
      change_DOM({ type: "second_option" });
    }
    if (select_elem.value == "option3") {
      change_DOM({ type: "third_option" });
    }
  };
}

//изменение DOM при смене опции селектора(form_selector)
function change_DOM(option) {
  if (option.type == "first_option") {
    document.getElementById("id").removeAttribute("disabled");
    document.getElementById("count").setAttribute("disabled", "disabled");
    document.getElementById("name").setAttribute("disabled", "disabled");
    document.getElementById("input_about").innerHTML = "Номер от 1.";
  }
  if (option.type == "second_option") {
    document.getElementById("id").removeAttribute("disabled");
    document.getElementById("count").removeAttribute("disabled");
    document.getElementById("name").setAttribute("disabled", "disabled");
    document.getElementById("input_about").innerHTML = "Номер от 1 и диапазон.";
  }
  if (option.type == "third_option") {
    document.getElementById("id").setAttribute("disabled", "disabled");
    document.getElementById("count").setAttribute("disabled", "disabled");
    document.getElementById("name").removeAttribute("disabled");
    document.getElementById("input_about").innerHTML =
      "Имя по английски в любом регистре.";
  }
}
//удаляем предидущие результаты
function clear_result_box() {
  let element = document.getElementById("result");
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

//первичная обработка события кнопки, запроса данных
async function request() {
  clear_result_box();

  let option = document.getElementById("form_select").value;
  let id = document.getElementById("id").value;
  let count = document.getElementById("count").value;
  let name = document.getElementById("name").value.toLowerCase();

  if (option == "option1") {
    setPreloaderStatus({ option: "ADD" });
    let result = await fetch_request({
      request: "GETONEID",
      id: id,
      count: count,
    });
    createDOM(result);
    setPreloaderStatus({ option: "REMOVE" });
  }

  if (option == "option2") {
    setPreloaderStatus({ option: "ADD" });
    let results = await fetch_request({
      request: "GETSOMEID",
      id: id - 1,
      count: count,
    });
    results = results["results"];
    let urls = [];
    for (let i = 0; i < results.length; i++) {
      urls.push(results[i]["url"]);
    }
    let result = await fetch_request({
      request: "GETBYURL",
      urls: urls,
    });
    for (let i = 0; i < result.length; i++) {
      createDOM(result[i]);
    }
    setPreloaderStatus({ option: "REMOVE" });
  }

  if (option == "option3") {
    setPreloaderStatus({ option: "ADD" });
    let result = await fetch_request({
      request: "GETBYNAME",
      name: name,
    });
    createDOM(result);
    setPreloaderStatus({ option: "REMOVE" });
  }
}

//обработка и вывод ошибки
function errors_catching(err) {
  let error_code_elem = document.getElementById("error_code");
  if (err == 404) {
    error_code_elem.innerHTML = "id/имя не найден";
  } else error_code_elem.innerHTML = err;
  setPreloaderStatus({ option: "REMOVE" });
  error.style.cssText = "display: block;";
  setTimeout(() => {
    error.style.cssText = "display: none;";
  }, 2000);
}

//fetch запросы
async function fetch_request(obj) {
  switch (obj.request) {
    case "GETONEID": {
      let result = await fetch(`https://pokeapi.co/api/v2/pokemon/${obj.id}`)
        .then((response) => {
          if (response.status == 404) {
            throw response.status;
          }
          return response.json();
        })
        .catch((error) => errors_catching(error))
        .then((data) => {
          return data;
        });
      return result;
    }
    case "GETSOMEID": {
      let result = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${obj.count}&offset=${obj.id}`
      )
        .then((response) => response.json())
        .catch((error) => errors_catching(error))
        .then((data) => {
          return data;
        });
      return result;
    }

    case "GETBYURL": {
      let requests = obj.urls.map((url) => fetch(url));
      let result = Promise.all(requests)
        .then((responses) => {
          return responses;
        })
        .catch((error) => errors_catching(error))
        .then((responses) => Promise.all(responses.map((r) => r.json())))
        .then((data) => {
          return data;
        });

      return result;
    }

    case "GETBYNAME": {
      let result = await fetch(`https://pokeapi.co/api/v2/pokemon/${obj.name}`)
        .then((response) => {
          if (response.status == 404) {
            throw response.status;
          }
          return response.json();
        })
        .catch((error) => errors_catching(error))
        .then((data) => {
          return data;
        });
      return result;
    }
  }
}

//создание и вовзрат td элементов
function createTd(name, data) {
  let td_1 = document.createElement("td");
  let td_2 = document.createElement("td");
  td_1.innerHTML = name;
  td_2.innerHTML = data;
  return [td_1, td_2];
}

//построение DOM карточек
function createDOM(data) {
  let result_div = document.getElementById("result");

  let root_elem, image, id, table, name, height, weight, td_1, td_2;

  root_elem = document.createElement("div");
  root_elem.className = "card";

  table = document.createElement("table");
  table.className = "card_table";

  name = document.createElement("h2");
  name.className = "card_name";
  name.innerHTML =
    data["species"]["name"][0].toUpperCase() + data["species"]["name"].slice(1);

  id = document.createElement("tr");
  id.className = "card_id";
  [td_1, td_2] = createTd("id", data["id"]);
  id.append(td_1, td_2);

  height = document.createElement("tr");
  height.className = "card_height";
  [td_1, td_2] = createTd("height", data["height"]);
  height.append(td_1, td_2);

  weight = document.createElement("tr");
  weight.className = "card_weight";
  [td_1, td_2] = createTd("weight", data["weight"]);
  weight.append(td_1, td_2);

  table.append(id, height, weight);

  image = document.createElement("img");
  image.className = "card_image";
  if (data["sprites"]["front_default"]) {
    image.src = data["sprites"]["front_default"];
  } else {
    image.src = "img/noimage.png";
  }

  root_elem.append(image, name, table);

  result_div.append(root_elem);
}
