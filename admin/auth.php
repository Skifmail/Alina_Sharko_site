<?php
/**
 * Простая авторизация админки (без БД).
 * Смените логин и пароль в этом файле перед выкладкой на хостинг.
 */
session_start();

define('ADMIN_LOGIN', 'admin');
define('ADMIN_PASS', 'OstorozhnoDetali2026!'); // Смените на свой надёжный пароль

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = $_POST['login'] ?? '';
    $pass  = $_POST['pass'] ?? '';
    if ($login === ADMIN_LOGIN && $pass === ADMIN_PASS) {
        $_SESSION['admin'] = true;
        $_SESSION['admin_ts'] = time();
        header('Location: panel.php');
        exit;
    }
}

header('Location: index.php?error=1');
exit;
