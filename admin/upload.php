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
$slot = (int)($_POST['slot'] ?? 0);

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
    case 'block2_image':
        $path = UPLOAD_BASE . '/block2/image.' . $ext;
        $url_path = 'uploads/block2/image.' . $ext;
        break;
    case 'block3_image':
        if ($slot < 1 || $slot > 4) {
            echo json_encode(['ok' => false, 'error' => 'Некорректный слот изображения']);
            exit;
        }
        $path = UPLOAD_BASE . '/block3/image-' . $slot . '.' . $ext;
        $url_path = 'uploads/block3/image-' . $slot . '.' . $ext;
        break;
    case 'block3_mobile_image':
        if ($slot < 1 || $slot > 6) {
            echo json_encode(['ok' => false, 'error' => 'Некорректный слот мобильного изображения']);
            exit;
        }
        $path = UPLOAD_BASE . '/block3/mobile-image-' . $slot . '.' . $ext;
        $url_path = 'uploads/block3/mobile-image-' . $slot . '.' . $ext;
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

$saved = optimize_and_save_uploaded_image($file['tmp_name'], $path, $ext, $type);
if (!$saved) {
    if (!move_uploaded_file($file['tmp_name'], $path)) {
        echo json_encode(['ok' => false, 'error' => 'Ошибка сохранения файла']);
        exit;
    }
}

echo json_encode(['ok' => true, 'path' => $url_path]);
exit;

/**
 * Оптимизирует и сохраняет загруженное изображение.
 * Для JPG/PNG/WEBP выполняет ресайз и компрессию.
 * Для GIF и неподдерживаемых конфигураций возвращает false (fallback на move_uploaded_file).
 */
function optimize_and_save_uploaded_image(string $tmpPath, string $targetPath, string $ext, string $type): bool
{
    if (!extension_loaded('gd')) {
        return false;
    }

    $ext = strtolower($ext);
    if ($ext === 'gif') {
        // GIF (особенно анимированный) не переэнкодим, чтобы не ломать анимацию.
        return false;
    }

    $meta = @getimagesize($tmpPath);
    if (!$meta || empty($meta[0]) || empty($meta[1])) {
        return false;
    }

    $sourceWidth = (int)$meta[0];
    $sourceHeight = (int)$meta[1];
    [$maxWidth, $maxHeight] = get_upload_max_dimensions($type);

    [$targetWidth, $targetHeight] = get_fit_size($sourceWidth, $sourceHeight, $maxWidth, $maxHeight);

    $sourceImage = create_image_resource($tmpPath, $ext);
    if (!$sourceImage) {
        return false;
    }

    $sourceImage = normalize_orientation_if_needed($sourceImage, $tmpPath, $ext);

    $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
    if (!$canvas) {
        imagedestroy($sourceImage);
        return false;
    }

    // Сохраняем прозрачность для PNG/WEBP.
    if ($ext === 'png' || $ext === 'webp') {
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
        imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, $transparent);
    } else {
        $bg = imagecolorallocate($canvas, 245, 241, 238);
        imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, $bg);
    }

    imagecopyresampled(
        $canvas,
        $sourceImage,
        0,
        0,
        0,
        0,
        $targetWidth,
        $targetHeight,
        imagesx($sourceImage),
        imagesy($sourceImage)
    );

    $saved = save_optimized_image($canvas, $targetPath, $ext);
    imagedestroy($canvas);
    imagedestroy($sourceImage);

    return $saved;
}

function get_upload_max_dimensions(string $type): array
{
    switch ($type) {
        case 'hero':
            return [2200, 1400];
        case 'og_image':
            return [1600, 900];
        case 'project_cover':
            return [1400, 1400];
        case 'project_gallery':
            return [2200, 2200];
        case 'block4_top':
            return [2400, 1200];
        case 'block3_image':
        case 'block3_mobile_image':
        case 'block2_image':
        case 'carousel':
        default:
            return [2000, 2000];
    }
}

function get_fit_size(int $width, int $height, int $maxWidth, int $maxHeight): array
{
    if ($width <= $maxWidth && $height <= $maxHeight) {
        return [$width, $height];
    }

    $ratio = min($maxWidth / $width, $maxHeight / $height);
    return [
        max(1, (int)round($width * $ratio)),
        max(1, (int)round($height * $ratio)),
    ];
}

function create_image_resource(string $path, string $ext)
{
    switch ($ext) {
        case 'jpg':
        case 'jpeg':
            return @imagecreatefromjpeg($path);
        case 'png':
            return @imagecreatefrompng($path);
        case 'webp':
            return function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false;
        default:
            return false;
    }
}

function save_optimized_image($img, string $targetPath, string $ext): bool
{
    switch ($ext) {
        case 'jpg':
        case 'jpeg':
            return imagejpeg($img, $targetPath, 82);
        case 'png':
            return imagepng($img, $targetPath, 6);
        case 'webp':
            return function_exists('imagewebp') ? imagewebp($img, $targetPath, 82) : false;
        default:
            return false;
    }
}

function normalize_orientation_if_needed($img, string $tmpPath, string $ext)
{
    if (!in_array($ext, ['jpg', 'jpeg'], true) || !function_exists('exif_read_data')) {
        return $img;
    }

    $exif = @exif_read_data($tmpPath);
    $orientation = isset($exif['Orientation']) ? (int)$exif['Orientation'] : 1;

    switch ($orientation) {
        case 3:
            $rotated = imagerotate($img, 180, 0);
            break;
        case 6:
            $rotated = imagerotate($img, -90, 0);
            break;
        case 8:
            $rotated = imagerotate($img, 90, 0);
            break;
        default:
            $rotated = $img;
            break;
    }

    if ($rotated !== $img) {
        imagedestroy($img);
    }
    return $rotated;
}
