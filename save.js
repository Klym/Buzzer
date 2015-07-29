var inputs; // Все поля формы
var params; // Поля содержащие время уроков, перемен
var timer;	// Таймер проверки маячка
var time;	// Текущее время полученное с сервера 
var pattern = new RegExp("\\d{2}\:\\d{2}$"); // Регулярное выражение на корректность данных
var lessonLength; // Длина урока
var breakLength; // Длина перемены
var longBreakLength; // Длина длинной перемены

window.onload = function() { // При загрузке документа
	window.inputs = document.getElementById("left").getElementsByTagName("input");
	var select = document.getElementById("left").getElementsByTagName("select");
	select[0].onchange = change; // Вешаем событие при выборе select'a
	// Вешаем события клика на кнопки
	document.options.save.onclick = save;
	document.options.ring.onclick = ring;
	document.options.saveTemplate.onclick = saveTemplate;
	document.options.updateTemplate.onclick = updateTemplate;
	document.options.deleteTemplate.onclick = deleteTemplate;
	window.params = [document.options.lesson,document.options.short_break,document.options.long_break]; // Отбираем поля содержащие время уроков, перемен
	for (var i = 0; i < params.length; i++) {
		params[i].onchange = recount; // При их изменении запускаем ф-цию пересчета
	}
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].type == "checkbox") continue;
		if (inputs[i].value  == '') { // Если какое либо значение пустое, сбросить пропорциональное изменение
			document.options.proportional.checked = false;
			document.options.proportional.disabled = true;
		}
		inputs[i].onkeyup = recount; // При изменении поля пересчитуем расписание
		inputs[i].onchange = check; // При сбросе фокуса с поля проверяем поле на корректность введенных данных
	}
	// Определяем местонахождение маячка
	getCurrentTime();
	// Определяем параметры продолжительности
	getLessonLength();
	getBreakLength();
	getLongBreakLength();
	window.lessonLength = document.options.lesson.value;
	window.breakLength = document.options.short_break.value;
	window.longBreakLength = document.options.long_break.value;
}

String.prototype.trim = function(str) { // Функция обрезает пробелы на краях строки
	return str.replace(/^\s+|\s+$/g, "");
}

function getXmlHttpRequest() { // Кроссбраузерная функция для создания обьекта XMLHttpRequest, предназначена для Internet Explorer версии 6 и ниже
	if (window.XMLHttpRequest) {
		try {
			return new XMLHttpRequest();
		} catch(e) {}
	} else if (window.ActiveXObject) {
		try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		} catch(e) {}
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch(e) {}
	}
	return null;
}

function changeType(arr1,arr2) { // Функция преобразует элементы массива в числовой тип
	arr1[0] = Number(arr1[0]);
	arr1[1] = Number(arr1[1]);
	arr2[0] = Number(arr2[0]);
	arr2[1] = Number(arr2[1]);
}

function getLength(i,num) { // Функция определяет длину промежутка
	var val1 = inputs[i].value.split(":");
	var val2 = inputs[i+num].value.split(":");
	changeType(val1,val2);
	var hours = val2[0] - val1[0];
	var minutes = val2[1] - val1[1];
	if (hours != 0) {
		minutes = 60 * hours - val1[1] + val2[1];
	}
	return minutes; // Возвращаем длину в min
}

function getLessonLength() { // Функция определяет длину урока
	for (var i = 0; i < inputs.length - 1; i++) {
		if ((inputs[i].value == '' || inputs[i+1].value == '') || inputs[i].type == "checkbox") {
			continue;
		} else {
			document.options.lesson.value = getLength(i,1); // Заносим в поле полученную длину
			break;
		}
	}
}

function getBreakLength() { // Функция определяет длину перемены
	for (var i = 1; i < inputs.length - 2; i++) {
		if ((i == 4 || i == 7) || (inputs[i].value == '' || inputs[i+2].value == '') || (i % 3) == 0 || inputs[i].type == "checkbox") {
			continue;
		} else {
			document.options.short_break.value = getLength(i,2); // Заносим в поле полученную длину
			break;
		}
	}
}

function getLongBreakLength() { // Функция определяет длину длинной перемены
	for (var i = 4; i < inputs.length; i++) {
		if ((i != 4 && i != 7) || (inputs[i].value == '' || inputs[i+2].value == '') || inputs[i].type == "checkbox") {
			continue;
		} else {
			document.options.long_break.value = getLength(i,2); // Заносим в поле полученную длину
			break;
		}
	}
}

