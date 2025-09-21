document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    // --- ЭЛЕМЕНТЫ ИНТЕРФЕЙСА ---
    const screenMenu = document.getElementById('screen-menu');
    const screenCart = document.getElementById('screen-cart');
    const menuContainer = document.getElementById('menu-container');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');

    // --- ДАННЫЕ И СОСТОЯНИЕ ---
    const menuItems = [
        { id: 'phila', title: 'Филадельфия', price: 520, description: 'Лосось, сливочный сыр', img: 'https://i.imgur.com/pX2hJq4.jpeg' },
        { id: 'california', title: 'Калифорния', price: 480, description: 'Краб, авокадо, огурец', img: 'https://i.imgur.com/xg1I7kS.jpeg' },
        { id: 'dragon', title: 'Дракон', price: 550, description: 'Угорь, унаги соус', img: 'https://i.imgur.com/LzL82wQ.jpeg' },
        { id: 'volcano', title: 'Вулкан', price: 490, description: 'Запеченный, острый соус', img: 'https://i.imgur.com/YIu21Pz.jpeg' }
    ];
    const cart = {}; // Корзина: { id: quantity }
    let currentScreen = 'menu'; // Текущий экран: 'menu' или 'cart'

    // --- ФУНКЦИИ РЕНДЕРИНГА (ОТРИСОВКИ ) ---

    // Отрисовка карточки товара в меню
    function renderMenuItem(item) {
        const quantity = cart[item.id] || 0;
        return `
            <div class="item-card" data-item-id="${item.id}">
                <img src="${item.img}" alt="${item.title}" class="item-image">
                <div class="item-details">
                    <h3 class="item-title">${item.title}</h3>
                    <p class="item-description">${item.description}</p>
                    <p class="item-price">${item.price} ₽</p>
                </div>
                <div class="quantity-control">
                    <button class="quantity-btn" data-action="plus">+</button>
                    <span class="quantity-value">${quantity}</span>
                    <button class="quantity-btn" data-action="minus">-</button>
                </div>
            </div>
        `;
    }

    // Полная перерисовка всего меню
    function renderMenu() {
        menuContainer.innerHTML = menuItems.map(renderMenuItem).join('');
    }

    // Отрисовка экрана корзины
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let totalPrice = 0;

        for (const id in cart) {
            if (cart[id] > 0) {
                const item = menuItems.find(i => i.id === id);
                const quantity = cart[id];
                const price = item.price * quantity;
                totalPrice += price;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item';
                cartItemDiv.innerHTML = `
                    <span class="cart-item-title">${item.title} (x${quantity})</span>
                    <span>${price} ₽</span>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            }
        }
        cartTotalElement.innerText = `Итого: ${totalPrice} ₽`;
    }

    // --- ФУНКЦИИ УПРАВЛЕНИЯ ИНТЕРФЕЙСОМ ---

    // Обновление главной кнопки Telegram
    function updateMainButton() {
        let totalQuantity = Object.values(cart).reduce((sum, q) => sum + q, 0);
        if (totalQuantity > 0) {
            if (currentScreen === 'menu') {
                tg.MainButton.setText(`Перейти в корзину (${totalQuantity})`);
            } else {
                tg.MainButton.setText('Оформить заказ');
            }
            tg.MainButton.show();
        } else {
            tg.MainButton.hide();
        }
    }

    // Переключение между экранами
    function showScreen(screenName) {
        currentScreen = screenName;
        if (screenName === 'menu') {
            screenMenu.classList.remove('hidden');
            screenCart.classList.add('hidden');
            tg.BackButton.hide();
        } else {
            screenMenu.classList.add('hidden');
            screenCart.classList.remove('hidden');
            tg.BackButton.show();
            renderCart();
        }
        updateMainButton();
    }

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

    // Клик по кнопкам +/-
    menuContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.classList.contains('quantity-btn')) return;

        const card = target.closest('.item-card');
        const itemId = card.dataset.itemId;
        const action = target.dataset.action;

        let quantity = cart[itemId] || 0;

        if (action === 'plus') {
            quantity++;
        } else if (action === 'minus' && quantity > 0) {
            quantity--;
        }

        cart[itemId] = quantity;
        if (cart[itemId] === 0) {
            delete cart[itemId];
        }

        // Обновляем только значение в карточке, без полной перерисовки
        card.querySelector('.quantity-value').innerText = quantity;
        tg.HapticFeedback.impactOccurred('light');
        updateMainButton();
    });

    // Клик по главной кнопке (Корзина/Заказ)
    tg.MainButton.onClick(() => {
        if (currentScreen === 'menu') {
            showScreen('cart');
        } else {
            // Логика оформления заказа (как в прошлый раз)
            let orderText = "<b>Новый заказ в 'Суши-Кот':</b>\n\n";
            let totalPrice = 0;
            for (const id in cart) {
                const item = menuItems.find(i => i.id === id);
                const quantity = cart[id];
                const price = item.price * quantity;
                totalPrice += price;
                orderText += `• ${item.title} x${quantity} - ${price} ₽\n`;
            }
            orderText += `\n<b>Итого: ${totalPrice} ₽</b>`;

            tg.sendData(orderText);
            tg.close();
        }
    });

    // Клик по системной кнопке "Назад"
    tg.BackButton.onClick(() => {
        showScreen('menu');
    });

    // --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
    renderMenu();
    updateMainButton();
    tg.expand(); // Раскрываем приложение на всю высоту
    tg.MainButton.setParams({ color: '#2481cc', text_color: '#ffffff' });
});
