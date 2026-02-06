/**
 * Загружает контент из data/content.json и заполняет страницу.
 * По завершении вызывает событие contentReady для инициализации галереи проектов.
 */
(function() {
    'use strict';

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

        // Блок 2: заголовок из трёх строк
        if (data.block2) {
            var titleEl = document.querySelector('.block-2-title');
            if (titleEl && data.block2.title_line1) {
                titleEl.innerHTML = (data.block2.title_line1 + '<br>') + (data.block2.title_line2 + '<br>') + (data.block2.title_line3 || '');
            }
        }

        // Карусель
        var carouselTrack = document.querySelector('.carousel-track');
        if (carouselTrack && data.carousel && data.carousel.length) {
            carouselTrack.innerHTML = '';
            var items = data.carousel.concat(data.carousel);
            items.forEach(function(item) {
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
                div.innerHTML = '<img src="' + escapeAttr(cover) + '" alt="' + escapeAttr(coverAlt) + '" class="project-cover" loading="lazy">' +
                    '<p class="project-caption">' + escapeHtml(title) + '</p>';
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

    var dataUrl = 'data/content.json';
    fetch(dataUrl)
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
            applyContent(data);
            document.dispatchEvent(new CustomEvent('contentReady', { detail: data }));
        })
        .catch(function() {
            document.dispatchEvent(new CustomEvent('contentReady', { detail: null }));
        });
})();
