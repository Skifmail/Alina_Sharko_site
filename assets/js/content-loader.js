/**
 * Загружает контент из data/content.json и заполняет страницу.
 * По завершении вызывает событие contentReady для инициализации галереи проектов.
 */
(function() {
    'use strict';

    var lastContentData = null;
    var lastBlock3GalleryMode = null;

    function get(obj, path) {
        return path.split('.').reduce(function(o, k) { return o && o[k]; }, obj);
    }

    function setMeta(nameOrProp, content, isProperty) {
        var attr = isProperty ? 'property' : 'name';
        var el = document.querySelector('meta[' + attr + '="' + nameOrProp + '"]');
        if (el) el.setAttribute('content', content);
    }

    function applyContent(data) {
        if (!data) return;

        var baseUrl = document.querySelector('link[rel="canonical"]');
        baseUrl = baseUrl ? baseUrl.getAttribute('href').replace(/\/?$/, '') : '';

        // SEO
        if (data.seo) {
            document.title = data.seo.title || document.title;
            setMeta('description', data.seo.description);
            setMeta('keywords', data.seo.keywords);
            setMeta('og:title', data.seo.og_title, true);
            setMeta('og:description', data.seo.og_description, true);
            setMeta('og:image', baseUrl ? baseUrl + '/' + data.seo.og_image : data.seo.og_image, true);
            setMeta('twitter:title', data.seo.twitter_title);
            setMeta('twitter:description', data.seo.twitter_description);
            setMeta('twitter:image', baseUrl ? baseUrl + '/' + (data.seo.twitter_image || data.seo.og_image) : (data.seo.twitter_image || data.seo.og_image));
            var schemaScript = document.querySelector('script[type="application/ld+json"]');
            if (schemaScript && data.seo) {
                var schema = {
                    '@context': 'https://schema.org',
                    '@type': 'LocalBusiness',
                    'name': data.seo.schema_name,
                    'description': data.seo.schema_description,
                    'url': baseUrl,
                    'telephone': data.seo.schema_telephone,
                    'address': { '@type': 'PostalAddress', 'addressLocality': data.seo.schema_address, 'addressCountry': 'RU' },
                    'image': baseUrl ? baseUrl + '/' + (data.seo.og_image || '') : data.seo.og_image,
                    'priceRange': data.seo.schema_priceRange || '$$$',
                    'openingHours': data.seo.schema_openingHours || 'Mo-Su 09:00-21:00',
                    'sameAs': data.seo.schema_instagram ? [data.seo.schema_instagram] : []
                };
                schemaScript.textContent = JSON.stringify(schema);
            }
        }

        // Тексты и изображения по data-content / data-content-src
        document.querySelectorAll('[data-content]').forEach(function(el) {
            var v = get(data, el.getAttribute('data-content'));
            if (v != null && v !== '') el.textContent = v;
        });
        document.querySelectorAll('[data-content-src]').forEach(function(el) {
            var v = get(data, el.getAttribute('data-content-src'));
            if (v) el.src = v;
        });
        document.querySelectorAll('[data-content-alt]').forEach(function(el) {
            var v = get(data, el.getAttribute('data-content-alt'));
            if (v != null) el.alt = v;
        });
        document.querySelectorAll('[data-content-href]').forEach(function(el) {
            var v = get(data, el.getAttribute('data-content-href'));
            if (v) el.href = v;
        });

        // Hero background (путь в кавычках на случай пробелов)
        var heroSection = document.querySelector('.hero-section');
        if (heroSection && data.block1 && data.block1.hero_image) {
            heroSection.style.backgroundImage = "url('" + String(data.block1.hero_image).replace(/'/g, "%27") + "')";
        }

        // Блок 2: заголовок из трёх строк с акцентными словами
        if (data.block2) {
            var titleEl = document.querySelector('.block-2-title');
            if (titleEl && data.block2.title_line1) {
                titleEl.innerHTML = [
                    buildAccentLine(data.block2.title_line1, 'КТО'),
                    buildAccentLine(data.block2.title_line2, 'МЫ'),
                    buildAccentLine(data.block2.title_line3 || '', 'КУДА')
                ].join('<br>');
            }
        }

        // Блок 3: заголовок с акцентом на первом слове
        if (data.block3) {
            var block3TitleEl = document.querySelector('.block-3-title');
            if (block3TitleEl && data.block3.title) {
                var titleParts = String(data.block3.title).trim().split(/\s+/);
                var accentWord = titleParts.shift() || '';
                var otherWords = titleParts.join(' ');
                block3TitleEl.innerHTML =
                    '<span class="title-word-italic">' + escapeHtml(accentWord) + '</span>' +
                    (otherWords ? ' <span class="title-word-regular">' + escapeHtml(otherWords) + '</span>' : '');
            }
        }

        // Блок 4: заголовок с акцентом на первом слове
        if (data.block4) {
            var block4TitleEl = document.querySelector('.block-4-title');
            if (block4TitleEl && data.block4.title) {
                var block4TitleParts = String(data.block4.title).trim().split(/\s+/);
                var block4AccentWord = block4TitleParts.shift() || '';
                var block4OtherWords = block4TitleParts.join(' ');
                block4TitleEl.innerHTML =
                    '<span class="title-word-italic">' + escapeHtml(block4AccentWord) + '</span>' +
                    (block4OtherWords ? ' <span class="title-word-regular">' + escapeHtml(block4OtherWords) + '</span>' : '');
            }
        }

        // Блок 5: заголовок с акцентом на слове "РЕАЛЬНЫЕ"
        if (data.block5) {
            var block5TitleEl = document.querySelector('.block-5-title');
            if (block5TitleEl && data.block5.title) {
                block5TitleEl.innerHTML = buildAccentLine(data.block5.title, 'РЕАЛЬНЫЕ');
            }
        }

        // Блок 6: заголовок с курсивной второй частью
        if (data.block6) {
            var block6TitleEl = document.querySelector('.instagram-title-link');
            if (block6TitleEl && data.block6.title) {
                var block6Title = String(data.block6.title).trim();
                var block6TitleHtml = block6Title;
                if (block6Title.indexOf(' ') !== -1) {
                    var firstSpaceIndex = block6Title.indexOf(' ');
                    var firstPart = block6Title.slice(0, firstSpaceIndex);
                    var secondPart = block6Title.slice(firstSpaceIndex + 1);
                    block6TitleHtml =
                        '<span class="title-word-regular">' + escapeHtml(firstPart) + '</span> ' +
                        '<span class="title-word-italic">' + escapeHtml(secondPart) + '</span>';
                } else {
                    block6TitleHtml = '<span class="title-word-italic">' + escapeHtml(block6Title) + '</span>';
                }
                block6TitleEl.innerHTML = block6TitleHtml;
            }
        }

        // Карусель
        var carouselTrack = document.querySelector('.carousel-track');
        if (carouselTrack && data.carousel && data.carousel.length) {
            carouselTrack.innerHTML = '';
            data.carousel.forEach(function(item) {
                var img = document.createElement('img');
                img.src = item.src || item;
                img.alt = (item.alt != null) ? item.alt : '';
                img.className = 'carousel-image';
                img.loading = 'lazy';
                carouselTrack.appendChild(img);
            });
        }

        // Блок 3: этапы (workflow)
        if (data.block3 && data.block3.workflow_steps && data.block3.workflow_steps.length) {
            var workflowEl = document.querySelector('.block-3-workflow');
            if (workflowEl) {
                var parts = [];
                data.block3.workflow_steps.forEach(function(step, i) {
                    parts.push('<span class="workflow-step">' + escapeHtml(step) + '</span>');
                    if (i < data.block3.workflow_steps.length - 1) {
                        parts.push('<span class="workflow-arrow">→</span>');
                    }
                });
                workflowEl.innerHTML = parts.join('');
            }
        }

        // Блок 3: нижняя галерея
        renderBlock3Gallery(data.block3);

        // Блок 5: проекты
        var projectsGrid = document.querySelector('.projects-grid');
        if (projectsGrid && data.block5 && data.block5.projects && data.block5.projects.length) {
            projectsGrid.innerHTML = '';
            data.block5.projects.forEach(function(proj) {
                var id = proj.id || 0;
                var div = document.createElement('div');
                div.className = 'project-item';
                div.setAttribute('data-project', String(id));
                var cover = proj.cover || '';
                var coverAlt = proj.cover_alt || ('Проект ' + id);
                var title = proj.title || ('Проект ' + id);
                var badgeText = proj.badge_text || title;
                div.innerHTML = '<img src="' + escapeAttr(cover) + '" alt="' + escapeAttr(coverAlt) + '" class="project-cover" loading="lazy">' +
                    '<div class="project-badge">' + escapeHtml(badgeText) + '</div>';
                projectsGrid.appendChild(div);
            });
            window.__contentProjects = data.block5.projects;
        }
    }

    function escapeHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }
    function escapeAttr(s) {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function buildAccentLine(line, accentWord) {
        var value = String(line || '');
        if (!value) return '';

        var escapedLine = escapeHtml(value);
        var escapedAccent = escapeHtml(String(accentWord || ''));
        var pattern = new RegExp('(^|\\s)(' + escapedAccent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=\\s|$|[!?.,:;])');
        var replaced = escapedLine.replace(pattern, function(match, prefix, word) {
            return prefix + '</span> <span class="title-word-italic">' + word + '</span> <span class="title-word-regular">';
        });

        return '<span class="title-word-regular">' + replaced + '</span>';
    }

    function buildBlock3FallbackGallery(block3) {
        var items = [];
        if (block3.bottom_image) {
            items.push({
                src: block3.bottom_image,
                alt: block3.bottom_image_alt || 'Фото блока 3'
            });
        }
        return items;
    }

    function renderBlock3Gallery(block3) {
        if (!block3) return;

        var block3Track = document.querySelector('.block-3-bottom-track');
        var block3Counter = document.querySelector('.block-3-gallery-counter');
        var isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
        var desktopGallery = Array.isArray(block3.bottom_gallery) && block3.bottom_gallery.length
            ? block3.bottom_gallery
            : buildBlock3FallbackGallery(block3);
        var mobileGallery = Array.isArray(block3.bottom_gallery_mobile) && block3.bottom_gallery_mobile.length
            ? block3.bottom_gallery_mobile
            : desktopGallery;
        var galleryItems = isMobileViewport ? mobileGallery : desktopGallery;

        lastBlock3GalleryMode = isMobileViewport ? 'mobile' : 'desktop';

        if (block3Track && galleryItems.length) {
            block3Track.innerHTML = '';
            galleryItems.forEach(function(item, index) {
                var slide = document.createElement('div');
                slide.className = 'block-3-bottom-image';
                slide.innerHTML =
                    '<img src="' + escapeAttr(item.src || '') + '" alt="' + escapeAttr(item.alt || ('Фото ' + (index + 1))) + '" loading="lazy">';
                block3Track.appendChild(slide);
            });
            block3Track.setAttribute('data-total', String(galleryItems.length));
            block3Track.setAttribute('data-index', '0');
            block3Track.style.transform = 'translateX(0)';
            if (block3Counter) {
                block3Counter.textContent = '1 / ' + galleryItems.length;
            }
        }
    }

    var dataUrl = 'data/content.json';
    fetch(dataUrl)
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
            lastContentData = data;
            applyContent(data);
            document.dispatchEvent(new CustomEvent('contentReady', { detail: data }));
        })
        .catch(function() {
            document.dispatchEvent(new CustomEvent('contentReady', { detail: null }));
        });

    window.addEventListener('resize', function() {
        if (!lastContentData || !lastContentData.block3) return;
        var currentMode = window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
        if (currentMode !== lastBlock3GalleryMode) {
            renderBlock3Gallery(lastContentData.block3);
            document.dispatchEvent(new CustomEvent('block3GalleryReady', { detail: lastContentData.block3 }));
        }
    });
})();
