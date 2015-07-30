<?php
function check($values) {
	if (count($values) != 14) {
		die("Ошибка. Неверные входные данные.");
	}
	for ($i = 0; $i < 14; $i++) {
		$count = preg_match("/^((([0,1][0-9])|(2[0-3])):[0-5][0-9])$/", $values[$i], $matches);
		if ($count == 0 && !empty($values[$i])) {
			die("Ошибка. Неверные входные данные.");
		}
	}
}

function add($data) {
	$file = @fopen("zvonki/".$data->name.".txt", "x");
	if (empty($file)) {
		die("Ошибка. Такой файл уже существует. Введите уникальное имя.");
	}
	for ($i = 0; $i < count($data->values); $i++) {
		if (($i + 1) != count($data->values)) 
			$br = "\r\n";
		else 
			$br = '';
		fwrite($file, $data->values[$i].$br); # Запись данных в файл
	}
	fclose($file);
	echo "Данные успешно сохранены в файл.";
}

function delete($data) {
	$result = @unlink("zvonki/".$data->name.".txt");
	if ($result) {
		echo "Шаблон успешно удален.";
	} else {
		echo "Ошибка. Шаблон не удален.";
	}
}

function update($data) {
	$file = @fopen("zvonki/".$data->name.".txt", "w"); # Открываем файл для записи
	if (!$file) die("Невозможно открыть файл на запись.");
	for ($i = 0; $i < count($data->values); $i++) { # Перебираем массив с данными
		if (($i + 1) != count($data->values)) 
			$br = "\r\n";
		else 
			$br = '';
		fwrite($file, $data->values[$i].$br); # Запись данных в файл
	}
	fclose($file); # Закрытие файла
	echo "Шаблон успешно обновлен.";
}

function save($data) {
	$file = fopen("../zvon/1.txt", "w"); # Открываем файл для записи
	if (!$file) die("Невозможно открыть файл на запись");
	for($i = 0; $i < count($data->values); $i++) { # Перебираем массив с данными
		if (($i + 1) != count($data->values)) 
			$br = "\r\n";
		else 
			$br = '';
		fwrite($file, $data->values[$i].$br); # Запись данных в файл
	}
	fclose($file); # Закрытие файла
	echo "Данные сохранены";
}

$rawPost = file_get_contents("php://input");
if ($rawPost) {
	$data = json_decode($rawPost);
	if ($data->name) {
		$data->name = iconv("utf-8", "windows-1251", $data->name);
	}
	if ($data->action != "delete") {
		check($data->values); # Проверяем данные на корректность
	}
	switch ($data->action) {
		case "save": save($data); break;
		case "add": add($data); break;
		case "delete": delete($data); break;
		case "update": update($data); break;		
	}
} else {
	die("Ошибка! Данные не сохранены");
}
?>