function check() { // Функция сравнивает значение с регулярным выражением
	var inputs = document.options.edit;
	var test;
	var count = 0;
	for (var i = 0; i < inputs.length; i++) {
		test = inputs[i].value.split(":");
		if (!pattern.test(inputs[i].value) || (!test[0] && test[0] != 0) || (!test[1] && test[1] != 0) || (test[0] >= 24 || test[0] < 0) || (test[1] >= 60 || test[1] < 0)) { // Если значение не соответствует регулярному выражению
			inputs[i].style.border = "2px solid red"; // Подсвечиваем поле
			count++;
		} else { // Если же соответствует
			inputs[i].style.border = "1px solid #000"; // Сбрасываем рамку
		}
	}
	if (count == 0) {
		document.options.save.disabled = false; // Снимаем блок с кнопки сохранения
	} else {
		document.options.save.disabled = true; // Блокируем кнопку сохранения
	}
}

function checkFlag() { // Функция определяет состояние чекбокса на пропорциональное изменение
	var inputs = document.options.edit;
	var empty = 0;
	for (var i = 0; i < inputs.length; i++) { // Обходим все поля и если среди них были найдены пустые
		if (inputs[i].value == '') empty += 1; // Увеличиваем перемнную на 1
	}
	if (empty != 0) { // Если во время перебора полей были найдены пустые
		// То сбросить чекбокс и заблокировать его изменение
		document.options.proportional.disabled = true;
		document.options.proportional.checked = false;
	} else { // Иначе разблокировать
		document.options.proportional.disabled = false;
		document.options.proportional.checked = true;
	}
}

function recount() { // Функция пересчитует расписание звонков
	var inputs = document.options.edit; // Получаем все поля
	if (document.options.proportional.disabled && !document.options.proportional.checked) {
		checkFlag(); // Проверяем состояние чекбокса и кнопки
	}
	if (!document.options.proportional.checked) return false; // Если чекбокс на пропорциональное изменение сброшен, то ничего не пересчитываем
	for (var i = 0; i < inputs.length; i++) { // Цикл по всем полям
		for (var n = 0; n < params.length; n++) {
			if (inputs[i] === this && this.value.length == 5 || this === params[i]) { // Определяем текущее поле в которое вносится изменение и если длина значения равна 5
				for (var m = i; m < inputs.length; m++) { // Перебираем все последующие поля
					if (!inputs[m+1]) break;
					// Разбиваем ткущее и след. поле на минуты и часы
					var nhm = inputs[m].value.split(":");
					var sthm = inputs[m+1].value.split(":");
					changeType(nhm,sthm); // Переводим значения в числовой тип
					if ((!nhm[0] && nhm[0] != 0) || (!nhm[1] && nhm[1] != 0) || (!sthm[0] && sthm[0] != 0) || (!sthm[1] && sthm[1] != 0) || nhm[0] < 0 || nhm[1] >= 60 || nhm[1] < 0) { // Проверяем на корректность введенных значений
						// Если что-то не так, подсвечиваем поле, блокируем кнопку save, выводим сообщение и прекращаем работу ф-ции
						inputs[m].style.border = "2px solid red";
						document.options.save.disabled = true;
						window.clearInterval(timer);
						alert("Ошибка. Недопустимое значение параметра");
						getCurrentTime();
						return false;
					}
					// Если со значениями все в порядке, сбрасываем рамку и продолжаем работу
					this.style.border = '1px solid #000';
					document.options.save.disabled = false;
					var lesson, pereryv, type;
					lesson = document.options.lesson.value;
					if (m == 3 || m == 5) { // Если сейчас очередь длинной перемены, то приравниваем соответствующее значение
						pereryv = document.options.long_break.value;
					} else {
						pereryv = document.options.short_break.value;
					}
					if (m % 2 != 0) { // Определяем тип промежутка(урок/перемена)
						type = pereryv;
					} else {
						type = lesson;
					}
					sthm[0] = nhm[0]; // Часы пока оставляем как есть
					sthm[1] = nhm[1] + Number(type); // Прибавляем последующему полю(конкретно минутам) длину промежутка
					while(sthm[1] >= 60) { // Если минут больше 60, то запускаем цикл
						sthm[1] = sthm[1] - 60; // Отнимаем 60 минут
						sthm[0]++; // Увеличиваем час на 1
					}
					while (sthm[0] >= 24) { // Если часов больше 24, цикл
						// Обнуляем значение, и по мере надобности увеличиваем
						sthm[0] = -1;
						sthm[0]++;
					}
					// Если какое-то из значений меньше 10, то прибавляем перед цифрой 0
					if (sthm[0] < 10) sthm[0] = "0" + sthm[0];
					if (sthm[1] < 10) sthm[1] = "0" + sthm[1];
					var newStr = sthm[0] + ":" + sthm[1]; // Генерируем строку со временем
					if (pattern.test(newStr)) { // Проверяем на корректность через регулярку
						inputs[m+1].value = newStr; // И присваиваем след. полю
					} else { // Если что-то не вышло, блокируем копку
						document.options.save.disabled = true;
					}
				}
			}
		}
	}
}

