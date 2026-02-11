/* =========================
         MOBILE MENU
      ========================= */
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const overlay = document.querySelector(".overlay");
const closeMenu = document.querySelector(".close-menu");

if (menuToggle && mobileNav && overlay && closeMenu) {
    menuToggle.addEventListener("click", () => {
        mobileNav.classList.add("active");
        overlay.classList.add("active");
    });

    closeMenu.addEventListener("click", () => {
        mobileNav.classList.remove("active");
        overlay.classList.remove("active");
    });

    overlay.addEventListener("click", () => {
        mobileNav.classList.remove("active");
        overlay.classList.remove("active");
    });

    document.querySelectorAll(".mobile-nav a").forEach(link => {
        link.addEventListener("click", () => {
            mobileNav.classList.remove("active");
            overlay.classList.remove("active");
        });
    });
}

/* ======================
   ИНИЦИАЛИЗАЦИЯ
====================== */
document.addEventListener('DOMContentLoaded', function () {
    console.log('✓ Lead form initialized');

    const leadForm = document.getElementById('leadForm');
    const nameInput = document.getElementById('leadName');
    const phoneInput = document.getElementById('leadPhone');
    const submitBtn = document.getElementById('leadSubmit');

    // Проверка наличия элементов
    if (!leadForm || !nameInput || !phoneInput || !submitBtn) {
        console.error('❌ Form elements not found!');
        return;
    }

    /* ======================
       МАСКА ТЕЛЕФОНА
    ====================== */
    let isBackspace = false;

    phoneInput.addEventListener('keydown', function (e) {
        isBackspace = e.key === 'Backspace';
    });

    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');

        // Если пользователь начинает вводить с 8, заменяем на 7
        if (value.startsWith('8')) {
            value = '7' + value.substring(1);
        }

        // Автоматически добавляем +7 если пользователь начинает вводить
        if (value.length > 0 && !value.startsWith('7')) {
            value = '7' + value;
        }

        // Форматирование номера
        let formatted = '';
        if (value.length > 0) {
            formatted = '+7';
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
        }

        e.target.value = formatted;
        updateSubmitButtonState();
    });

    phoneInput.addEventListener('focus', function (e) {
        if (e.target.value === '') {
            e.target.value = '+7 (';
        }
    });

    phoneInput.addEventListener('blur', function (e) {
        if (e.target.value === '+7 (' || e.target.value === '+7') {
            e.target.value = '';
        }
    });

    /* ======================
       ВАЛИДАЦИЯ ИМЕНИ
    ====================== */
    nameInput.addEventListener('input', function () {
        // Разрешаем только буквы, пробелы и дефисы
        this.value = this.value.replace(/[^а-яёА-ЯЁa-zA-Z\s-]/g, '');
        updateSubmitButtonState();
    });

    /* ======================
       ОБНОВЛЕНИЕ КНОПКИ
    ====================== */
    function updateSubmitButtonState() {
        const nameValid = nameInput.value.trim().length >= 2;
        const phoneDigits = phoneInput.value.replace(/\D/g, '');
        const phoneValid = phoneDigits.length === 11 && phoneDigits.startsWith('7');

        if (nameValid && phoneValid) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    /* ======================
       ОТПРАВКА ФОРМЫ
    ====================== */
    leadForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('📤 Lead form submit button clicked!');

        // Получаем данные
        const name = nameInput.value.trim();
        const phoneRaw = phoneInput.value.replace(/\D/g, '');
        const phone = '+' + phoneRaw;

        // Валидация перед отправкой
        if (!name || name.length < 2) {
            showBanner('Ошибка ввода', 'Пожалуйста, введите ваше имя (минимум 2 символа)', '⚠️', 'error');
            return;
        }

        if (phoneRaw.length !== 11 || !phoneRaw.startsWith('7')) {
            showBanner('Ошибка ввода', 'Пожалуйста, введите корректный номер телефона', '⚠️', 'error');
            return;
        }

        console.log('📋 Collected data:', { name, phone });

        // Блокируем кнопку на время отправки
        submitBtn.disabled = true;
        const originalText = submitBtn.querySelector('.btn-text').textContent;
        submitBtn.querySelector('.btn-text').textContent = 'Отправка...';

        try {
            // Формируем данные для отправки
            const leadData = {
                name: name,
                phone: phone,
                source: 'quick_lead' // Маркер для идентификации источника заявки
            };

            console.log('📤 Sending lead data to backend:', leadData);

            // Отправляем запрос
            const response = await fetch('lead/send.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(leadData)
            });

            console.log('📥 Response received:', response.status, response.statusText);

            // Проверяем статус ответа
            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP Error:', response.status, response.statusText, errorText);

                let errorMessage = 'Ошибка при отправке заявки';

                if (response.status === 405) {
                    errorMessage = 'Ошибка: Веб-сервер не поддерживает PHP. Пожалуйста, используйте PHP сервер.';
                    console.error('⚠️ Live Server не поддерживает PHP! Используйте: php -S localhost:8000');
                } else {
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.error || errorMessage;
                    } catch (e) {
                        errorMessage = `Ошибка сервера (${response.status}): ${response.statusText}`;
                    }
                }

                showBanner('Ошибка', errorMessage, '❌', 'error');
                return;
            }

            // Парсим JSON ответ
            let result;
            try {
                const responseText = await response.text();
                console.log('📄 Response text:', responseText);
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                showBanner('Ошибка', 'Неверный формат ответа от сервера. Пожалуйста, попробуйте позже.', '❌', 'error');
                return;
            }

            // Обрабатываем успешный ответ
            if (result.success) {
                console.log('✓ Lead submitted successfully:', result);
                showBanner('Спасибо!', 'Ваша заявка отправлена! Менеджер свяжется с вами в ближайшее время.', '✅', 'success');

                // Очищаем форму
                leadForm.reset();
                nameInput.value = '';
                phoneInput.value = '';
                updateSubmitButtonState();

                // Перенаправляем на главную через 3 секунды
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                console.error('Backend error:', result.error);
                showBanner('Ошибка', result.error || 'Ошибка при отправке заявки. Пожалуйста, попробуйте позже.', '❌', 'error');
            }

        } catch (error) {
            console.error('Network Error:', error);
            showBanner('Ошибка подключения', 'Не удалось подключиться к серверу. Пожалуйста, проверьте интернет соединение и попробуйте позже.', '📡', 'error');
        } finally {
            // Возвращаем кнопку в исходное состояние
            submitBtn.querySelector('.btn-text').textContent = originalText;
            updateSubmitButtonState();
        }
    });

    /* ======================
       NOTIFICATION BANNER
    ====================== */
    window.showBanner = function (title, message, emoji, type = 'success') {
        const banner = document.getElementById('notificationBanner');
        if (!banner) return;

        const emojiEl = banner.querySelector('.notification-emoji');
        const titleEl = banner.querySelector('.notification-title');
        const messageEl = banner.querySelector('.notification-message');

        emojiEl.textContent = emoji;
        titleEl.textContent = title;
        messageEl.textContent = message;

        // Убираем старые классы типов
        banner.classList.remove('success', 'error');

        // Добавляем новый класс типа
        if (type) {
            banner.classList.add(type);
        }

        // Показываем баннер
        banner.classList.add('show');

        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            closeNotification();
        }, 5000);
    };

    window.closeNotification = function () {
        const banner = document.getElementById('notificationBanner');
        if (banner) {
            banner.classList.remove('show');
        }
    };

    // Инициализация состояния кнопки
    updateSubmitButtonState();

    console.log('✓ All event listeners attached successfully');
});

//заметка 2 <!-- TikTok Pixel Code Start -->
!function (w, d, t) {
    w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"], ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++)ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) {
        for (
            var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)ttq.setAndDefer(e, ttq.methods[n]); return e
    }, ttq.load = function (e, n) {
        var r = "https://analytics.tiktok.com/i18n/pixel/events.js", o = n && n.partner; ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = r, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; n = document.createElement("script")
            ; n.type = "text/javascript", n.async = !0, n.src = r + "?sdkid=" + e + "&lib=" + t; e = document.getElementsByTagName("script")[0]; e.parentNode.insertBefore(n, e)
    };
    ttq.load('D5V1LTBC77U581RV47UG');
    ttq.page();
}(window, document, 'ttq');
//<!-- TikTok Pixel Code End -->