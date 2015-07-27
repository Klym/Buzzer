<?php
# Читаем данные, переданные в POST
$rawPost = file_get_contents("php://input");
$data = json_decode($rawPost);
$data = iconv("utf-8","windows-1251",$data);
$zvonki = array();
$file = fopen("zvonki/".$data.".txt","r"); # Открываем файл для чтения
if (!$file) die("Невозможно открыть файл ".$data.".txt");
while(!feof($file)) { # Читаем файл построчно
	$zvonki[] = fgets($file); # Каждую строку заносим в массив
}
fclose($file); # Закрываем файл
echo json_encode($zvonki);
?>