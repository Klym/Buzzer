<?php
if (!isset($_SERVER['PHP_AUTH_USER']) || $_SERVER['PHP_AUTH_USER'] != "root" || $_SERVER['PHP_AUTH_PW'] != 1) {
	Header ("WWW-Authenticate: Basic realm=\"Admin Page\"");
	Header ("HTTP/1.0 401 Unauthorized");
	die();
}
?>