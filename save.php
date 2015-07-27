<?php
# Читаем данные, переданные в POST
$rawPost = file_get_contents("php://input");
if ($rawPost) {
	$data = json_decode($rawPost);
	$file = fopen("../zvon/1.txt","w"); # Открываем файл для записи
	if (!$file) die("Невозможно открыть файл на запись");
	for($i = 0; $i < count($data); $i++) { # Перебираем массив с данными
		if (($i + 1) != count($data)) 
			$br = "\r\n";
		else 
			$br = '';
		fwrite($file,$data[$i].$br); # Запись данных в файл
	}
	fclose($file); # Закрытие файла
	echo "Данные сохранены";
} else {
	die("Ошибка! Данные не сохранены");
}
?>