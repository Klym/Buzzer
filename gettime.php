<?php
$h = date("H");
$m = date("i");
header("Current-Hours: " . $h);
header("Current-Minutes: " . $m);
?>