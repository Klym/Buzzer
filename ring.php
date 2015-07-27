<?php
$rawPost = file_get_contents("php://input");
if ($rawPost) {
	$file = fopen("tools.txt","r+"); # Открываем файл для записи
	if (!$file) die("Невозможно открыть файл на запись");
	fwrite($file,1,1); # Выделяем 1 байт памяти и меняем первый символ на 1
	fclose($file); # Закрытие файла
} else {
	die("Error");
}
?>