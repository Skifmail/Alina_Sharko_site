// ============================================
// TELEGRAM BOT CONFIGURATION
// ============================================
const BOT_TOKEN = '8551578282:AAGxkMgLLsVztcweq1pnc7nkYX4Pyn62OXY';
const CHAT_ID = '847497161'; // Замените на ваш Chat ID (получить можно командой /start боту @userinfobot)

// Функция отправки сообщения в Telegram
async function sendToTelegram(formData) {
    const commentSection = formData.comments ? `<b>💬 Комментарий:</b>\n${formData.comments}\n\n` : '';
    const message = `<b>📋 Новая заявка с сайта detalidekora.ru</b>

<b>📱 Телефон:</b> ${formData.phone}
<b>📅 Дата мероприятия:</b> ${formData.eventDate}
<b>📧 Email:</b> ${formData.email}
<b>💰 Бюджет:</b> ${parseInt(formData.budget).toLocaleString('ru-RU')} ₽
${commentSection}`;
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
        console.log('📤 Отправка в Telegram...', { url, chatId: CHAT_ID });
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const responseData = await response.json();
        
        if (response.ok && responseData.ok) {
            console.log('✅ Сообщение успешно отправлено в Telegram');
            return true;
        } else {
            console.error('❌ Ошибка Telegram API:', responseData);
            throw new Error(`Telegram API ошибка: ${responseData.description || 'Неизвестная ошибка'}`);
        }
    } catch (error) {
        console.error('❌ Ошибка при отправке в Telegram:', error);
        throw error;
    }
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
    // УПРАВЛЕНИЕ ВИДИМОСТЬЮ НАВИГАЦИОННОЙ ПАНЕЛИ
    // ============================================
    const topNavigation = document.querySelector('.top-navigation');
    const block1 = document.getElementById('block-1');
    
    // Определяем высоту блока 1
    let block1Height = block1 ? block1.offsetHeight : 0;
    
    // Обработчик прокрутки для управления видимостью навигации
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        // Если скролл в пределах первого блока, показываем панель постоянно
        if (scrollY < block1Height) {
            topNavigation.classList.add('nav-at-top');
        } else {
            // Если скролл прошёл первый блок, скрываем панель (показывается только при hover)
            topNavigation.classList.remove('nav-at-top');
        }
    });
    
    // Инициальная проверка при загрузке (на случай, если страница открылась с якорем)
    if (window.scrollY < block1Height) {
        topNavigation.classList.add('nav-at-top');
    }
    
    // ============================================
    // ПЛАВНАЯ ПРОКРУТКА ДЛЯ НАВИГАЦИИ
    // ============================================
    const navLinks = document.querySelectorAll('.nav-btn');
    
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
        });
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

// Модальное окно для просмотра изображений
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.modal-close');
    const carouselImages = document.querySelectorAll('.carousel-image');
    
    // Открытие модального окна при клике на изображение
    carouselImages.forEach(img => {
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            modal.style.display = 'block';
            modalImg.src = this.src;
            document.body.style.overflow = 'hidden'; // Отключаем прокрутку страницы
        });
    });
    
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
    const submitButton = document.querySelector('.submit-cta-button');
    const calendarIcon = document.querySelector('.calendar-icon');

    // Прогресс-бар для формы
    const progressFill = document.getElementById('formProgressFill');
    const progressPercent = document.getElementById('formProgressPercent');

    function updateFormProgress() {
        if (!progressFill || !progressPercent) return;

        // Обязательные поля: телефон, дата, email, бюджет, согласие
        const requiredFields = [
            { element: phoneInput, minLength: 18 }, // +7 (000) 000-00-00
            { element: dateInput, minLength: 10 },  // ДД.ММ.ГГГГ
            { element: emailInput, minLength: 5 },
            { element: budgetInput, minLength: 1 },
            { element: consentCheckbox, type: 'checkbox' }
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
                // Отправка в Telegram
                await sendToTelegram(formData);
                
                alert('Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.');
                
                // Очистка формы
                mainForm.reset();
            } catch (error) {
                alert('Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.');
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
    // ГАЛЕРЕЯ ПРОЕКТОВ (БЛОК 5)
    // ============================================
    
    const projectItems = document.querySelectorAll('.project-item');
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
    
    // Определяем количество фотографий в каждом проекте
    const projectPhotoCounts = {
        '1': 9,  // В папке project_1 будет 9 фотографий
        '2': 9,  // В папке project_2 будет 9 фотографий
        '3': 9,  // В папке project_3 будет 9 фотографий
        '4': 9,  // В папке project_4 будет 9 фотографий
        '5': 9,  // В папке project_5 будет 9 фотографий
        '6': 9   // В папке project_6 будет 9 фотографий
    };
    
    // Открытие галереи проекта
    projectItems.forEach(item => {
        item.addEventListener('click', function() {
            currentProject = this.getAttribute('data-project');
            const photoCount = projectPhotoCounts[currentProject] || 10;
            
            // Формируем массив путей к фотографиям проекта
            projectImages = [];
            for (let i = 1; i <= photoCount; i++) {
                projectImages.push(`images/projects/project_${currentProject}/${i}.jpeg`);
            }
            
            // Отображаем сетку фотографий
            showGalleryGrid();
            galleryModal.classList.add('active');
        });
    });
    
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
        projectImages = [];
        currentProject = null;
        galleryGrid.innerHTML = '';
    });
    
    // Закрытие по клику вне изображения
    galleryModal.addEventListener('click', function(e) {
        if (e.target === galleryModal) {
            galleryModal.classList.remove('active');
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
