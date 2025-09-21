document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    // --- ДАННЫЕ О ТОВАРАХ ---
    const menuItems = [
        { id: 'phila', title: 'Филадельфия', price: 520, description: 'Лосось, сливочный сыр', img: 'https://i.imgur.com/pX2hJq4.jpeg' },
        { id: 'california', title: 'Калифорния', price: 480, description: 'Краб, авокадо, огурец', img: 'https://i.imgur.com/xg1I7kS.jpeg' },
        { id: 'dragon', title: 'Дракон', price: 550, description: 'Угорь, унаги соус', img: 'https://i.imgur.com/LzL82wQ.jpeg' },
        { id: 'volcano', title: 'Вулкан', price: 490, description: 'Запеченный, острый соус', img: 'https://i.imgur.com/YIu21Pz.jpeg' }
    ];

    const menuContainer = document.getElementById('menu-container' );
    const cart = {}; // Наша корзина { id: quantity }

    // --- ФУНКЦИЯ ОБНОВЛЕНИЯ ГЛАВНОЙ КНОПКИ ---
    function updateMainButton() {
        let totalQuantity = 0;
        let totalPrice = 0;
        for (const id in cart) {
            const quantity = cart[id];
            totalQuantity += quantity;
            const item = menuItems.find(i => i.id === id);
            totalPrice += item.price * quantity;
        }

        if (totalQuantity > 0) {
            tg.MainButton.setText(`Корзина (${totalQuantity}) - ${totalPrice} ₽`);
            tg.MainButton.show();
        } else {
            tg.MainButton.hide();
        }
    }

    // --- СОЗДАНИЕ КАРТОЧЕК ТОВАРОВ ---
    menuItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <img src="${item.img}" alt="${item.title}" class="item-image">
            <div class="item-details">
                <h3 class="item-title">${item.title}</h3>
                <p class="item-description">${item.description}</p>
                <p class="item-price">${item.price} ₽</p>
            </div>
            <button class="add-button" data-item-id="${item.id}">Добавить</button>
        `;
        menuContainer.appendChild(itemCard);
    });

    // --- ОБРАБОТКА НАЖАТИЯ НА КНОПКУ "ДОБАВИТЬ" ---
    menuContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-button')) {
            const itemId = event.target.dataset.itemId;
            cart[itemId] = (cart[itemId] || 0) + 1;
            tg.HapticFeedback.impactOccurred('light'); // Легкая вибрация
            updateMainButton();
        }
    });

    // --- ОБРАБОТКА НАЖАТИЯ НА ГЛАВНУЮ КНОПКУ (ОФОРМЛЕНИЕ ЗАКАЗА) ---
    tg.MainButton.onClick(() => {
        if (Object.keys(cart).length === 0) return;

        tg.HapticFeedback.notificationOccurred('success'); // Вибрация успеха

        let orderText = "<b>Ваш заказ в 'Суши-Кот':</b>\n\n";
        let totalPrice = 0;

        for (const id in cart) {
            const item = menuItems.find(i => i.id === id);
            const quantity = cart[id];
            const price = item.price * quantity;
            totalPrice += price;
            orderText += `• ${item.title} x${quantity} - ${price} ₽\n`;
        }
        orderText += `\n<b>Итого: ${totalPrice} ₽</b>`;

        // Отправляем данные в чат с ботом
        tg.sendData(orderText);
        // Закрываем приложение после отправки
        tg.close();
    });

    // Настраиваем цвет главной кнопки
    tg.MainButton.setParams({
        color: '#2481cc', // Синий цвет
        text_color: '#ffffff' // Белый текст
    });
});
