<?php
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}

$data = [];
if (file_exists(DATA_FILE)) {
    $data = json_decode(file_get_contents(DATA_FILE), true) ?: [];
}

$ok = $_SESSION['admin_ok'] ?? null;
$err = $_SESSION['admin_error'] ?? null;
unset($_SESSION['admin_ok'], $_SESSION['admin_error']);

$seo = $data['seo'] ?? [];
$b1 = $data['block1'] ?? [];
$b2 = $data['block2'] ?? [];
$b2Image = $b2['image'] ?? $b2['right_image'] ?? $b2['left_image'] ?? '';
$b2ImageAlt = $b2['image_alt'] ?? $b2['right_image_alt'] ?? $b2['left_image_alt'] ?? '';
$carousel = $data['carousel'] ?? [];
$b3 = $data['block3'] ?? [];
$b3Gallery = $b3['bottom_gallery'] ?? [];
if (!$b3Gallery) {
    $legacyImages = [
        ['src' => $b3['bottom_image'] ?? '', 'alt' => $b3['bottom_image_alt'] ?? ''],
        ['src' => 'images/block3-1.png', 'alt' => 'Фото блока 3'],
        ['src' => 'images/block3-2.png', 'alt' => 'Фото блока 3'],
        ['src' => 'images/block3-3.png', 'alt' => 'Фото блока 3'],
    ];
    $b3Gallery = array_values(array_filter($legacyImages, function($item) {
        return !empty($item['src']);
    }));
}
$b3Gallery = array_pad($b3Gallery, 4, ['src' => '', 'alt' => '']);
$b3MobileGallery = $b3['bottom_gallery_mobile'] ?? [];
if (!$b3MobileGallery) {
    $b3MobileGallery = [
        ['src' => 'images/block3mob1.jpeg', 'alt' => 'Мобильное фото блока 3 1'],
        ['src' => 'images/block3mob2.jpeg', 'alt' => 'Мобильное фото блока 3 2'],
        ['src' => 'images/block3mob3.jpeg', 'alt' => 'Мобильное фото блока 3 3'],
        ['src' => 'images/block3mob4.jpeg', 'alt' => 'Мобильное фото блока 3 4'],
        ['src' => 'images/block3mob5.jpeg', 'alt' => 'Мобильное фото блока 3 5'],
        ['src' => 'images/block3mob6.jpeg', 'alt' => 'Мобильное фото блока 3 6'],
    ];
}
$b3MobileGallery = array_pad($b3MobileGallery, 6, ['src' => '', 'alt' => '']);
$b4 = $data['block4'] ?? [];
$b5 = $data['block5'] ?? [];
$b6 = $data['block6'] ?? [];
$footer = $data['footer'] ?? [];
$cookie = $data['cookie'] ?? [];
$projects = $b5['projects'] ?? [];
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админ-панель</title>
    <style>
        @font-face {
            font-family: 'Tilda Sans';
            src: url('../fonts/TildaSans-VF.ttf') format('truetype-variations');
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
        }

        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #1a1a1a; color: #eee; margin: 0; padding: 20px; }
        a { color: #b30000; }
        h1 { font-family: 'Tilda Sans', Arial, sans-serif; color: #b30000; }
        h2 { font-family: 'Tilda Sans', Arial, sans-serif; margin-top: 2rem; padding-bottom: 0.5rem; border-bottom: 1px solid #444; font-size: 1.1rem; }
        .msg { padding: 10px; margin-bottom: 1rem; border-radius: 6px; }
        .msg.ok { background: #1a3d1a; }
        .msg.err { background: #5d1a1a; }
        label { display: block; margin: 0.5rem 0 0.2rem; font-size: 0.9rem; color: #aaa; }
        input[type="text"], input[type="url"], textarea { width: 100%; max-width: 600px; padding: 8px 10px; margin-bottom: 0.5rem; border: 1px solid #444; border-radius: 4px; background: #2d2d2d; color: #fff; }
        textarea { min-height: 60px; }
        button, .btn { display: inline-block; padding: 10px 16px; background: #b30000; color: #fff; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 14px; margin-right: 8px; margin-top: 8px; }
        button:hover, .btn:hover { background: #d40000; }
        .sec { background: #2d2d2d; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; max-width: 900px; }
        .row { margin-bottom: 0.5rem; }
        .thumb { max-width: 120px; max-height: 80px; object-fit: cover; vertical-align: middle; margin-right: 8px; }
        .carousel-item, .project-item { padding: 8px; background: #1a1a1a; border-radius: 6px; margin-bottom: 6px; }
        .project-gallery-list { margin-top: 6px; }
        small { color: #888; }
    </style>
</head>
<body>
    <h1>Админ-панель</h1>
    <p><a href="../">Открыть сайт</a> | <a href="logout.php">Выйти</a></p>
    <?php if ($ok): ?><p class="msg ok"><?= htmlspecialchars($ok) ?></p><?php endif; ?>
    <?php if ($err): ?><p class="msg err"><?= htmlspecialchars($err) ?></p><?php endif; ?>

    <form id="mainForm" method="post" action="save.php">
        <input type="hidden" name="content_json" id="content_json" value="">

        <div class="sec">
            <h2>SEO</h2>
            <div class="row"><label>Title</label><input type="text" id="seo_title" value="<?= htmlspecialchars($seo['title'] ?? '') ?>"></div>
            <div class="row"><label>Meta description</label><textarea id="seo_description"><?= htmlspecialchars($seo['description'] ?? '') ?></textarea></div>
            <div class="row"><label>Keywords</label><input type="text" id="seo_keywords" value="<?= htmlspecialchars($seo['keywords'] ?? '') ?>"></div>
            <div class="row"><label>OG Title</label><input type="text" id="seo_og_title" value="<?= htmlspecialchars($seo['og_title'] ?? '') ?>"></div>
            <div class="row"><label>OG Description</label><textarea id="seo_og_description"><?= htmlspecialchars($seo['og_description'] ?? '') ?></textarea></div>
            <div class="row"><label>Превью фото в мессенджерах</label><input type="text" id="seo_og_image" value="<?= htmlspecialchars($seo['og_image'] ?? '') ?>"></div>
            <p><small>Или загрузите новое изображение (рекомендуется 1200×630 px): <input type="file" id="upload_og_image" accept="image/*"> <span id="og_image_upload_status"></span></small></p>
            <div class="row"><label>Twitter Title</label><input type="text" id="seo_twitter_title" value="<?= htmlspecialchars($seo['twitter_title'] ?? '') ?>"></div>
            <div class="row"><label>Twitter Description</label><input type="text" id="seo_twitter_description" value="<?= htmlspecialchars($seo['twitter_description'] ?? '') ?>"></div>
            <div class="row"><label>Schema: название</label><input type="text" id="seo_schema_name" value="<?= htmlspecialchars($seo['schema_name'] ?? '') ?>"></div>
            <div class="row"><label>Schema: описание</label><input type="text" id="seo_schema_description" value="<?= htmlspecialchars($seo['schema_description'] ?? '') ?>"></div>
            <div class="row"><label>Schema: телефон</label><input type="text" id="seo_schema_telephone" value="<?= htmlspecialchars($seo['schema_telephone'] ?? '') ?>"></div>
            <div class="row"><label>Schema: адрес</label><input type="text" id="seo_schema_address" value="<?= htmlspecialchars($seo['schema_address'] ?? '') ?>"></div>
            <div class="row"><label>Schema: Instagram URL</label><input type="url" id="seo_schema_instagram" value="<?= htmlspecialchars($seo['schema_instagram'] ?? '') ?>"></div>
        </div>

        <div class="sec">
            <h2>Блок 1 — Главный экран</h2>
            <div class="row"><label>Текст верхней полоски</label><input type="text" id="b1_top_bar_text" value="<?= htmlspecialchars($b1['top_bar_text'] ?? '') ?>"></div>
            <div class="row"><label>Текст LED-ленты</label><input type="text" id="b1_led_text" value="<?= htmlspecialchars($b1['led_text'] ?? '') ?>"></div>
            <div class="row"><label>Текст кнопки</label><input type="text" id="b1_cta_button_text" value="<?= htmlspecialchars($b1['cta_button_text'] ?? '') ?>"></div>
            <div class="row"><label>Главное фото (путь)</label><input type="text" id="b1_hero_image" value="<?= htmlspecialchars($b1['hero_image'] ?? '') ?>"></div>
            <p><small>Или загрузите новое (рекомендуемый размер: 1920×1080 px): <input type="file" id="upload_hero" accept="image/*"> <span id="hero_upload_status"></span></small></p>
        </div>

        <div class="sec">
            <h2>Блок 2 — О нас</h2>
            <div class="row"><label>Заголовок строка 1</label><input type="text" id="b2_title_line1" value="<?= htmlspecialchars($b2['title_line1'] ?? '') ?>"></div>
            <div class="row"><label>Заголовок строка 2</label><input type="text" id="b2_title_line2" value="<?= htmlspecialchars($b2['title_line2'] ?? '') ?>"></div>
            <div class="row"><label>Заголовок строка 3</label><input type="text" id="b2_title_line3" value="<?= htmlspecialchars($b2['title_line3'] ?? '') ?>"></div>
            <div class="row"><label>Текст 1</label><textarea id="b2_text1"><?= htmlspecialchars($b2['text1'] ?? '') ?></textarea></div>
            <div class="row"><label>Текст 2</label><textarea id="b2_text2"><?= htmlspecialchars($b2['text2'] ?? '') ?></textarea></div>
            <div class="row"><label>Текст 3</label><textarea id="b2_text3"><?= htmlspecialchars($b2['text3'] ?? '') ?></textarea></div>
            <div class="row"><label>Фото блока (путь)</label><input type="text" id="b2_image" value="<?= htmlspecialchars($b2Image) ?>"></div>
            <p><small>Или загрузите новое (рекомендуемый размер: 1200×1600 px): <input type="file" id="upload_b2_image" accept="image/*"> <span id="b2_image_upload_status"></span></small></p>
            <div class="row"><label>Alt фото</label><input type="text" id="b2_image_alt" value="<?= htmlspecialchars($b2ImageAlt) ?>"></div>
        </div>

        <div class="sec">
            <h2>Карусель (блок 3)</h2>
            <p>Порядок и подписи. Удаление: сохраните пустой alt и путь — или удалите элемент из списка ниже.</p>
            <div id="carousel_editor"></div>
            <p>Рекомендуемый размер фото в карусели: 1200×700 px. <input type="file" id="upload_carousel" accept="image/*"> <button type="button" id="add_carousel_btn">Добавить фото в карусель</button></p>
        </div>

        <div class="sec">
            <h2>Блок 3 — Текст и этапы</h2>
            <div class="row"><label>Заголовок</label><input type="text" id="b3_title" value="<?= htmlspecialchars($b3['title'] ?? '') ?>"></div>
            <div class="row"><label>Подзаголовок</label><input type="text" id="b3_subtitle" value="<?= htmlspecialchars($b3['subtitle'] ?? '') ?>"></div>
            <div class="row"><label>Этапы (через запятую)</label><input type="text" id="b3_workflow_steps" value="<?= htmlspecialchars(implode(', ', $b3['workflow_steps'] ?? [])) ?>"></div>
            <?php for ($i = 0; $i < 4; $i++): $item = $b3Gallery[$i] ?? ['src' => '', 'alt' => '']; ?>
            <div class="row"><label>Фото <?= $i + 1 ?> (путь)</label><input type="text" id="b3_bottom_image_<?= $i + 1 ?>" value="<?= htmlspecialchars($item['src'] ?? '') ?>"></div>
            <p><small>Или загрузите новое (рекомендуемый размер: 1920×1080 px): <input type="file" id="upload_b3_image_<?= $i + 1 ?>" data-slot="<?= $i + 1 ?>" accept="image/*"> <span id="b3_image_upload_status_<?= $i + 1 ?>"></span></small></p>
            <div class="row"><label>Alt фото <?= $i + 1 ?></label><input type="text" id="b3_bottom_image_alt_<?= $i + 1 ?>" value="<?= htmlspecialchars($item['alt'] ?? '') ?>"></div>
            <?php endfor; ?>
            <h2>Блок 3 — Мобильная галерея</h2>
            <?php for ($i = 0; $i < 6; $i++): $item = $b3MobileGallery[$i] ?? ['src' => '', 'alt' => '']; ?>
            <div class="row"><label>Мобильное фото <?= $i + 1 ?> (путь)</label><input type="text" id="b3_mobile_image_<?= $i + 1 ?>" value="<?= htmlspecialchars($item['src'] ?? '') ?>"></div>
            <p><small>Или загрузите новое (рекомендуемый размер: 1200×1800 px): <input type="file" id="upload_b3_mobile_image_<?= $i + 1 ?>" data-slot="<?= $i + 1 ?>" accept="image/*"> <span id="b3_mobile_image_upload_status_<?= $i + 1 ?>"></span></small></p>
            <div class="row"><label>Alt мобильного фото <?= $i + 1 ?></label><input type="text" id="b3_mobile_image_alt_<?= $i + 1 ?>" value="<?= htmlspecialchars($item['alt'] ?? '') ?>"></div>
            <?php endfor; ?>
        </div>

        <div class="sec">
            <h2>Блок 4 — Форма</h2>
            <div class="row"><label>Заголовок</label><input type="text" id="b4_title" value="<?= htmlspecialchars($b4['title'] ?? '') ?>"></div>
            <div class="row"><label>Текст над формой</label><textarea id="b4_form_intro"><?= htmlspecialchars($b4['form_intro'] ?? '') ?></textarea></div>
            <div class="row"><label>Текст кнопки отправки</label><input type="text" id="b4_submit_button_text" value="<?= htmlspecialchars($b4['submit_button_text'] ?? '') ?>"></div>
            <div class="row"><label>Текст разделяющей полосы</label><input type="text" id="b4_submit_banner_text" value="<?= htmlspecialchars($b4['submit_banner_text'] ?? '') ?>"></div>
        </div>

        <div class="sec">
            <h2>Блок 5 — Проекты</h2>
            <div class="row"><label>Заголовок блока</label><input type="text" id="b5_title" value="<?= htmlspecialchars($b5['title'] ?? '') ?>"></div>
            <div class="row"><label>Бегущая строка верх</label><input type="text" id="b5_marquee_top" value="<?= htmlspecialchars($b5['marquee_top'] ?? '') ?>"></div>
            <div class="row"><label>Бегущая строка низ</label><input type="text" id="b5_marquee_bottom" value="<?= htmlspecialchars($b5['marquee_bottom'] ?? '') ?>"></div>
            <div id="projects_editor"></div>
            <p><button type="button" id="add_project_btn">+ Добавить проект</button></p>
        </div>

        <div class="sec">
            <h2>Блок 6 — Instagram</h2>
            <div class="row"><label>Заголовок</label><input type="text" id="b6_title" value="<?= htmlspecialchars($b6['title'] ?? '') ?>"></div>
            <div class="row"><label>Подзаголовок</label><input type="text" id="b6_subtitle" value="<?= htmlspecialchars($b6['subtitle'] ?? '') ?>"></div>
            <div class="row"><label>Дисклеймер</label><textarea id="b6_disclaimer"><?= htmlspecialchars($b6['disclaimer'] ?? '') ?></textarea></div>
        </div>

        <div class="sec">
            <h2>Футер</h2>
            <div class="row"><label>Бренд</label><input type="text" id="footer_brand" value="<?= htmlspecialchars($footer['brand'] ?? '') ?>"></div>
            <div class="row"><label>Текст кредитов</label><input type="text" id="footer_credits" value="<?= htmlspecialchars($footer['credits'] ?? '') ?>"></div>
            <div class="row"><label>Ссылка кредитов</label><input type="url" id="footer_credits_link" value="<?= htmlspecialchars($footer['credits_link'] ?? '') ?>"></div>
            <div class="row"><label>Текст ссылки</label><input type="text" id="footer_credits_link_text" value="<?= htmlspecialchars($footer['credits_link_text'] ?? '') ?>"></div>
            <div class="row"><label>Год</label><input type="text" id="footer_year" value="<?= htmlspecialchars($footer['year'] ?? '') ?>"></div>
        </div>

        <div class="sec">
            <h2>Cookie-баннер</h2>
            <div class="row"><label>Текст до ссылки</label><textarea id="cookie_text_before"><?= htmlspecialchars($cookie['text_before'] ?? '') ?></textarea></div>
            <div class="row"><label>Текст ссылки</label><input type="text" id="cookie_link_text" value="<?= htmlspecialchars($cookie['link_text'] ?? '') ?>"></div>
            <div class="row"><label>Кнопка «Принять»</label><input type="text" id="cookie_accept" value="<?= htmlspecialchars($cookie['accept'] ?? '') ?>"></div>
            <div class="row"><label>Кнопка «Отказаться»</label><input type="text" id="cookie_decline" value="<?= htmlspecialchars($cookie['decline'] ?? '') ?>"></div>
        </div>

        <p><button type="submit">Сохранить всё</button></p>
    </form>

    <script>
    const carouselData = <?= json_encode($carousel) ?>;
    const projectsData = <?= json_encode($projects) ?>;

    function renderCarousel() {
        const container = document.getElementById('carousel_editor');
        container.innerHTML = carouselData.map((item, i) => `
            <div class="carousel-item" data-idx="${i}">
                <img class="thumb" src="../${item.src}" alt="" onerror="this.style.display='none'">
                <input type="text" placeholder="src" value="${escapeAttr(item.src || '')}" data-key="src" style="width:200px">
                <input type="text" placeholder="alt" value="${escapeAttr(item.alt || '')}" data-key="alt" style="width:150px">
                <button type="button" class="remove-carousel">✕</button>
            </div>
        `).join('');
        container.querySelectorAll('.remove-carousel').forEach(btn => {
            btn.addEventListener('click', function() {
                const i = parseInt(this.closest('.carousel-item').dataset.idx, 10);
                carouselData.splice(i, 1);
                renderCarousel();
            });
        });
        container.querySelectorAll('input[data-key]').forEach(inp => {
            inp.addEventListener('input', function() {
                const i = parseInt(this.closest('.carousel-item').dataset.idx, 10);
                const key = this.dataset.key;
                if (!carouselData[i]) carouselData[i] = {};
                carouselData[i][key] = this.value;
            });
        });
    }

    function escapeAttr(s) {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderProjects() {
        const container = document.getElementById('projects_editor');
        container.innerHTML = projectsData.map((proj, i) => {
            const gallery = proj.gallery || [];
            return `
            <div class="project-item" data-idx="${i}">
                <strong>Проект ${(proj.id || i + 1)}</strong>
                <div class="row"><label>Название</label><input type="text" class="proj-title" value="${escapeAttr(proj.title || '')}"></div>
                <div class="row"><label>Подпись в капсуле</label><input type="text" class="proj-badge-text" value="${escapeAttr(proj.badge_text || proj.title || '')}"></div>
                <div class="row"><label>Обложка (путь)</label><input type="text" class="proj-cover" value="${escapeAttr(proj.cover || '')}"></div>
                <p><small>Или загрузите новую обложку (рекомендуемый размер: 800×800 px): <input type="file" class="proj-cover-file" data-idx="${i}" accept="image/*"> <span class="proj-cover-status"></span></small></p>
                <div class="row"><label>Alt обложки</label><input type="text" class="proj-cover-alt" value="${escapeAttr(proj.cover_alt || '')}"></div>
                <p>Галерея (рекомендуемый размер фото: 1200×800 px): <input type="file" class="proj-gallery-file" data-idx="${i}" accept="image/*" multiple> <span class="proj-gallery-status"></span></p>
                <div class="project-gallery-list">${gallery.map((g, gi) => `<span><img class="thumb" src="../${g}" onerror="this.style.display='none'"> ${g} <button type="button" class="remove-gallery" data-pi="${i}" data-gi="${gi}">✕</button></span>`).join('')}</div>
                <button type="button" class="remove-project">Удалить проект</button>
            </div>
            `;
        }).join('');

        container.querySelectorAll('.proj-title').forEach(inp => {
            inp.addEventListener('input', function() {
                const i = parseInt(this.closest('.project-item').dataset.idx, 10);
                if (projectsData[i]) projectsData[i].title = this.value;
            });
        });
        container.querySelectorAll('.proj-badge-text').forEach(inp => {
            inp.addEventListener('input', function() {
                const i = parseInt(this.closest('.project-item').dataset.idx, 10);
                if (projectsData[i]) projectsData[i].badge_text = this.value;
            });
        });
        container.querySelectorAll('.proj-cover').forEach(inp => {
            inp.addEventListener('input', function() {
                const i = parseInt(this.closest('.project-item').dataset.idx, 10);
                if (projectsData[i]) projectsData[i].cover = this.value;
            });
        });
        container.querySelectorAll('.proj-cover-alt').forEach(inp => {
            inp.addEventListener('input', function() {
                const i = parseInt(this.closest('.project-item').dataset.idx, 10);
                if (projectsData[i]) projectsData[i].cover_alt = this.value;
            });
        });
        container.querySelectorAll('.remove-gallery').forEach(btn => {
            btn.addEventListener('click', function() {
                const pi = parseInt(this.dataset.pi, 10);
                const gi = parseInt(this.dataset.gi, 10);
                if (projectsData[pi] && projectsData[pi].gallery) {
                    projectsData[pi].gallery.splice(gi, 1);
                    renderProjects();
                }
            });
        });
        container.querySelectorAll('.remove-project').forEach(btn => {
            btn.addEventListener('click', function() {
                const i = parseInt(this.closest('.project-item').dataset.idx, 10);
                projectsData.splice(i, 1);
                renderProjects();
            });
        });

        container.querySelectorAll('.proj-cover-file').forEach(inp => {
            inp.addEventListener('change', function() {
                const idx = parseInt(this.dataset.idx, 10);
                const status = this.closest('.project-item').querySelector('.proj-cover-status');
                if (!this.files.length) return;
                status.textContent = 'Загрузка...';
                const formData = new FormData();
                formData.append('file', this.files[0]);
                formData.append('type', 'project_cover');
                formData.append('project_id', (projectsData[idx] && projectsData[idx].id) || (idx + 1));
                fetch('upload.php', { method: 'POST', body: formData })
                    .then(r => r.json())
                    .then(data => {
                        if (data.ok && projectsData[idx]) {
                            projectsData[idx].cover = data.path;
                            this.closest('.project-item').querySelector('.proj-cover').value = data.path;
                        }
                        status.textContent = data.ok ? 'Загружено' : (data.error || 'Ошибка');
                    })
                    .catch(() => { status.textContent = 'Ошибка'; });
                this.value = '';
            });
        });

        container.querySelectorAll('.proj-gallery-file').forEach(inp => {
            inp.addEventListener('change', function() {
                const idx = parseInt(this.dataset.idx, 10);
                const status = this.closest('.project-item').querySelector('.proj-gallery-status');
                const files = this.files;
                if (!files.length) return;
                status.textContent = 'Загрузка...';
                const formData = new FormData();
                formData.append('file', files[0]);
                formData.append('type', 'project_gallery');
                formData.append('project_id', (projectsData[idx] && projectsData[idx].id) || (idx + 1));
                fetch('upload.php', { method: 'POST', body: formData })
                    .then(r => r.json())
                    .then(data => {
                        if (data.ok && projectsData[idx]) {
                            if (!projectsData[idx].gallery) projectsData[idx].gallery = [];
                            projectsData[idx].gallery.push(data.path);
                            renderProjects();
                        }
                        status.textContent = data.ok ? 'Загружено' : (data.error || 'Ошибка');
                    })
                    .catch(() => { status.textContent = 'Ошибка'; });
                this.value = '';
            });
        });
    }

    document.getElementById('add_carousel_btn').addEventListener('click', function() {
        const input = document.getElementById('upload_carousel');
        if (!input.files.length) { alert('Выберите файл'); return; }
        const formData = new FormData();
        formData.append('file', input.files[0]);
        formData.append('type', 'carousel');
        const status = document.getElementById('hero_upload_status');
        status.textContent = 'Загрузка...';
        fetch('upload.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.ok) {
                    carouselData.push({ src: data.path, alt: '' });
                    renderCarousel();
                }
                status.textContent = data.ok ? 'Добавлено' : (data.error || 'Ошибка');
            })
            .catch(() => { status.textContent = 'Ошибка'; });
        input.value = '';
    });

    document.getElementById('upload_hero').addEventListener('change', function() {
        if (!this.files.length) return;
        const formData = new FormData();
        formData.append('file', this.files[0]);
        formData.append('type', 'hero');
        const status = document.getElementById('hero_upload_status');
        status.textContent = 'Загрузка...';
        fetch('upload.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.ok) document.getElementById('b1_hero_image').value = data.path;
                status.textContent = data.ok ? 'Загружено' : (data.error || 'Ошибка');
            })
            .catch(() => { status.textContent = 'Ошибка'; });
        this.value = '';
    });

    document.getElementById('upload_og_image').addEventListener('change', function() {
        if (!this.files.length) return;
        const formData = new FormData();
        formData.append('file', this.files[0]);
        formData.append('type', 'og_image');
        const status = document.getElementById('og_image_upload_status');
        status.textContent = 'Загрузка...';
        fetch('upload.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.ok) document.getElementById('seo_og_image').value = data.path;
                status.textContent = data.ok ? 'Загружено' : (data.error || 'Ошибка');
            })
            .catch(() => { status.textContent = 'Ошибка'; });
        this.value = '';
    });

    document.getElementById('upload_b2_image').addEventListener('change', function() {
        if (!this.files.length) return;
        const formData = new FormData();
        formData.append('file', this.files[0]);
        formData.append('type', 'block2_image');
        const status = document.getElementById('b2_image_upload_status');
        status.textContent = 'Загрузка...';
        fetch('upload.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.ok) document.getElementById('b2_image').value = data.path;
                status.textContent = data.ok ? 'Загружено' : (data.error || 'Ошибка');
            })
            .catch(() => { status.textContent = 'Ошибка'; });
        this.value = '';
    });

    document.querySelectorAll('input[id^="upload_b3_image_"]').forEach(function(input) {
        input.addEventListener('change', function() {
            if (!this.files.length) return;
            const slot = this.dataset.slot;
            const formData = new FormData();
            formData.append('file', this.files[0]);
            formData.append('type', 'block3_image');
            formData.append('slot', slot);
            const status = document.getElementById(`b3_image_upload_status_${slot}`);
            status.textContent = 'Загрузка...';
            fetch('upload.php', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    if (data.ok) document.getElementById(`b3_bottom_image_${slot}`).value = data.path;
                    status.textContent = data.ok ? 'Загружено' : (data.error || 'Ошибка');
                })
                .catch(() => { status.textContent = 'Ошибка'; });
            this.value = '';
        });
    });

    document.querySelectorAll('input[id^="upload_b3_mobile_image_"]').forEach(function(input) {
        input.addEventListener('change', function() {
            if (!this.files.length) return;
            const slot = this.dataset.slot;
            const formData = new FormData();
            formData.append('file', this.files[0]);
            formData.append('type', 'block3_mobile_image');
            formData.append('slot', slot);
            const status = document.getElementById(`b3_mobile_image_upload_status_${slot}`);
            status.textContent = 'Загрузка...';
            fetch('upload.php', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    if (data.ok) document.getElementById(`b3_mobile_image_${slot}`).value = data.path;
                    status.textContent = data.ok ? 'Загружено' : (data.error || 'Ошибка');
                })
                .catch(() => { status.textContent = 'Ошибка'; });
            this.value = '';
        });
    });

    document.getElementById('add_project_btn').addEventListener('click', function() {
        const newId = projectsData.length ? Math.max(...projectsData.map(p => p.id || 0)) + 1 : 1;
        projectsData.push({
            id: newId,
            title: 'Новый проект',
            badge_text: 'Новый проект',
            cover: '',
            cover_alt: '',
            gallery: []
        });
        renderProjects();
    });

    document.getElementById('mainForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const workflowStr = document.getElementById('b3_workflow_steps').value;
        const workflow_steps = workflowStr ? workflowStr.split(',').map(s => s.trim()).filter(Boolean) : [];

        const block3Gallery = [1, 2, 3, 4].map(function(slot) {
            return {
                src: document.getElementById(`b3_bottom_image_${slot}`).value,
                alt: document.getElementById(`b3_bottom_image_alt_${slot}`).value
            };
        }).filter(function(item) {
            return item.src || item.alt;
        });

        const block3MobileGallery = [1, 2, 3, 4, 5, 6].map(function(slot) {
            return {
                src: document.getElementById(`b3_mobile_image_${slot}`).value,
                alt: document.getElementById(`b3_mobile_image_alt_${slot}`).value
            };
        }).filter(function(item) {
            return item.src || item.alt;
        });

        const content = {
            seo: {
                title: document.getElementById('seo_title').value,
                description: document.getElementById('seo_description').value,
                keywords: document.getElementById('seo_keywords').value,
                og_title: document.getElementById('seo_og_title').value,
                og_description: document.getElementById('seo_og_description').value,
                og_image: document.getElementById('seo_og_image').value,
                twitter_title: document.getElementById('seo_twitter_title').value,
                twitter_description: document.getElementById('seo_twitter_description').value,
                twitter_image: document.getElementById('seo_og_image').value,
                schema_name: document.getElementById('seo_schema_name').value,
                schema_description: document.getElementById('seo_schema_description').value,
                schema_telephone: document.getElementById('seo_schema_telephone').value,
                schema_address: document.getElementById('seo_schema_address').value,
                schema_priceRange: '$$$',
                schema_openingHours: 'Mo-Su 09:00-21:00',
                schema_instagram: document.getElementById('seo_schema_instagram').value
            },
            block1: {
                top_bar_text: document.getElementById('b1_top_bar_text').value,
                led_text: document.getElementById('b1_led_text').value,
                cta_button_text: document.getElementById('b1_cta_button_text').value,
                hero_image: document.getElementById('b1_hero_image').value
            },
            block2: {
                title_line1: document.getElementById('b2_title_line1').value,
                title_line2: document.getElementById('b2_title_line2').value,
                title_line3: document.getElementById('b2_title_line3').value,
                text1: document.getElementById('b2_text1').value,
                text2: document.getElementById('b2_text2').value,
                text3: document.getElementById('b2_text3').value,
                image: document.getElementById('b2_image').value,
                image_alt: document.getElementById('b2_image_alt').value
            },
            carousel: carouselData,
            block3: {
                title: document.getElementById('b3_title').value,
                subtitle: document.getElementById('b3_subtitle').value,
                workflow_steps: workflow_steps,
                bottom_gallery: block3Gallery,
                bottom_gallery_mobile: block3MobileGallery
            },
            block4: {
                title: document.getElementById('b4_title').value,
                form_intro: document.getElementById('b4_form_intro').value,
                submit_button_text: document.getElementById('b4_submit_button_text').value,
                submit_banner_text: document.getElementById('b4_submit_banner_text').value
            },
            block5: {
                title: document.getElementById('b5_title').value,
                marquee_top: document.getElementById('b5_marquee_top').value,
                marquee_bottom: document.getElementById('b5_marquee_bottom').value,
                projects: projectsData
            },
            block6: {
                title: document.getElementById('b6_title').value,
                subtitle: document.getElementById('b6_subtitle').value,
                disclaimer: document.getElementById('b6_disclaimer').value
            },
            footer: {
                brand: document.getElementById('footer_brand').value,
                credits: document.getElementById('footer_credits').value,
                credits_link: document.getElementById('footer_credits_link').value,
                credits_link_text: document.getElementById('footer_credits_link_text').value,
                year: document.getElementById('footer_year').value
            },
            cookie: {
                text_before: document.getElementById('cookie_text_before').value,
                link_text: document.getElementById('cookie_link_text').value,
                accept: document.getElementById('cookie_accept').value,
                decline: document.getElementById('cookie_decline').value
            }
        };
        document.getElementById('content_json').value = JSON.stringify(content);
        this.submit();
    });

    renderCarousel();
    renderProjects();
    </script>
</body>
</html>
