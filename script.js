async function sendLeadRequest(formData) {
    const response = await fetch('send-request.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });

    let responseData = null;
    try {
        responseData = await response.json();
    } catch (error) {
        console.error('Не удалось прочитать ответ сервера:', error);
    }

    if (!response.ok || !responseData?.ok) {
        const errorMessage = responseData?.error || 'Не удалось отправить заявку';
        throw new Error(errorMessage);
    }

    return responseData;
}

// Плавная прокрутка к форме обратной связи
function scrollToForm() {
    const form = document.getElementById('block-4');
    if (form) {
        form.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // УПРАВЛЕНИЕ НАВИГАЦИОННОЙ ПАНЕЛЬЮ
    // ============================================
    const topNavigation = document.querySelector('.top-navigation');
    const navToggle = document.querySelector('.nav-toggle');
    const topBar = document.querySelector('.top-bar');
    const firstBlock = document.getElementById('block-1');
    const mobileNavBreakpoint = window.matchMedia('(max-width: 768px)');

    function closeMobileNav() {
        if (!topNavigation || !navToggle) return;
        topNavigation.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Открыть меню');
    }

    function toggleMobileNav() {
        if (!topNavigation || !navToggle) return;
        const isOpen = topNavigation.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    }
    
    // Панель всегда видимая и закреплена сверху.
    if (topNavigation) {
        topNavigation.classList.add('nav-at-top');
    }

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            toggleMobileNav();
        });
    }

    mobileNavBreakpoint.addEventListener('change', function(event) {
        if (!event.matches) {
            closeMobileNav();
        }
        updateTopBarVisibility();
    });
    
    // ============================================
    // ПЛАВНАЯ ПРОКРУТКА И АКТИВНЫЙ РАЗДЕЛ В НАВИГАЦИИ
    // ============================================
    const navLinks = document.querySelectorAll('.nav-btn');
    const sections = [];

    navLinks.forEach(link => {
        const targetId = link.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;

        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        sections.push(targetSection);
    });

    function setActiveNavButton(sectionId) {
        navLinks.forEach(link => {
            link.classList.toggle('nav-btn-active', link.getAttribute('href') === `#${sectionId}`);
        });
    }

    function updateActiveSection() {
        if (!sections.length) return;

        const navHeight = topNavigation ? topNavigation.offsetHeight : 0;
        const scrollPosition = window.scrollY + navHeight + 1;

        let activeSection = sections[0];

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const rect = section.getBoundingClientRect();
            const top = window.scrollY + rect.top;
            const bottom = top + section.offsetHeight;

            if (scrollPosition >= top && scrollPosition < bottom) {
                activeSection = section;
                break;
            }
        }

        setActiveNavButton(activeSection.id);
    }

    if (sections.length > 0) {
        updateActiveSection();
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }

            if (mobileNavBreakpoint.matches) {
                closeMobileNav();
            }
        });
    });
    
    window.addEventListener('scroll', updateActiveSection);

    function updateTopBarVisibility() {
        if (!topBar || !firstBlock) return;

        if (mobileNavBreakpoint.matches) {
            topBar.classList.remove('top-bar-hidden');
            return;
        }

        const navHeight = topNavigation ? topNavigation.offsetHeight : 0;
        const blockBottom = firstBlock.getBoundingClientRect().bottom;
        const shouldHideTopBar = blockBottom <= navHeight;

        topBar.classList.toggle('top-bar-hidden', shouldHideTopBar);
    }

    requestAnimationFrame(updateTopBarVisibility);
    window.addEventListener('scroll', updateTopBarVisibility, { passive: true });
    window.addEventListener('resize', updateTopBarVisibility);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileNav();
        }
    });

    // ============================================
    // COOKIE CONSENT BANNER
    // ============================================
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAccept = document.getElementById('cookie-accept');
    const cookieDecline = document.getElementById('cookie-decline');
    
    // Проверяем, было ли уже получено согласие
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    // Если согласие не получено, показываем баннер
    if (!cookieConsent) {
        cookieBanner.classList.add('show');
    }
    
    // Обработка принятия cookies
    cookieAccept.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.remove('show');
        // Здесь можно включить аналитику, если она есть
        console.log('Cookies accepted');
    });
    
    // Обработка отказа от cookies
    cookieDecline.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'declined');
        cookieBanner.classList.remove('show');
        // Отключаем cookies и аналитику
        console.log('Cookies declined');
        // Очищаем все возможные cookies
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    });

    // ============================================
    // ОБРАБОТКА ОТПРАВКИ ФОРМЫ
    // ============================================
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Получаем данные формы
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            
            // Здесь будет отправка данных на сервер
            console.log('Данные формы:', formData);
            
            // Показываем сообщение об успешной отправке
            alert('Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.');
            
            // Очищаем форму
            contactForm.reset();
        });
    }
    
    // Дублирование текста бегущей строки для бесшовной анимации
    const marquee = document.querySelector('.marquee');
    if (marquee) {
        const marqueeContent = marquee.innerHTML;
        marquee.innerHTML = marqueeContent + marqueeContent;
    }
    
    // Добавляем анимацию появления при прокрутке (опционально)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Наблюдаем за блоками (для будущих блоков)
    document.querySelectorAll('.block-2, .block-3, .contact-section').forEach(block => {
        observer.observe(block);
    });
});

