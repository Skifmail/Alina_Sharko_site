<?php
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: panel.php');
    exit;
}

$content = [];
if (file_exists(DATA_FILE)) {
    $content = json_decode(file_get_contents(DATA_FILE), true) ?: [];
}

// Вся форма приходит как один JSON (удобно для сложной структуры)
$raw = $_POST['content_json'] ?? '';
if ($raw !== '') {
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $content = $decoded;
    }
}

$json = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if (file_put_contents(DATA_FILE, $json) === false) {
    $_SESSION['admin_error'] = 'Ошибка записи файла.';
} else {
    $_SESSION['admin_ok'] = 'Сохранено.';
}

header('Location: panel.php');
exit;
