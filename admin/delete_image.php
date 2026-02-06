<?php
/**
 * Удаление изображения из контента (из JSON).
 * Путь передаётся в POST: path. Файл на диске не удаляется (можно доработать).
 */
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['admin'])) {
    http_response_code(403);
    exit('Forbidden');
}

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$path = trim($_POST['path'] ?? '');
$from = trim($_POST['from'] ?? ''); // carousel | project_gallery
$project_id = (int)($_POST['project_id'] ?? 0);

if ($path === '') {
    echo json_encode(['ok' => false, 'error' => 'Нет пути']);
    exit;
}

if (!file_exists(DATA_FILE)) {
    echo json_encode(['ok' => false, 'error' => 'Нет файла данных']);
    exit;
}

$content = json_decode(file_get_contents(DATA_FILE), true);
if (!is_array($content)) {
    echo json_encode(['ok' => false, 'error' => 'Ошибка данных']);
    exit;
}

if ($from === 'carousel' && !empty($content['carousel'])) {
    $content['carousel'] = array_values(array_filter($content['carousel'], function ($item) use ($path) {
        return ($item['src'] ?? '') !== $path;
    }));
}

if ($from === 'project_gallery' && $project_id > 0 && !empty($content['block5']['projects'])) {
    foreach ($content['block5']['projects'] as &$p) {
        if ((int)($p['id']) === $project_id && !empty($p['gallery'])) {
            $p['gallery'] = array_values(array_filter($p['gallery'], function ($p) use ($path) {
                return $p !== $path;
            }));
            break;
        }
    }
}

$json = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if (file_put_contents(DATA_FILE, $json) === false) {
    echo json_encode(['ok' => false, 'error' => 'Ошибка записи']);
    exit;
}

echo json_encode(['ok' => true]);
exit;
