<?php
require("lock.php"); # Выводим форму авторизации
$zvonki = array(); # Создаем массив для звонков
$file = fopen("../zvon/1.txt","r"); # Открываем файл для чтения
if (!$file) die("Невозможно открыть файл zvonki.txt");
while(!feof($file)) { # Читаем файл построчно
	$zvonki[] = fgets($file); # Каждую строку заносим в массив
}
fclose($file); # Закрываем файл
$dir = "zvonki";
$files = scandir($dir);
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<link rel="stylesheet" type="text/css" href="style.css">
<script type="text/javascript" src="json2.js"></script>
<script type="text/javascript" src="save.js"></script>
<title>Звонок</title>
</head>
<body>
<form method="post" name="options">
    <div id="left">    	
        <select name="day">
        	<option value="0">Шаблоны расписаний:</option>
			<?php
			for ($i = 2; $i < count($files); $i++) {
				$files[$i] = iconv("windows-1251", "utf-8", $files[$i]);
				printf("<option>%s</option>", basename($files[$i], ".txt"));
			}
			?>
        </select><br>
        <?php
        for ($i = 0, $a = 1; $i < count($zvonki); $i = $i + 2, $a++) { # Вывод массива в форму
            printf("<div>%s. <input class='edit' type='text' maxlength='5' name='edit' value='%s'> - <input class='edit' type='text' maxlength='5' name='edit' value='%s'> <input type='checkbox' style='width:20px;' checked><span class='time'></span></div>",$a,$zvonki[$i],$zvonki[$i+1]);
        }
        ?>
		<p><label><input type="checkbox" name="proportional" checked> Пропорциональное изменение</label></p>
        <div id="saveTemplates">
	        <button name="saveTemplate">Сохранить как новый шаблон</button><br>
            <button name="updateTemplate">Обновить существующий</button><br>
            <button name="deleteTemplate" >Удалить шаблон</button>
        </div>
	</div>
    <div id="right">
        <input type="submit" id="save" name="save" value="Записать"><br>
        <input type="submit" id="zvon" name="ring" value="Звонить"><br>
        <table>
        	<tr><td>Урок:</td><td><input type="text" name="lesson"></td></tr>
            <tr><td>Перемена:</td><td><input type="text" name="short_break"></td></tr>
            <tr><td>Длинная перемена:</td><td><input type="text" name="long_break"></td></tr>
            <tr><td>Время на сервере:</td><td id="servTime"></td></tr>
            <tr><td>До звонка осталось:</td><td id="ringTime"></td></tr>
        </table>
	</div>
</form>
</body>
</html>