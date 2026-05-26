document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
       ========================================================================== */
    const burgerToggle = document.getElementById('burgerToggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const navLinks = document.querySelectorAll('.mobile-nav a');

    if (burgerToggle && mobileNav) {
        burgerToggle.addEventListener('click', () => {
            burgerToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burgerToggle.classList.remove('active');
                mobileNav.classList.remove('active');
            });
        });
    }

    /* ==========================================================================
       2. АНИМИРОВАННЫЙ СЧЕТЧИК (ЗАМЕДЛЕНИЕ НА ФИНИШЕ)
       ========================================================================== */
    const counters = document.querySelectorAll('.count-num');
    counters.forEach(counter => {
        const targetVal = parseInt(counter.getAttribute('data-target'), 10) || 0;
        let currentVal = 0;

        const animateCount = () => {
            const remaining = targetVal - currentVal;
            let increment = remaining * 0.04; // 4% от остатка — плавный финиш

            if (increment < 1 && remaining > 0) increment = 1;

            if (currentVal < targetVal) {
                currentVal += increment;
                counter.innerText = Math.floor(currentVal);
                setTimeout(animateCount, 25);
            } else {
                counter.innerText = targetVal;
            }
        };
        counter.innerText = '0';
        animateCount();
    });

    /* ==========================================================================
       3. ПАРТНЕРСКИЙ КАЛЬКУЛЯТОР
       ========================================================================== */
    const clientsSlider = document.getElementById('clients-slider');
    const priceSlider = document.getElementById('price-slider');
    const clientsVal = document.getElementById('clients-val');
    const priceVal = document.getElementById('price-val');
    const calcTotal = document.getElementById('calc-total');

    if (clientsSlider && priceSlider) {
        const calculateIncome = () => {
            const clients = parseInt(clientsSlider.value, 10);
            const price = parseInt(priceSlider.value, 10);
            if (clientsVal) clientsVal.textContent = clients;
            if (priceVal) priceVal.textContent = price;
            const total = Math.floor(clients * price * 0.30);
            if (calcTotal) calcTotal.textContent = `$${total.toLocaleString()} / мес`;
        };
        clientsSlider.addEventListener('input', calculateIncome);
        priceSlider.addEventListener('input', calculateIncome);
        calculateIncome();
    }

    /* ==========================================================================
       4. МОДАЛЬНОЕ ОКНО И ЖЕСТКИЙ АУДИТ ФОРМЫ (ФИНАЛЬНЫЙ СБОРКА)
       ========================================================================== */
    const modal = document.getElementById('partnerModal');
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('partnerForm');
    const modalCard = document.querySelector('.modal-card');
    
    // Переменная для хранения источника клика
    let currentSource = 'Landing';

    // Собираем абсолютно все кнопки, включая твою скрытую ссылку из футера
    const partnerButtons = document.querySelectorAll(
        '.saber-btn, .main-btn, .header-btn, .secondary-btn, .withdraw-btn, .income-box button, .cta-buttons button, .open-modal-link'
    );

    // Навешиваем событие открытия на все найденные кнопки
    partnerButtons.forEach(button => {
        if (button.classList.contains('modal-submit-btn')) return;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Вытягиваем источник из data-атрибута, либо смотрим на текст кнопки
            currentSource = button.getAttribute('data-source') || button.innerText.trim();
            
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Блокируем скролл фона
            }
        });
    });

    // Закрытие модального окна
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Возвращаем скролл
        });
    }

    // Обработка отправки формы в n8n Аудитор
    if (form && modal && modalCard) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.modal-submit-btn');
            const nameInput = document.getElementById('userName');
            const phoneInput = document.getElementById('userPhone');

            if (!submitBtn || !nameInput || !phoneInput) return;

            // Блокируем кнопку от повторных кликов
            submitBtn.disabled = true;
            submitBtn.textContent = 'ОТПРАВКА...';

            try {
                // Отправляем запрос на вебхук n8n Vantelord
                const response = await fetch('https://tiktiok.xyz/webhook-test/Vantelord', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: currentSource,
                        customer_name: nameInput.value,
                        customer_phone: phoneInput.value,
                        date: new Date().toLocaleString('ru-RU')
                    })
                });

                if (response.ok) {
                    // Перерисовываем карточку на красивое уведомление об успехе
                    modalCard.innerHTML = `
                        <div class="modal-close" id="newClose" style="position: absolute; top: 20px; right: 25px; font-size: 32px; color: rgba(255, 255, 255, 0.4); cursor: pointer;">&times;</div>
                        <div style="text-align: center; padding: 20px 0;">
                            <div style="font-size: 50px; margin-bottom: 20px; color: #fff;">✦</div>
                            <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 24px; color: #fff; margin-bottom: 10px;">ЗАЯВКА ПРИНЯТА!</h3>
                            <p style="font-size: 13px; color: rgba(255, 255, 255, 0.6); line-height: 1.5;">Заявка принята! Ожидайте звонка в течении 5 минут</p>
                        </div>
                    `;
                    
                    // Обработчик закрытия для новой динамической кнопки
                    document.getElementById('newClose').addEventListener('click', () => {
                        modal.classList.remove('active');
                        document.body.style.overflow = '';
                        setTimeout(() => location.reload(), 300);
                    });
                } else {
                    throw new Error('Сервер вернул статус ' + response.status);
                }
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'ОШИБКА. ПОВТОРИТЬ?';
            }
        });
    }
});