function getCurrentTime() { // Возвращает текущее время с сервера и запускает ф-цию отслеживания маячка
	var req = getXmlHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState != 4) return;
		// Получаем время сервера
		var currentTime = req.getResponseHeader("Current-Time");
		time = new Date(currentTime); // На основе полученого времени создаем обьект Date
		// Запускаем ф-цию отслеживания маячка
		time.setTime(time.getTime() + 1000);
		timer = window.setInterval("position()", 1000); // Запускаем таймер выполнения функции
	}
	req.open("HEAD","gettime.php",true);
	req.send(null);
}

function position() { // Функция определяет позицию маячка текущего урока
	var inputs = document.options.edit;
	var flags = document.getElementsByTagName("span");
	var servTime = document.getElementById("servTime");
	var ringTime = document.getElementById("ringTime");
	var leftToRing = new Date();
	var ringTimeFlag = false;
	for (var i = 0; i < inputs.length; i = i + 2) { // Перебираем все пары полей(начало и конца урока)
		// Обрезаем часы и минуты начала и конца урока
		var arr1 = inputs[i].value.split(":");
		var arr2 = inputs[i+1].value.split(":");
		var startLessTime = new Date(0, 0, 0, arr1[0], arr1[1]); // Создаем обьект Date на основе начала урока
		var endLessTime = new Date(0, 0, 0, arr2[0], arr2[1]); // Создаем обьект Date на основе конца урока
		var currentTime = new Date(0, 0, 0, time.getHours(), time.getMinutes(), time.getSeconds()); // Текущее время
		// Сравниваем значение времени
		if ((currentTime >= startLessTime && currentTime <= endLessTime)) {
			// Если текущее время входит в промежуток между началом и концом урока то отобразить индикатор
			inputs[i+1].nextSibling.nextSibling.nextSibling.style.display = "block";
			// Расчитать и вывести время до конца урока
			leftToRing.setTime(endLessTime - currentTime);
			ringTime.innerHTML = (leftToRing.getHours() == 3) ? "" : (leftToRing.getHours() - 3) + ":";
			ringTime.innerHTML += leftToRing.getMinutes() + ":" + leftToRing.getSeconds();
			ringTimeFlag = true;
		} else {
			// Иначе спрятать его
			inputs[i+1].nextSibling.nextSibling.nextSibling.style.display = "none";
			// Если сейчас перемена, расчитать и вывести время до начала урока
			if (i < inputs.length - 2) {
				var nextLesson = inputs[i+2].value.split(":");
				var nextLessTime = new Date(0, 0, 0, nextLesson[0], nextLesson[1]);
				if (currentTime > endLessTime && currentTime < nextLessTime) {
					leftToRing.setTime(nextLessTime - currentTime);
					ringTime.innerHTML = (leftToRing.getHours() == 3) ? "" : (leftToRing.getHours() - 3) + ":";
					ringTime.innerHTML += leftToRing.getMinutes() + ":" + leftToRing.getSeconds();
					ringTimeFlag = true;
				}
			}
		}
		// Если время находится вне расписания, отменить вывод оставшегося времени до звонка
		if (!ringTimeFlag) {
			ringTime.innerHTML = "";
		}
	}
	// Выводим время и увеличиваем его значение на 1 секунду
	servTime.innerHTML = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
	time.setTime(time.getTime() + 1000);
}

function change() { // Функция изменяет значения полей в зависимости от выбора типа
	var option = this.getElementsByTagName("option");
	var optValue;
	for(var i = 0; i < option.length; i++) {
		if (option[i].selected) {
			optValue = option[i].value; // Определяем значение выбранного select'а
		}
	}
	if (optValue == 0) return false;
	// Отправляем значение select'а на сервер и получаем массив звонков из стандартного файла
	var opt = JSON.stringify(optValue);
	var req = getXmlHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			var get = JSON.parse(req.responseText);
			for(var i = 1, a = 0; i < inputs.length; i++, a = a + 2) {
				// Изменяем значение всех полей формы
				inputs[i-1].value = String.prototype.trim(get[a]);
				inputs[i].value = String.prototype.trim(get[a+1]);
				i = i + 2; // Перескакиваем чекбокс
			}
			// Определяем промежутки
			getLessonLength();
			getBreakLength();
			getLongBreakLength();
			check();
			checkFlag();
		}
	}
	req.open("POST","get.php",true);
	req.send(opt);
}

