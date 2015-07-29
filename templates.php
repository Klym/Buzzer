<?php
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

$rawPost = file_get_contents("php://input");
if ($rawPost) {
	$data = json_decode($rawPost);
	$data->name = iconv("utf-8", "windows-1251", $data->name);
	switch ($data->action) {
		case "add": add($data); break;
		case "delete": delete($data); break;
		case "update": update($data); break;
	}
} else {
	die("Ошибка! Данные не сохранены");
}
?>