// Валидация телефона (только цифры и символы +, -, (, ))
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value;
            // Разрешаем только цифры, +, -, (, ), пробелы
            e.target.value = value.replace(/[^0-9+\-() ]/g, '');
        });
    }
});

// ============================================
// БЛОК 3: КАРУСЕЛЬ И МОДАЛЬНОЕ ОКНО
// ============================================

// Модальное окно для просмотра изображений карусели (делегирование — карусель заполняется из JSON)
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.modal-close');
    const carouselContainer = document.querySelector('.carousel-container');

    if (carouselContainer) {
        carouselContainer.addEventListener('click', function(e) {
            const img = e.target.closest('.carousel-image');
            if (!img || !modal || !modalImg) return;
            e.stopPropagation();
            modal.style.display = 'block';
            modalImg.src = img.src;
            modalImg.alt = img.alt || '';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Закрытие по клику на крестик
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Закрытие по клику вне изображения
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// ============================================
// БЛОК 4: ФОРМА ОБРАТНОЙ СВЯЗИ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const mainForm = document.getElementById('mainContactForm');
    const phoneInput = document.getElementById('phone');
    const dateInput = document.getElementById('eventDate');
    const emailInput = document.getElementById('email');
    const budgetInput = document.getElementById('budget');
    const commentsInput = document.getElementById('comments');
    const consentCheckbox = document.getElementById('consent');
    const consentTelegramCheckbox = document.getElementById('consentTelegram');
    const submitButton = document.querySelector('.submit-cta-button');
    const calendarIcon = document.querySelector('.calendar-icon');

    // Прогресс-бар для формы
    const progressFill = document.getElementById('formProgressFill');
    const progressPercent = document.getElementById('formProgressPercent');

    function updateFormProgress() {
        if (!progressFill || !progressPercent) return;

        // Обязательные поля: телефон, дата, email, бюджет, согласие на обработку, согласие на передачу
        const requiredFields = [
            { element: phoneInput, minLength: 18 }, // +7 (000) 000-00-00
            { element: dateInput, minLength: 10 },  // ДД.ММ.ГГГГ
            { element: emailInput, minLength: 5 },
            { element: budgetInput, minLength: 1 },
            { element: consentCheckbox, type: 'checkbox' },
            { element: consentTelegramCheckbox, type: 'checkbox' }
        ];

        let filledCount = 0;
        requiredFields.forEach(field => {
            if (field.type === 'checkbox') {
                if (field.element && field.element.checked) {
                    filledCount++;
                }
            } else {
                if (field.element && field.element.value.length >= field.minLength) {
                    filledCount++;
                }
            }
        });

        const progress = Math.round((filledCount / requiredFields.length) * 100);
        progressFill.style.width = progress + '%';
        progressPercent.textContent = progress;
    }

    // Отслеживание изменений во всех полях формы
    if (phoneInput) phoneInput.addEventListener('input', updateFormProgress);
    if (dateInput) dateInput.addEventListener('input', updateFormProgress);
    if (emailInput) emailInput.addEventListener('input', updateFormProgress);
    if (budgetInput) budgetInput.addEventListener('input', updateFormProgress);
    if (consentCheckbox) consentCheckbox.addEventListener('change', updateFormProgress);
    if (consentTelegramCheckbox) consentTelegramCheckbox.addEventListener('change', updateFormProgress);

    // Инициальная проверка
    updateFormProgress();

    // Маска для телефона +7 (000) 000-00-00
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (!value.startsWith('7')) {
                value = '7' + value;
            }
            
            value = value.substring(0, 11);
            
            let formatted = '+7';
            if (value.length > 1) {
                formatted += ' (' + value.substring(1, 4);
            }
            if (value.length >= 5) {
                formatted += ') ' + value.substring(4, 7);
            }
            if (value.length >= 8) {
                formatted += '-' + value.substring(7, 9);
            }
            if (value.length >= 10) {
                formatted += '-' + value.substring(9, 11);
            }
            
            e.target.value = formatted;
        });

        phoneInput.addEventListener('focus', function(e) {
            if (!e.target.value) {
                e.target.value = '+7 (';
            }
        });
    }

    // Простой datepicker для даты мероприятия
    if (dateInput) {
        // Создаем input type="date" и скрываем его
        const hiddenDateInput = document.createElement('input');
        hiddenDateInput.type = 'date';
        hiddenDateInput.style.position = 'absolute';
        hiddenDateInput.style.opacity = '0';
        hiddenDateInput.style.pointerEvents = 'none';
        
        // Устанавливаем минимальную дату (сегодня)
        const today = new Date().toISOString().split('T')[0];
        hiddenDateInput.min = today;
        
        dateInput.parentElement.appendChild(hiddenDateInput);

        // Открытие календаря по клику на иконку
        calendarIcon.addEventListener('click', function() {
            hiddenDateInput.showPicker();
        });

        // Открытие календаря по клику на поле
        dateInput.addEventListener('click', function() {
            hiddenDateInput.showPicker();
        });

        // Обновление видимого поля при выборе даты
        hiddenDateInput.addEventListener('change', function() {
            const date = new Date(this.value);
            const formatted = date.toLocaleDateString('ru-RU');
            dateInput.value = formatted;
        });

        // Ручной ввод даты с валидацией
        dateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                value = value.substring(0, 2) + '.' + value.substring(2);
            }
            if (value.length >= 5) {
                value = value.substring(0, 5) + '.' + value.substring(5, 9);
            }
            
            e.target.value = value.substring(0, 10);
        });

        dateInput.addEventListener('blur', function() {
            const value = this.value;
            if (value.length === 10) {
                const parts = value.split('.');
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    const date = new Date(year, month, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (date < today) {
                        alert('Дата мероприятия не может быть в прошлом');
                        this.value = '';
                    }
                }
            }
        });
    }

    // Валидация email
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && !emailRegex.test(email)) {
                this.style.borderColor = '#ff0000';
                alert('Пожалуйста, введите корректный email');
            } else {
                this.style.borderColor = '#e0e0e0';
            }
        });
    }

    // Валидация бюджета
    if (budgetInput) {
        budgetInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value) {
                value = parseInt(value).toLocaleString('ru-RU');
                e.target.value = value + ' ₽';
            } else {
                e.target.value = '';
            }
        });

        budgetInput.addEventListener('blur', function() {
            const value = this.value.replace(/\D/g, '');
            const budget = parseInt(value);
            
            if (budget && budget < 300000) {
                this.style.borderColor = '#ff0000';
                alert('Минимальный бюджет - 300 000 рублей');
                this.value = '';
            } else {
                this.style.borderColor = '#e0e0e0';
            }
        });
    }

    // Проверка согласия перед отправкой
    if (mainForm) {
        mainForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!consentCheckbox.checked) {
                alert('Необходимо дать согласие на обработку персональных данных');
                return;
            }
            if (!consentTelegramCheckbox.checked) {
                alert('Необходимо дать согласие на передачу персональных данных с использованием мессенджера Telegram');
                return;
            }

            // Валидация бюджета
            const budgetValue = budgetInput.value.replace(/\D/g, '');
            if (parseInt(budgetValue) < 300000) {
                alert('Минимальный бюджет - 300 000 рублей');
                return;
            }

            // Показываем индикатор загрузки
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'ОТПРАВКА...';
            submitButton.style.opacity = '0.7';

            // Сбор данных формы
            const formData = {
                phone: phoneInput.value,
                eventDate: dateInput.value,
                email: emailInput.value,
                budget: budgetValue,
                comments: commentsInput.value
            };

            console.log('Данные формы:', formData);
            
            try {
                await sendLeadRequest(formData);
                
                alert('Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.');
                
                // Очистка формы
                mainForm.reset();
            } catch (error) {
                alert(`Произошла ошибка при отправке: ${error.message}`);
                console.error('Ошибка отправки формы:', error);
            } finally {
                // Восстанавливаем кнопку
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                submitButton.style.opacity = '1';
            }
        });
    }

    // ============================================
    // ГАЛЕРЕЯ ПРОЕКТОВ (БЛОК 5) — данные из content.json (contentReady)
    // ============================================
    
    const galleryModal = document.getElementById('project-gallery-modal');
    const galleryImage = document.getElementById('gallery-image');
    const galleryClose = document.querySelector('.gallery-close');
    const galleryPrev = document.querySelector('.gallery-prev');
    const galleryNext = document.querySelector('.gallery-next');
    const galleryCounter = document.querySelector('.gallery-counter');
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryGridView = document.getElementById('gallery-grid-view');
    const galleryFullscreenView = document.getElementById('gallery-fullscreen-view');
    const backToGridBtn = document.querySelector('.back-to-grid-btn');
    
    let currentProject = null;
    let currentImageIndex = 0;
    let projectImages = [];

    function lockBodyScroll() {
        document.body.style.overflow = 'hidden';
    }

    function unlockBodyScroll() {
        document.body.style.overflow = '';
    }

    function resetProjectGalleryScroll() {
        if (!galleryModal || !galleryGridView) return;
        galleryModal.scrollTop = 0;
        galleryGridView.scrollTop = 0;
    }
    
    function initProjectGallery() {
        const grid = document.querySelector('.projects-grid');
        if (!grid || !galleryModal) return;
        grid.addEventListener('click', function(e) {
            const item = e.target.closest('.project-item');
            if (!item) return;
            const coverImage = item.querySelector('.project-cover');
            if (coverImage && coverImage.dataset.defaultSrc) {
                coverImage.src = coverImage.dataset.defaultSrc;
            }
            currentProject = item.getAttribute('data-project');
            const projects = window.__contentProjects;
            if (projects && Array.isArray(projects)) {
                const proj = projects.find(p => String(p.id) === String(currentProject));
                projectImages = (proj && proj.gallery) ? proj.gallery.slice() : [];
            } else {
                projectImages = [];
            }
            showGalleryGrid();
            galleryModal.classList.add('active');
            lockBodyScroll();
            resetProjectGalleryScroll();
            requestAnimationFrame(function() {
                resetProjectGalleryScroll();
                setTimeout(resetProjectGalleryScroll, 0);
                setTimeout(resetProjectGalleryScroll, 120);
            });
        });
    }

    function initProjectCoverHover() {
        const grid = document.querySelector('.projects-grid');
        if (!grid) return;

        const projects = Array.isArray(window.__contentProjects) ? window.__contentProjects : [];
        const items = grid.querySelectorAll('.project-item');

        function swapCoverSmooth(image, nextSrc) {
            if (!image || !nextSrc) return;
            const currentSrc = image.getAttribute('src') || '';
            if (currentSrc === nextSrc) return;

            if (image.__coverSwapTimer) {
                clearTimeout(image.__coverSwapTimer);
            }

            image.classList.add('project-cover-fade');
            image.__coverSwapTimer = setTimeout(function() {
                image.src = nextSrc;
                image.__coverSwapTimer = setTimeout(function() {
                    image.classList.remove('project-cover-fade');
                    image.__coverSwapTimer = null;
                }, 25);
            }, 120);
        }

        items.forEach(function(item) {
            if (item.dataset.hoverBound === '1') return;

            const image = item.querySelector('.project-cover');
            if (!image) return;

            const projectId = item.getAttribute('data-project');
            const project = projects.find(p => String(p.id) === String(projectId));
            const gallery = project && Array.isArray(project.gallery) ? project.gallery : [];

            const defaultSrc = image.getAttribute('src') || '';
            const hoverCandidates = [1, 2, 0, 3, 4, 5, 6, 7, 8, 9];
            const hoverSrc = hoverCandidates
                .map(index => gallery[index])
                .find(src => Boolean(src)) || defaultSrc;

            image.dataset.defaultSrc = defaultSrc;
            image.dataset.hoverSrc = hoverSrc;
            item.dataset.hoverBound = '1';

            if (!hoverSrc || hoverSrc === defaultSrc) return;

            const preloadHoverImage = new Image();
            preloadHoverImage.src = hoverSrc;

            item.addEventListener('mouseenter', function() {
                swapCoverSmooth(image, hoverSrc);
            });

            item.addEventListener('mouseleave', function() {
                swapCoverSmooth(image, defaultSrc);
            });

            item.addEventListener('focusin', function() {
                swapCoverSmooth(image, hoverSrc);
            });

            item.addEventListener('focusout', function(event) {
                if (!item.contains(event.relatedTarget)) {
                    swapCoverSmooth(image, defaultSrc);
                }
            });
        });
    }
    
    document.addEventListener('contentReady', initProjectGallery);
    document.addEventListener('contentReady', initProjectCoverHover);

    // ============================================
    // ГАЛЕРЕЯ 3 БЛОКА
    // ============================================

    const block3Gallery = document.querySelector('.block-3-bottom-gallery');
    const block3Track = document.querySelector('.block-3-bottom-track');
    const block3Prev = document.querySelector('.block-3-gallery-prev');
    const block3Next = document.querySelector('.block-3-gallery-next');
    const block3Counter = document.querySelector('.block-3-gallery-counter');
    let currentBlock3Slide = 0;

    function updateBlock3Gallery() {
        if (!block3Track) return;
        const total = parseInt(block3Track.getAttribute('data-total') || '0', 10);
        if (!total) return;

        if (currentBlock3Slide < 0) currentBlock3Slide = total - 1;
        if (currentBlock3Slide >= total) currentBlock3Slide = 0;

        block3Track.style.transform = `translateX(-${currentBlock3Slide * 100}%)`;
        block3Track.setAttribute('data-index', String(currentBlock3Slide));
        if (block3Counter) {
            block3Counter.textContent = `${currentBlock3Slide + 1} / ${total}`;
        }
    }

    function changeBlock3Slide(step) {
        if (!block3Track) return;
        currentBlock3Slide += step;
        updateBlock3Gallery();
    }

    if (block3Prev) {
        block3Prev.addEventListener('click', function() {
            changeBlock3Slide(-1);
        });
    }

    if (block3Next) {
        block3Next.addEventListener('click', function() {
            changeBlock3Slide(1);
        });
    }

    document.addEventListener('contentReady', function() {
        currentBlock3Slide = 0;
        updateBlock3Gallery();
    });

    document.addEventListener('block3GalleryReady', function() {
        currentBlock3Slide = 0;
        updateBlock3Gallery();
    });

    if (block3Gallery) {
        let startX = 0;
        let deltaX = 0;

        block3Gallery.addEventListener('touchstart', function(e) {
            startX = e.changedTouches[0].clientX;
            deltaX = 0;
        }, { passive: true });

        block3Gallery.addEventListener('touchmove', function(e) {
            deltaX = e.changedTouches[0].clientX - startX;
        }, { passive: true });

        block3Gallery.addEventListener('touchend', function() {
            if (Math.abs(deltaX) < 40) return;
            if (deltaX < 0) {
                changeBlock3Slide(1);
            } else {
                changeBlock3Slide(-1);
            }
        }, { passive: true });
    }
    
    // Показать сетку фотографий
    function showGalleryGrid() {
        galleryGrid.innerHTML = '';
        projectImages.forEach((imagePath, index) => {
            const gridItem = document.createElement('div');
            gridItem.className = 'gallery-grid-item';
            gridItem.innerHTML = `<img src="${imagePath}" alt="Project photo ${index + 1}" loading="lazy">`;
            gridItem.addEventListener('click', function(e) {
                e.stopPropagation();
                currentImageIndex = index;
                showFullscreenView();
            });
            galleryGrid.appendChild(gridItem);
        });
        galleryGridView.style.display = 'block';
        galleryFullscreenView.style.display = 'none';
        resetProjectGalleryScroll();
        requestAnimationFrame(function() {
            resetProjectGalleryScroll();
        });
    }
    
    // Показать полноэкранный просмотр
    function showFullscreenView() {
        galleryGridView.style.display = 'none';
        galleryFullscreenView.style.display = 'flex';
        showGalleryImage();
    }
    
    // Вернуться в сетку
    backToGridBtn.addEventListener('click', function() {
        showGalleryGrid();
    });
    
    // Показать текущее изображение
    function showGalleryImage() {
        if (projectImages.length > 0) {
            galleryImage.src = projectImages[currentImageIndex];
            galleryCounter.textContent = `${currentImageIndex + 1} / ${projectImages.length}`;
        }
    }
    
    // Следующее изображение
    galleryNext.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex + 1) % projectImages.length;
        showGalleryImage();
    });
    
    // Предыдущее изображение
    galleryPrev.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex - 1 + projectImages.length) % projectImages.length;
        showGalleryImage();
    });
    
    // Закрытие галереи
    galleryClose.addEventListener('click', function() {
        galleryModal.classList.remove('active');
        unlockBodyScroll();
        projectImages = [];
        currentProject = null;
        galleryGrid.innerHTML = '';
    });
    
    // Закрытие по клику вне изображения
    galleryModal.addEventListener('click', function(e) {
        if (e.target === galleryModal) {
            galleryModal.classList.remove('active');
            unlockBodyScroll();
            projectImages = [];
            currentProject = null;
        }
    });
    
    // Навигация с клавиатуры для проектов
    document.addEventListener('keydown', function(e) {
        if (galleryModal.classList.contains('active')) {
            if (e.key === 'ArrowRight') {
                galleryNext.click();
            } else if (e.key === 'ArrowLeft') {
                galleryPrev.click();
            } else if (e.key === 'Escape') {
                galleryClose.click();
            }
        }

        if (!galleryModal.classList.contains('active') && block3Gallery && block3Track && block3Gallery.matches(':hover')) {
            if (e.key === 'ArrowRight') {
                changeBlock3Slide(1);
            } else if (e.key === 'ArrowLeft') {
                changeBlock3Slide(-1);
            }
        }
    });

    // ============================================
    // ГАЛЕРЕЯ ПАКЕТНЫХ ПРЕДЛОЖЕНИЙ (БЛОК 6)
    // ============================================
    
    const packageItems = document.querySelectorAll('.package-item');
    const packageGalleryModal = document.getElementById('package-gallery-modal');
    const packageGalleryImage = document.getElementById('package-gallery-image');
    const packageGalleryClose = document.querySelector('.package-gallery-close');
    const packageGalleryPrev = document.querySelector('.package-gallery-prev');
    const packageGalleryNext = document.querySelector('.package-gallery-next');
    const packageGalleryCounter = document.querySelector('.package-gallery-counter');
    
    let currentPackage = null;
    let currentPackageImageIndex = 0;
    let packageImages = [];
    
    // Определяем количество фотографий в каждом пакете
    const packagePhotoCounts = {
        '1': 10,
        '2': 8,
        '3': 12
    };
    
    // Открытие галереи пакета
    packageItems.forEach(item => {
        item.addEventListener('click', function() {
            currentPackage = this.getAttribute('data-package');
            const photoCount = packagePhotoCounts[currentPackage] || 10;
            
            // Формируем массив путей к фотографиям пакета
            packageImages = [];
            for (let i = 1; i <= photoCount; i++) {
                packageImages.push(`images/package_offers/package_${currentPackage}/${i}.jpeg`);
            }
            
            currentPackageImageIndex = 0;
            showPackageGalleryImage();
            packageGalleryModal.classList.add('active');
        });
    });
    
    // Показать текущее изображение пакета
    function showPackageGalleryImage() {
        if (packageImages.length > 0) {
            packageGalleryImage.src = packageImages[currentPackageImageIndex];
            packageGalleryCounter.textContent = `${currentPackageImageIndex + 1} / ${packageImages.length}`;
        }
    }
    
    // Следующее изображение пакета
    packageGalleryNext.addEventListener('click', function() {
        currentPackageImageIndex = (currentPackageImageIndex + 1) % packageImages.length;
        showPackageGalleryImage();
    });
    
    // Предыдущее изображение пакета
    packageGalleryPrev.addEventListener('click', function() {
        currentPackageImageIndex = (currentPackageImageIndex - 1 + packageImages.length) % packageImages.length;
        showPackageGalleryImage();
    });
    
    // Закрытие галереи пакета
    packageGalleryClose.addEventListener('click', function() {
        packageGalleryModal.classList.remove('active');
        packageImages = [];
        currentPackage = null;
    });
    
    // Закрытие по клику вне изображения пакета
    packageGalleryModal.addEventListener('click', function(e) {
        if (e.target === packageGalleryModal) {
            packageGalleryModal.classList.remove('active');
            packageImages = [];
            currentPackage = null;
        }
    });
    
    // Навигация с клавиатуры для пакетов
    document.addEventListener('keydown', function(e) {
        if (packageGalleryModal.classList.contains('active')) {
            if (e.key === 'ArrowRight') {
                packageGalleryNext.click();
            } else if (e.key === 'ArrowLeft') {
                packageGalleryPrev.click();
            } else if (e.key === 'Escape') {
                packageGalleryClose.click();
            }
        }
    });
});

// ============================================
// SWIPE SUPPORT FOR GALLERIES
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    function addSwipeSupport(modalId, nextBtnClass, prevBtnClass) {
        const modal = document.getElementById(modalId);
        const nextBtn = document.querySelector(`.${nextBtnClass}`);
        const prevBtn = document.querySelector(`.${prevBtnClass}`);
        
        if (!modal || !nextBtn || !prevBtn) return;

        let touchStartX = 0;
        let touchEndX = 0;

        modal.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        modal.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});

        function handleSwipe() {
            const swipeThreshold = 50; // Minimum distance for swipe
            
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe Left -> Next Image
                nextBtn.click();
            }
            
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe Right -> Previous Image
                prevBtn.click();
            }
        }
    }

    // Add swipe to both galleries
    addSwipeSupport('project-gallery-modal', 'gallery-next', 'gallery-prev');
    addSwipeSupport('package-gallery-modal', 'package-gallery-next', 'package-gallery-prev');
});
