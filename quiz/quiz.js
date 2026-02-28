document.addEventListener('DOMContentLoaded', () => {

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

    /* =========================
    ANIMATION OBSERVER
    ========================= */
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    });

    document.querySelectorAll("[data-animate]").forEach(el => observer.observe(el));

    /* =========================
    QUIZ
    ========================= */
    const quizWrapper = document.querySelector('.quiz-wrapper');
    if (!quizWrapper) return;

    console.log('✓ Quiz wrapper found');

    // ========================================
    // ОБЪЯВЛЕНИЕ ВСЕХ ПЕРЕМЕННЫХ
    // ========================================
    const navBtns = quizWrapper.querySelectorAll('.nav-btn');
    const quizSteps = quizWrapper.querySelectorAll('.quiz-step');
    const submitBtn = quizWrapper.querySelector('.quiz-submit');

    const eventTypeSelect = quizWrapper.querySelector('#eventTypeSelect');
    const eventDateInput = quizWrapper.querySelector('#eventDateInput');
    const ageInput = quizWrapper.querySelector('[data-step="2"] input[type="number"]');
    const nameInput = quizWrapper.querySelector('[data-step="5"] input[type="text"]');
    const phoneInput = quizWrapper.querySelector('#phoneInput');
    const citySelect = quizWrapper.querySelector('#citySelect');
    const otherInput = quizWrapper.querySelector('[data-step="4"] .goal-other input');

    let dateConfirmed = false;
    let selectedGuests = null;
    let selectedFormatMain = null;
    let selectedFormatTempo = null;
    let requestSent = false;

    // ========================================
    // ФУНКЦИЯ ПОКАЗА БАННЕРА
    // ========================================
    function showBanner(title, text, icon = '✅', type = 'success') {
        const banner = quizWrapper.querySelector('#notificationBanner');
        const bannerOverlay = quizWrapper.querySelector('#bannerOverlay');
        const bannerTitle = banner?.querySelector('#bannerTitle');
        const bannerText = banner?.querySelector('#bannerText');
        const bannerIcon = banner?.querySelector('#bannerIcon');
        const bannerButton = banner?.querySelector('#bannerButton');

        if (!banner || !bannerOverlay) {
            console.error('Banner elements not found');
            return;
        }

        bannerTitle.textContent = title;
        bannerText.textContent = text;
        bannerIcon.textContent = icon;

        banner.className = 'notification-banner ' + type;

        bannerOverlay.classList.add('visible');
        banner.style.display = 'block';

        bannerButton.onclick = () => {
            bannerOverlay.classList.remove('visible');
            banner.style.display = 'none';
        };

        bannerOverlay.onclick = () => {
            bannerOverlay.classList.remove('visible');
            banner.style.display = 'none';
        };
    }

    // ========================================
    // ФУНКЦИЯ ПЕРЕХОДА МЕЖДУ ШАГАМИ
    // ========================================
    function goToStep(step) {
        console.log('Going to step:', step);

        navBtns.forEach(b => b.classList.remove('active'));
        quizSteps.forEach(s => s.classList.remove('active'));

        const activeBtn = quizWrapper.querySelector(`.nav-btn[data-target="${step}"]`);
        const activeStep = quizWrapper.querySelector(`.quiz-step[data-step="${step}"]`);

        if (activeBtn) activeBtn.classList.add('active');
        if (activeStep) activeStep.classList.add('active');

        setTimeout(() => {
            quizWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }

    // ========================================
    // НАВИГАЦИОННЫЕ КНОПКИ
    // ========================================
    navBtns.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const target = btn.dataset.target;
            console.log('NAV BUTTON CLICKED - target:', target);
            goToStep(target);
        });
    });

    // ========================================
    // ФУНКЦИИ ПРОВЕРКИ ЗАПОЛНЕНИЯ
    // ========================================
    function checkStep1Complete() {
        return Boolean(eventTypeSelect?.value && eventDateInput?.value && dateConfirmed);
    }

    function checkGuestsStep() {
        return Boolean(selectedGuests && ageInput?.value);
    }

    function checkStep4Complete() {
        const anyGoalButton = quizWrapper.querySelector('[data-step="4"] .goal-grid button.active');
        const hasOtherText = otherInput && otherInput.value.trim().length >= 2;
        return anyGoalButton || hasOtherText;
    }

    function checkAllFieldsComplete() {
        const step1Complete = checkStep1Complete();
        const step2Complete = checkGuestsStep();
        const step3Complete = Boolean(selectedFormatMain);
        const step4Complete = checkStep4Complete();
        const step5Complete = nameInput?.value?.trim() && phoneInput?.value?.length === 18 && citySelect?.value;

        console.log('Quiz completion check:', {
            step1Complete,
            step2Complete,
            step3Complete,
            step4Complete,
            step5Complete
        });

        return step1Complete && step2Complete && step3Complete && step4Complete && step5Complete;
    }

    function updateSubmitButtonState() {
        if (submitBtn) {
            const isComplete = checkAllFieldsComplete();
            submitBtn.disabled = !isComplete;
            console.log('Submit button state:', isComplete ? 'enabled' : 'disabled');
        }
    }

    // ========================================
    // ШАГ 1: ТИП И ДАТА МЕРОПРИЯТИЯ
    // ========================================
    eventTypeSelect?.addEventListener('change', () => {
        console.log('Event type selected:', eventTypeSelect.value);
        updateSubmitButtonState();
    });

    eventDateInput?.addEventListener('change', () => {
        if (eventDateInput.value) {
            const [year, month, day] = eventDateInput.value.split('-');
            const formatted = `${day}.${month}.${year}`;
            console.log('Date selected:', eventDateInput.value, '(formatted:', formatted + ')');
            eventDateInput.dataset.formattedDate = formatted;
            dateConfirmed = true;
            updateSubmitButtonState();
        } else {
            dateConfirmed = false;
            updateSubmitButtonState();
        }
    });

    // Кнопка "Далее" на шаге 1
    const step1NextBtn = quizWrapper.querySelector('[data-step="1"] .quiz-next');
    if (step1NextBtn) {
        step1NextBtn.addEventListener('click', e => {
            e.preventDefault();
            console.log('Step 1 Next clicked');
            if (checkStep1Complete()) {
                console.log('Proceeding from step 1 to step 2');
                goToStep(2);
            } else {
                if (!eventTypeSelect?.value) {
                    alert('Пожалуйста, выберите тип мероприятия');
                } else if (!eventDateInput?.value || !dateConfirmed) {
                    alert('Пожалуйста, выберите дату мероприятия');
                }
            }
        });
    }

    // ========================================
    // ШАГ 2: ГОСТИ И ВОЗРАСТ
    // ========================================
    const guestButtons = quizWrapper.querySelectorAll('[data-step="2"] .guests-buttons button');
    guestButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            guestButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGuests = btn.dataset.value;
            console.log('Guest selected:', selectedGuests);
            updateSubmitButtonState();
        });
    });

    if (ageInput) {
        ageInput.addEventListener('input', () => {
            let value = ageInput.value;
            value = value.replace(/\D/g, '');
            if (value.length > 2) value = value.slice(0, 2);
            const num = Number(value);
            if (num > 70) value = '70';
            if (num < 5 && value.length === 2) value = '5';
            ageInput.value = value;
            updateSubmitButtonState();
        });

        ageInput.addEventListener('blur', () => {
            const num = Number(ageInput.value);
            if (!num || num < 5 || num > 70) {
                ageInput.value = '';
            }
            updateSubmitButtonState();
        });
    }

    // Кнопка "Далее" на шаге 2
    const step2NextBtn = quizWrapper.querySelector('[data-step="2"] .quiz-next');
    if (step2NextBtn) {
        step2NextBtn.addEventListener('click', e => {
            e.preventDefault();
            console.log('Step 2 Next clicked');
            if (checkGuestsStep()) {
                console.log('Proceeding from step 2 to step 3');
                goToStep(3);
            } else {
                alert('Пожалуйста, выберите количество гостей и укажите возраст');
            }
        });
    }

    // ========================================
    // ШАГ 3: ФОРМАТ МЕРОПРИЯТИЯ
    // ========================================
    const formatButtons = quizWrapper.querySelectorAll('[data-step="3"] .quiz-format button');
    formatButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            formatButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedFormatMain = btn.textContent.trim();
            console.log('Format selected:', selectedFormatMain);

            const formatSubmenu = quizWrapper.querySelector('[data-step="3"] .format-submenu');
            if (formatSubmenu) {
                formatSubmenu.style.display = 'flex';
                selectedFormatTempo = null;
                formatSubmenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            }
            updateSubmitButtonState();
        });
    });

    const tempoButtons = quizWrapper.querySelectorAll('[data-step="3"] .format-submenu button');
    tempoButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            tempoButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedFormatTempo = btn.dataset.tempo || btn.textContent.trim();
            console.log('Tempo selected:', selectedFormatTempo);
            updateSubmitButtonState();
            setTimeout(() => goToStep(4), 220);
        });
    });

    // ========================================
    // ШАГ 4: ЦЕЛЬ МЕРОПРИЯТИЯ
    // ========================================
    const goalButtons = quizWrapper.querySelectorAll('[data-step="4"] .goal-grid button');
    const otherBtn = quizWrapper.querySelector('[data-step="4"] .goal-grid button[data-goal="Другое"]');

    goalButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            btn.classList.toggle('active');
            console.log('Goal toggled:', btn.dataset.goal, 'active=', btn.classList.contains('active'));
            updateSubmitButtonState();
        });
    });

    if (otherInput && otherBtn) {
        otherInput.addEventListener('input', () => {
            const hasText = otherInput.value.trim().length > 0;
            if (hasText) otherBtn.classList.add('active');
            else otherBtn.classList.remove('active');
            updateSubmitButtonState();
        });
    }

    // Кнопка "Далее" на шаге 4
    const step4NextBtn = quizWrapper.querySelector('[data-step="4"] .quiz-next');
    if (step4NextBtn) {
        step4NextBtn.addEventListener('click', e => {
            e.preventDefault();
            console.log('Proceeding from step 4 to step 5');
            goToStep(5);
        });
    }

    // ========================================
    // ШАГ 5: КОНТАКТЫ
    // ========================================
    // ========================================
    // МАСКА ТЕЛЕФОНА: +7 (7xx) xxx-xx-xx
    // ========================================
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            // Берём только цифры из того что ввёл пользователь
            let digits = this.value.replace(/\D/g, '');

            // Убираем ведущие 8 или 7 если пользователь сам их вписал
            if (digits.startsWith('87') || digits.startsWith('77')) {
                digits = digits.slice(1);
            } else if (digits.startsWith('8')) {
                digits = digits.slice(1);
            } else if (digits.startsWith('7') && digits.length > 10) {
                digits = digits.slice(1);
            }

            // Ограничиваем до 10 цифр (код оператора + номер)
            digits = digits.slice(0, 10);

            // Форматируем: +7 (7xx) xxx-xx-xx
            let formatted = '+7 (';
            if (digits.length === 0) {
                formatted = '';
            } else if (digits.length <= 3) {
                formatted += digits + ')'.slice(0, digits.length < 3 ? 0 : 1);
                if (digits.length === 3) formatted = '+7 (' + digits + ') ';
                else formatted = '+7 (' + digits;
            } else if (digits.length <= 6) {
                formatted = '+7 (' + digits.slice(0, 3) + ') ' + digits.slice(3);
            } else if (digits.length <= 8) {
                formatted = '+7 (' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
            } else {
                formatted = '+7 (' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6, 8) + '-' + digits.slice(8, 10);
            }

            this.value = formatted;
            updateSubmitButtonState();
        });

        // Не даём вводить нечисловые символы (кроме допустимых)
        phoneInput.addEventListener('keydown', function (e) {
            const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
            if (allowed.includes(e.key)) return;
            if (!/^\d$/.test(e.key)) e.preventDefault();
        });

        // На paste — обрабатываем вставленный номер
        phoneInput.addEventListener('paste', function (e) {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text');
            let digits = pasted.replace(/\D/g, '');
            if (digits.startsWith('87') || digits.startsWith('77')) digits = digits.slice(1);
            else if (digits.startsWith('8')) digits = digits.slice(1);
            else if (digits.startsWith('7') && digits.length > 10) digits = digits.slice(1);
            digits = digits.slice(0, 10);
            // Симулируем input событие
            this.value = digits;
            this.dispatchEvent(new Event('input'));
        });
    }

    nameInput?.addEventListener('input', updateSubmitButtonState);
    phoneInput?.addEventListener('input', updateSubmitButtonState);

    // ========================================
    // КАСТОМНЫЙ ДРОПДАУН ГОРОДА
    // ========================================
    const cityDropdown = quizWrapper.querySelector('#cityDropdown');
    const cityTrigger = quizWrapper.querySelector('#cityTrigger');
    const cityList = quizWrapper.querySelector('#cityList');
    const cityLabel = quizWrapper.querySelector('#cityLabel');
    const cityItems = quizWrapper.querySelectorAll('.city-dropdown-item');

    if (cityTrigger && cityList) {
        cityTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = cityList.classList.contains('open');
            cityList.classList.toggle('open', !isOpen);
            cityTrigger.classList.toggle('open', !isOpen);
        });

        cityItems.forEach(item => {
            item.addEventListener('click', () => {
                const val = item.dataset.value;
                // Обновляем скрытый input
                citySelect.value = val;
                // Обновляем лейбл
                cityLabel.textContent = val;
                cityTrigger.classList.add('selected');
                // Снимаем active со всех, ставим на выбранный
                cityItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                // Закрываем
                cityList.classList.remove('open');
                cityTrigger.classList.remove('open');
                updateSubmitButtonState();
            });
        });

        // Закрываем при клике вне
        document.addEventListener('click', (e) => {
            if (!cityDropdown.contains(e.target)) {
                cityList.classList.remove('open');
                cityTrigger.classList.remove('open');
            }
        });
    }

    // Инициализация состояния кнопки отправки
    if (submitBtn) submitBtn.disabled = true;

    // ========================================
    // ОТПРАВКА ФОРМЫ
    // ========================================
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📤 Quiz submit button clicked!');

            const name = nameInput?.value || 'Не указано';
            const eventType = eventTypeSelect?.value || 'Не указано';

            let eventDate = 'Не указано';
            if (eventDateInput?.value) {
                const rawDate = eventDateInput.value;
                const [year, month, day] = rawDate.split('-');
                eventDate = `${day}.${month}.${year}`;
            }

            const guests = selectedGuests || '0';
            const age = ageInput?.value || 'Не указано';

            let phone = phoneInput?.value || '';
            // Маска уже содержит +7, просто берём все цифры → 77055885385 (11 цифр)
            const phoneDigits = phone.replace(/\D/g, '');
            phone = phoneDigits; // уже будет 77055885385

            const activeFormatBtn = quizWrapper.querySelector('[data-step="3"] .quiz-format button.active');
            let formatMain = selectedFormatMain;
            if (!formatMain && activeFormatBtn) {
                formatMain = activeFormatBtn.textContent.trim();
            }
            formatMain = formatMain || 'Не выбрано';

            let formatTempo = '';
            const activeTempoBtn = quizWrapper.querySelector('[data-step="3"] .format-submenu button.active');
            if (typeof selectedFormatTempo !== 'undefined' && selectedFormatTempo) {
                formatTempo = selectedFormatTempo.split(',')[0].trim();
            } else if (activeTempoBtn?.dataset?.tempo) {
                formatTempo = activeTempoBtn.dataset.tempo.split(',')[0].trim();
            } else if (activeTempoBtn?.textContent) {
                formatTempo = activeTempoBtn.textContent.split(',')[0].trim();
            }

            const format = [formatMain, formatTempo].filter(f => f && f !== 'Не выбрано').join(' | ') || 'Не выбрано';

            const otherVal = otherInput?.value?.trim();
            const selectedGoals = Array.from(quizWrapper.querySelectorAll('[data-step="4"] .goal-grid button.active')).map(b => {
                const goal = (b.dataset.goal || b.textContent || '').trim();
                if (goal.toLowerCase() === 'другое') {
                    return otherVal || 'Другое';
                }
                return goal;
            }).filter(Boolean);

            console.log('Collected data:', { eventType, eventDate, guests, age, phone, format, selectedGoals });

            // Проверяем телефон после очистки
            if (phoneDigits.length !== 11) {
                showBanner('Ошибка ввода', 'Пожалуйста, введите корректный номер телефона', '⚠️', 'error');
                return;
            }

            const city = citySelect?.value || '';
            if (!city) {
                showBanner('Ошибка ввода', 'Пожалуйста, выберите город', '⚠️', 'error');
                return;
            }

            try {
                // Отправляем данные на backend
                const tracking = typeof window.getTrackingData === 'function' ? window.getTrackingData() : {};
                const quizData = {
                    name: name,
                    phone: phone,
                    city: city,
                    eventType: eventType,
                    eventDate: eventDate,
                    guests: guests,
                    age: age,
                    formatMain: formatMain,
                    formatTempo: formatTempo,
                    selectedGoals: selectedGoals,
                    tracking: tracking
                };

                console.log('📤 Sending quiz data to backend:', quizData);

                if (requestSent) {
                    showBanner(
                        'Заявка отправлена',
                        'Мы уже получили вашу заявку и скоро свяжемся с вами.',
                        '✅',
                        'success'
                    );
                    return;
                }

                requestSent = true;

                let response;

                try {

                    response = await fetch('/quiz/quiz.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(quizData)
                    });

                    console.log('📥 Response received:', response.status, response.statusText);

                } catch (fetchError) {

                    requestSent = false;

                    showBanner(
                        'Ошибка подключения',
                        'Не удалось подключиться к серверу.',
                        '📡',
                        'error'
                    );

                    return;
                }

                // Проверяем статус ответа
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('HTTP Error:', response.status, response.statusText, errorText);
                    let errorMessage = 'Ошибка при отправке заявки';

                    if (response.status === 405) {
                        errorMessage = 'Ошибка: Веб-сервер не поддерживает PHP. Пожалуйста, используйте встроенный PHP сервер. Запустите в терминале: php -S localhost:8000';
                        console.error('⚠️ Live Server не поддерживает PHP! Используйте: php -S localhost:8000');
                    } else {
                        try {
                            const errorJson = JSON.parse(errorText);
                            errorMessage = errorJson.error || errorMessage;
                            if (errorJson.received_method) {
                                console.error('Received method:', errorJson.received_method, 'Expected: POST');
                            }
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
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('JSON Parse Error:', parseError);
                    showBanner('Ошибка', 'Неверный формат ответа от сервера. Пожалуйста, попробуйте позже.', '❌', 'error');
                    return;
                }

                if (result.success) {
                    console.log('✓ Quiz submitted successfully:', result);
                    showBanner('Спасибо!', 'Ваша заявка отправлена. Менеджер скоро свяжется с вами!', '✅', 'success');

                    // Сброс формы
                    eventTypeSelect.value = '';
                    eventDateInput.value = '';
                    const dateDisplay = quizWrapper.querySelector('#eventDateDisplay');
                    if (dateDisplay) dateDisplay.textContent = '';
                    dateConfirmed = false;
                    delete eventDateInput.dataset.formattedDate;

                    guestButtons.forEach(b => b.classList.remove('active'));
                    selectedGuests = null;
                    ageInput.value = '';
                    nameInput.value = '';
                    phoneInput.value = '';
                    if (citySelect) { citySelect.value = ''; }
                    if (cityLabel) { cityLabel.textContent = 'Выберите город'; }
                    if (cityTrigger) { cityTrigger.classList.remove('selected', 'open'); }
                    if (cityList) { cityList.classList.remove('open'); }
                    if (cityItems) { cityItems.forEach(i => i.classList.remove('active')); }

                    formatButtons.forEach(b => b.classList.remove('active'));
                    tempoButtons.forEach(b => b.classList.remove('active'));
                    selectedFormatMain = null;
                    selectedFormatTempo = null;

                    const formatSubmenu = quizWrapper.querySelector('[data-step="3"] .format-submenu');
                    if (formatSubmenu) formatSubmenu.style.display = 'none';

                    goalButtons.forEach(b => b.classList.remove('active'));
                    if (otherInput) otherInput.value = '';

                    goToStep(1);
                } else {
                    console.error('Backend error:', result.error);
                    showBanner('Ошибка', result.error || 'Ошибка при отправке заявки. Пожалуйста, попробуйте позже.', '❌', 'error');
                }
            } catch (error) {
                console.error('Network Error:', error);
                showBanner('Ошибка подключения', 'Не удалось подключиться к серверу. Пожалуйста, проверьте интернет соединение и попробуйте позже.', '📡', 'error');
            }
        });
    }

    console.log('✓ Quiz fully initialized (iOS safe + full functionality)');
});

/* =========================
TIKTOK PIXEL
========================= */
!function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = w[t] = w[t] || [];
    ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
    ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.load = function (e) {
        var n = document.createElement("script");
        n.type = "text/javascript";
        n.async = true;
        n.src = "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=" + e;
        var a = document.getElementsByTagName("script")[0];
        a.parentNode.insertBefore(n, a);
    };
    ttq.load('D5V1LTBC77U581RV47UG');
    ttq.page();
}(window, document, 'ttq');