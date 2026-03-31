<?php
/**
 * Простая авторизация админки (без БД).
 * Смените логин и пароль в этом файле перед выкладкой на хостинг.
 */
session_start();

function env_value(string $name, string $default = ''): string
{
    $value = getenv($name);
    if ($value === false || $value === null) {
        // Some hosting setups populate values in $_SERVER/$_ENV when using SetEnv in .htaccess.
        $value = $_SERVER[$name] ?? ($_ENV[$name] ?? null);
    }

    if ($value === false || $value === null) {
        return $default;
    }

    return (string)$value;
}

define('ADMIN_LOGIN', env_value('ADMIN_LOGIN', 'admin'));
define('ADMIN_PASS', env_value('ADMIN_PASS', ''));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (ADMIN_PASS === '') {
        header('Location: index.php?error=1');
        exit;
    }

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