// /* ==========================================================================
//        5. ФОНОВЫЙ ЦИФРОВОЙ ПОТОК (MATRIX EFFECT) ДЛЯ СЕКЦИИ ДОХОДА
//        ========================================================================== */
//     const codeCanvas = document.getElementById('codeCanvas');
//     if (codeCanvas) {
//         const ctx = codeCanvas.getContext('2d');
//         const parentSection = codeCanvas.parentElement;

//         let width = codeCanvas.width = parentSection.offsetWidth;
//         let height = codeCanvas.height = parentSection.offsetHeight;

//         const fontSize = 16; // Чуть увеличили размер, чтобы цифры были более читаемыми
//         let columns = Math.floor(width / fontSize);
//         const drops = Array(columns).fill(1);

//         window.addEventListener('resize', () => {
//             width = codeCanvas.width = parentSection.offsetWidth;
//             height = codeCanvas.height = parentSection.offsetHeight;
//             columns = Math.floor(width / fontSize);
//             drops.length = columns;
//             drops.fill(1);
//         });

//         function drawMatrix() {
//             // Вместо очистки или серого квадрата накладываем ультра-прозрачный черный слой.
//             // Он создает идеальный шлейф затухания, но не перебивает твой основной фон сайта!
//             ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'; 
//             ctx.fillRect(0, 0, width, height);

//             // Включаем сочный неоновый фиолетовый цвет для самих цифр
//             ctx.fillStyle = '#9D4EDD';
//             ctx.font = `bold ${fontSize}px 'Courier New', monospace`;

//             for (let i = 0; i < drops.length; i++) {
//                 const text = Math.random() > 0.5 ? "1" : "0";
//                 const x = i * fontSize;
//                 const y = drops[i] * fontSize;

//                 ctx.fillText(text, x, y);

//                 // Если поток ушел вниз, кидаем его наверх
//                 if (y > height && Math.random() > 0.98) {
//                     drops[i] = 0;
//                 }
                
//                 // Скорость падения (0.5 вместо 1 делает движение в два раза плавнее и медленнее)
//                 drops[i] += 0.5; 
//             }
//         }

//         // Запуск анимации. Поменяли интервал на 40ms, чтобы убавить общую скорость и мерцание
//         setInterval(drawMatrix, 40);
//     }