function getTimetable() { // Собирает данные расписания с формы
	var values = new Array(); // Многомерный массив всех значений
	var data = new Array(); // Массив для отправки (отброшены значение, где сброшены чекбоксы)
	var check; // Состояние чекбокса (0 или 1)
	for(var i = 1; i < inputs.length; i++) { // Цикл по всем инпутам
		if (inputs[i + 1].checked) // Проверяем состояние чекбокса
			check = 1;
		else 
			check = 0;
		values.push(new Array(inputs[i-1].value,inputs[i].value,check)); // Заполняем массив данными
		i = i + 2; // Перескакиваем чекбокс, мы его уже внесли
	}
	for(var i = 0; i < values.length; i++) { // Перебираем отобранные значения
		if (values[i][2] == 1) { // Заносим только те, на которых состояние чекбокса = 1
			if (!pattern.test(values[i][0]) || !pattern.test(values[i][1])) { // Еще раз проверим значения на корректность
				window.clearInterval(timer);
				alert("Ошибка. Не все данные введены корректно");
				getCurrentTime();
				return false;
			}
			data.push(values[i][0],values[i][1]);
		} else {
			data.push("","");
		}
	}
	return data;
}

function save() { // Функция отправляет данные на сервер и сохраняет их в файле	
	// Аяксом отправляем данные на сервер.
	var jsonData = JSON.stringify(getTimetable());
	var req = getXmlHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			window.clearInterval(timer);
			alert(req.responseText);
			getCurrentTime();
		}
	}
	req.open("POST","save.php",true);
	req.send(jsonData);
	return false; // Оменить стандартное поведение кнопки
}

function ring() { // Функция подачи звонка
	this.disabled = true; // Блокируем кнопку
	var req = getXmlHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			// После успешного обновления файла, разблокируем кнопку через 3 секунды
			window.setTimeout("document.options.ring.disabled = false",3000);
		}
	}
	// Формируем запрос
	req.open("POST","ring.php",true);
	req.send("1");
	return false; // Оменить стандартное поведение кнопки
}

function saveTemplate() { // Сохраняет шаблон
	window.clearInterval(timer);
	var templateName = prompt("Введите имя шаблона:");
	getCurrentTime();
	if (templateName) {
		var data = { name: templateName, values: getTimetable(), action: "add"}; // Отправляем имя нового файла, данные и действие
		var jsonData = JSON.stringify(data);
		var req = getXmlHttpRequest();
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				window.clearInterval(timer);
				alert(req.responseText);
				getCurrentTime();
				if (req.responseText == "Данные успешно сохранены в файл.") {
					// Добавляем в select новый option
					var newFile = document.createElement("option");
					var name = document.createTextNode(templateName);
					newFile.appendChild(name);
					document.options.day.appendChild(newFile);
				}
			}
		}
		req.open("POST", "templates.php", true);
		req.send(jsonData);
	}
	return false;
}

function getTemplateObject() { // Получает выбранный option
	var fileList = document.options.day; // Список всех шаблонов
	var option; // Шаблон для удаления
	for (var i = 2; i < fileList.childNodes.length; i++) {
		// Находим выбранный шаблон
		if (fileList.childNodes[i].nodeType != 3 && fileList.childNodes[i].selected) {
			option = fileList.childNodes[i];
		}		
	}
	return option;
}

function updateTemplate() { // Обновляет существующий шаблон
	var option = getTemplateObject();
	if (option) { // Если шаблон выбран
		window.clearInterval(timer);
		var confirmed = window.confirm("Вы действительно хотите обновить шаблон \"" + option.value + "\"?");
		if (!confirmed) {
			getCurrentTime();
			return false;
		}
		var data = { name: option.value, values: getTimetable(), action: "update"};
		var jsonData = JSON.stringify(data);
		var req = getXmlHttpRequest();
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				window.clearInterval(timer);
				alert(req.responseText);
				getCurrentTime();				
			}
		}
		req.open("POST", "templates.php", true);
		req.send(jsonData);
	} else {
		window.clearInterval(timer);
		alert("Вы не выбрали шаблон для обновления.");
		getCurrentTime();
	}
	return false;
}

function deleteTemplate() { // Удаляет шаблон
	var option = getTemplateObject();
	if (option) { // Если шаблон выбран
		window.clearInterval(timer);
		var confirmed = window.confirm("Вы действительно хотите удалить шаблон \"" + option.value + "\"?");
		if (!confirmed) {
			getCurrentTime();
			return false;
		}
		var data = { name: option.value, action: "delete" }; // Отправляем имя файла и действие
		var jsonData = JSON.stringify(data);
		var req = getXmlHttpRequest();
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				window.clearInterval(timer);
				alert(req.responseText);
				getCurrentTime();
				if (req.responseText == "Шаблон успешно удален.") {
					option.parentNode.removeChild(option);
				}
			}
		}
		req.open("POST", "templates.php", true);
		req.send(jsonData);
	} else {
		window.clearInterval(timer);
		alert("Вы не выбрали шаблон для удаления.");
		getCurrentTime();
	}
	return false;
}