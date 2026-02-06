<?php
/**
 * Пути относительно корня сайта (где лежит index.html)
 */
define('ROOT_DIR', dirname(__DIR__));
define('DATA_FILE', ROOT_DIR . '/data/content.json');
define('UPLOAD_BASE', ROOT_DIR . '/uploads');
define('IMAGES_BASE', ROOT_DIR . '/images');

$ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

function ensure_upload_dirs() {
    $dirs = [
        UPLOAD_BASE . '/carousel',
        UPLOAD_BASE . '/block2',
        UPLOAD_BASE . '/block3',
        UPLOAD_BASE . '/block4',
        UPLOAD_BASE . '/hero',
        UPLOAD_BASE . '/og',
        UPLOAD_BASE . '/projects',
    ];
    foreach ($dirs as $d) {
        if (!is_dir($d)) {
            mkdir($d, 0755, true);
        }
    }
}
