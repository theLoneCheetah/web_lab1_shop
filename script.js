// Данные товаров
const products = [
    { id: 1, name: 'Товар 1', price: 1000 },
    { id: 2, name: 'Товар 2', price: 1500 },
    { id: 3, name: 'Товар 3', price: 2000 },
    { id: 4, name: 'Товар 4', price: 1200 },
    { id: 5, name: 'Товар 5', price: 1800 }
];

// Работа с localStorage браузера пользователя
const CART_STORAGE_KEY = 'shopCart';

// Сохранить корзину в localStorage
function saveCartToStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)); // хранение в JSON
}

// Загрузить корзину из localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
        try {
            cartItems = JSON.parse(savedCart); // расшифровка JSON
            // Проверка и корректировка данных на случай ошибок хранимых данных
            cartItems = cartItems.filter(item => item && typeof item === 'object').map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1 // по умолчанию 1 единица товара
            }));
        } catch (e) {
            // Иначе корзина пустая
            console.error('Ошибка загрузки корзины из localStorage', e);
            cartItems = [];
        }
    } else {
        // Если ничего не сохранено, корзина пустая
        cartItems = [];
    }
}

// Корзина
let cartItems = []; // Массив объектов { id, name, price, quantity }
loadCartFromStorage(); // загрузка сохранённой корзины в начале

// Элементы объектной модели DOM
const cartContainer = document.querySelector('.cart-items'); // товары в корзине
const totalPriceSpan = document.querySelector('.total-price'); // суммарный ценник корзины
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn'); // кнопки добавления товаров

// Функции для работы с корзиной

/**
 * Добавление товара в корзину
 * @param {number} productId - ID товара
 */
function addToCart(productId) {
    // Проверить наличие товара
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Если уже есть в корзине, добавить счётчик
    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Иначе добавить в список элементов корзины
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    // Обновляем отображение корзины и сохраняем её содержимое
    renderCart();
    saveCartToStorage();
}

/**
 * Удаление товара из корзины полностью.
 * @param {number} productId - ID товара
 */
function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    renderCart();
    saveCartToStorage();
}

/**
 * Изменение количества товара на указанную величину.
 * @param {number} productId - ID товара
 * @param {number} delta - изменение (1 или -1)
 */
function changeQuantity(productId, delta) {
    // Проверка наличия товара
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
        // Если количество становится 0 или меньше, удаляем товар
        removeFromCart(productId);
    } else {
        // Иначе обновляем количество и отображение
        item.quantity = newQuantity;
        renderCart();
    }
    
    saveCartToStorage();
}

/**
 * Подсчёт общей стоимости всех товаров в корзине.
 * @returns {number}  - возвращает общую сумму
 */
function calculateTotal() {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Обновление состояния кнопки "Оформить заказ"
function updateCheckoutButtonState() {
    if (checkoutBtn) {
        checkoutBtn.disabled = cartItems.length === 0;
    }
}

/**
 * Отрисовка корзины на основе массива cartItems
 */
function renderCart() {
    if (!cartContainer) return;

    // Очистка контейнера
    cartContainer.innerHTML = '';

    // Если корзина пуста, добавляем элемент с показом сообщение
    if (cartItems.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Корзина пуста';
        cartContainer.appendChild(emptyMessage);
        totalPriceSpan.textContent = '0 ₽';
        updateCheckoutButtonState(); // обновление состояния кнопки оформления заказа
        return;
    }

    // Создание элементов для каждого товара
    cartItems.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';

        // Блок с названием и ценой за единицу
        const infoDiv = document.createElement('div');
        infoDiv.className = 'cart-item-info';
        infoDiv.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">${item.price} ₽</span>
        `;

        // Блок с кнопками управления количеством
        const quantityDiv = document.createElement('div');
        quantityDiv.className = 'cart-item-quantity';
        quantityDiv.innerHTML = `
            <button class="quantity-btn minus" data-id="${item.id}" data-delta="-1">-</button>
            <span class="item-quantity">${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}" data-delta="1">+</button>
        `;

        // Общая стоимость позиции
        const itemTotalDiv = document.createElement('div');
        itemTotalDiv.className = 'cart-item-total';
        itemTotalDiv.textContent = `${item.price * item.quantity} ₽`;

        // Кнопка полного удаления позиции
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item-btn';
        removeBtn.textContent = 'Удалить';
        removeBtn.dataset.id = item.id;

        // Сбор карточки товара в корзине
        cartItemDiv.appendChild(infoDiv);
        cartItemDiv.appendChild(quantityDiv);
        cartItemDiv.appendChild(itemTotalDiv);
        cartItemDiv.appendChild(removeBtn);

        cartContainer.appendChild(cartItemDiv);
    });

    // Обновляем итоговую сумму
    totalPriceSpan.textContent = `${calculateTotal()} ₽`;
    updateCheckoutButtonState(); // обновление состояния кнопки оформления заказа
}

// Обработчики событий

// Обработчик для кнопок "Добавить в корзину"
addToCartButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const productId = parseInt(event.currentTarget.dataset.productId);
        addToCart(productId);
    });
});

// Обработчик для кнопок внутри корзины
cartContainer.addEventListener('click', (event) => {
    const target = event.target;

    // Кнопки "+" и "-"
    if (target.classList.contains('quantity-btn')) {
        const productId = parseInt(target.dataset.id);
        const delta = parseInt(target.dataset.delta);
        changeQuantity(productId, delta);
    }

    // Кнопка "Удалить"
    if (target.classList.contains('remove-item-btn')) {
        const productId = parseInt(target.dataset.id);
        removeFromCart(productId);
    }
});

// Объекты модального окна заказа
const checkoutBtn = document.querySelector('.checkout-btn');
const modalOverlay = document.getElementById('orderModalOverlay');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const orderForm = document.getElementById('orderForm');

// Открыть модальное окно
function openModal() {
    modalOverlay.style.display = 'flex';
}

// Закрыть модальное окно
function closeModal() {
    modalOverlay.style.display = 'none';
    // Очистить поля формы
    orderForm.reset();
}

// Обработчик клика на кнопку "Оформить заказ", не сработает, если кнопка disabled
checkoutBtn.addEventListener('click', openModal);

// Обработчик клика на кнопку закрытия
modalCloseBtn.addEventListener('click', closeModal);

// Закрытие модального окна при клике на фон
modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

// Обработка отправки формы
orderForm.addEventListener('submit', (event) => {
    event.preventDefault(); // не перезагружать страницу

    // Сообщение о создании заказа
    alert('Заказ создан!');

    // Очистить корзину
    cartItems = [];
    renderCart();
    saveCartToStorage();

    // Закрыть модальное окно
    closeModal();
});

// Инициализация, по умолчанию пустая корзина
renderCart();

console.log('Скрипт логики корзины загружен');