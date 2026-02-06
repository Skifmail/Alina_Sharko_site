<?php
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['admin'])) {
    http_response_code(403);
    exit('Forbidden');
}

$ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['file'])) {
    echo json_encode(['ok' => false, 'error' => 'Нет файла']);
    exit;
}

$type = $_POST['type'] ?? '';
$project_id = (int)($_POST['project_id'] ?? 0);

$file = $_FILES['file'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $ALLOWED_EXT) || !in_array($file['type'], $ALLOWED_MIMES)) {
    echo json_encode(['ok' => false, 'error' => 'Разрешены только изображения: JPG, PNG, WEBP, GIF']);
    exit;
}

ensure_upload_dirs();

$path = '';
$url_path = '';

switch ($type) {
    case 'carousel':
        $name = 'carousel_' . (time() % 100000) . '.' . $ext;
        $path = UPLOAD_BASE . '/carousel/' . $name;
        $url_path = 'uploads/carousel/' . $name;
        break;
    case 'hero':
        $path = UPLOAD_BASE . '/hero/block_1.' . $ext;
        $url_path = 'uploads/hero/block_1.' . $ext;
        break;
    case 'block2_left':
        $path = UPLOAD_BASE . '/block2/left.' . $ext;
        $url_path = 'uploads/block2/left.' . $ext;
        break;
    case 'block2_right':
        $path = UPLOAD_BASE . '/block2/right.' . $ext;
        $url_path = 'uploads/block2/right.' . $ext;
        break;
    case 'block3_bottom1':
        $path = UPLOAD_BASE . '/block3/bottom1.' . $ext;
        $url_path = 'uploads/block3/bottom1.' . $ext;
        break;
    case 'block3_bottom2':
        $path = UPLOAD_BASE . '/block3/bottom2.' . $ext;
        $url_path = 'uploads/block3/bottom2.' . $ext;
        break;
    case 'block4_top':
        $path = UPLOAD_BASE . '/block4/top.' . $ext;
        $url_path = 'uploads/block4/top.' . $ext;
        break;
    case 'og_image':
        $path = UPLOAD_BASE . '/og/preview.' . $ext;
        $url_path = 'uploads/og/preview.' . $ext;
        break;
    case 'project_cover':
        if ($project_id < 1) {
            echo json_encode(['ok' => false, 'error' => 'Укажите проект']);
            exit;
        }
        $dir = UPLOAD_BASE . '/projects/' . $project_id;
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $path = $dir . '/cover.' . $ext;
        $url_path = 'uploads/projects/' . $project_id . '/cover.' . $ext;
        break;
    case 'project_gallery':
        if ($project_id < 1) {
            echo json_encode(['ok' => false, 'error' => 'Укажите проект']);
            exit;
        }
        $dir = UPLOAD_BASE . '/projects/' . $project_id . '/gallery';
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $name = (time() % 1000000) . '.' . $ext;
        $path = $dir . '/' . $name;
        $url_path = 'uploads/projects/' . $project_id . '/gallery/' . $name;
        break;
    default:
        echo json_encode(['ok' => false, 'error' => 'Неизвестный тип загрузки']);
        exit;
}

$dir = dirname($path);
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

if (!move_uploaded_file($file['tmp_name'], $path)) {
    echo json_encode(['ok' => false, 'error' => 'Ошибка сохранения файла']);
    exit;
}

echo json_encode(['ok' => true, 'path' => $url_path]);
exit;
