export const authLinks = (isloggedin) => {
    const authSection = document.querySelector('.auth');
    const guestSection = document.querySelector('.guest');

    if (isloggedin) {
        authSection.style.display = 'flex';
        guestSection.style.display = 'none';
    } else {
        authSection.style.display = 'none';
        guestSection.style.display = 'flex';
    }
};

export const renderCart = (cart) => {
    if (Object.keys(cart).length === 0) {
        return '<p>Your cart is empty</p>';
    }

    return Object.values(cart).map(item => `
        <div class="flex items-center mb-4 border border-gray-300 p-4" data-id="${item.id}">
            <img src="${item.image}" alt="${item.title}" class="w-16 h-16 mr-4">
            <div class="flex-1">
                <h3 class="text-lg font-semibold">${item.title}</h3>
                <p>Price: $${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
                <button class="text-red-600 remove-btn">Remove</button>
            </div>
        </div>
    `).join('');
};

export const renderOrderItems = (items) => {
    if (Object.keys(items).length === 0) {
        return '<p>No items in this order.</p>';
    }

    return Object.values(items).map(item => `
        <div class="flex items-center mb-4 border border-gray-300 p-4">
            <img src="${item.image}" alt="${item.title}" class="w-16 h-16 mr-4">
            <div class="flex-1">
                <h3 class="text-lg font-semibold">${item.title}</h3>
                <p>Price: $${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
};

export const cartCounter = (cart) => {
    return Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
};

const calculateOrderTotal = (items) => {
    return Object.values(items).reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

export const renderOrders = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) {
        return '<p>No orders found.</p>';
    }

    return orders.map((order, index) => {
        const items = order.items || {};
        const total = calculateOrderTotal(items);
        return `
            <div class="order mb-4 p-4 border border-gray-300">
                <h3 class="text-lg font-semibold">Order #${index + 1}</h3>
                <p>Address: ${order.address || 'N/A'}</p>
                <p>Status: ${order.status || 'N/A'}</p>
                <div>
                    <h4>Items:</h4>
                    ${renderOrderItems(items)}
                </div>
                <p class="font-bold">Total: $${total.toFixed(2)}</p>
                <button class="text-red-600 cancel-btn" data-index="${index}">Cancel Order</button>
            </div>
        `;
    }).join('');
};

export const addDynamicEventListener = (parent, event, selector, handler) => {
    parent.addEventListener(event, (e) => {
        const target = e.target.closest(selector);
        if (target) {
            handler(e);
        }
    });
};

export function removeFromCart(itemId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    delete cart[itemId];
    localStorage.setItem('cart', JSON.stringify(cart));

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.forEach(order => {
        if (order.items && order.items[itemId]) {
            delete order.items[itemId];
        }
    });

    const updatedOrders = orders.filter(order => {
        return order.items && Object.keys(order.items).length > 0;
    });

    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    return cart;
}

const cancelOrder = (index) => {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (index >= 0 && index < orders.length) {
        orders.splice(index, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        window.location.reload();
    }
};

export const initRemoveButtons = () => {
    const cartDiv = document.querySelector('#cart');

    addDynamicEventListener(cartDiv, 'click', '.remove-btn', (e) => {
        const itemId = e.target.closest('[data-id]').dataset.id;
        const updatedCart = removeFromCart(itemId);
        
        cartDiv.innerHTML = renderCart(updatedCart);
        document.querySelector('#cart_counter').innerHTML = cartCounter(updatedCart);
    });
};

export const initCancelButtons = () => {
    const ordersContainer = document.querySelector('#ordersContainer');
    addDynamicEventListener(ordersContainer, 'click', '.cancel-btn', (e) => {
        const index = e.target.getAttribute('data-index');
        cancelOrder(index);
    });
};

export function handleLogout() {
    const logoutLink = document.querySelector('.auth a[href="dashboard.html?action=logout"]');

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isloggedin');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isloggedin') === 'true';
    authLinks(isLoggedIn);

    const ordersContainer = document.querySelector('#ordersContainer');
    if (ordersContainer) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        ordersContainer.innerHTML = renderOrders(orders);
    } else {
        console.error('Orders container not found in the DOM.');
    }
});
