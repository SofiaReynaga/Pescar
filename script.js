// Datos de productos
const products = [
    {
        id: 1,
        name: 'Camiseta Premium',
        category: 'camisetas',
        price: 29.99,
        description: 'Camiseta de algodón 100% de alta calidad',
        emoji: '👕',
        rating: 4.5
    },
    {
        id: 2,
        name: 'Jeans Clásicos',
        category: 'pantalones',
        price: 79.99,
        description: 'Jeans azul oscuro durable y cómodo',
        emoji: '👖',
        rating: 4.8
    },
    {
        id: 3,
        name: 'Vestido Elegante',
        category: 'vestidos',
        price: 129.99,
        description: 'Vestido negro perfecto para ocasiones especiales',
        emoji: '👗',
        rating: 4.7
    },
    {
        id: 4,
        name: 'Chaqueta de Cuero',
        category: 'accesorios',
        price: 199.99,
        description: 'Chaqueta de cuero genuino',
        emoji: '🧥',
        rating: 4.9
    },
    {
        id: 5,
        name: 'Pantalones Deportivos',
        category: 'pantalones',
        price: 49.99,
        description: 'Pantalones cómodos para el ejercicio',
        emoji: '🩳',
        rating: 4.6
    },
    {
        id: 6,
        name: 'Gorro Urbano',
        category: 'accesorios',
        price: 19.99,
        description: 'Gorro de moda para cualquier estación',
        emoji: '🎩',
        rating: 4.4
    },
    {
        id: 7,
        name: 'Blusa Casual',
        category: 'camisetas',
        price: 39.99,
        description: 'Blusa fresca y moderna',
        emoji: '👚',
        rating: 4.5
    },
    {
        id: 8,
        name: 'Falda Midi',
        category: 'vestidos',
        price: 59.99,
        description: 'Falda elegante y versátil',
        emoji: '👛',
        rating: 4.3
    }
];

// Variables globales
let cart = [];
let currentProduct = null;
const STORAGE_KEY = 'fashionhub_cart';

// Elementos del DOM
const productsGrid = document.getElementById('products-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartBtn = document.getElementById('close-cart');
const cartToggle = document.getElementById('carrito-toggle');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const addToCartBtn = document.getElementById('add-to-cart-btn');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const checkoutBtn = document.getElementById('checkout-btn');
const contactForm = document.getElementById('contact-form');

// Cargar carrito desde localStorage
function loadCart() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

// Renderizar productos
function renderProducts(productsToShow = products) {
    productsGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-primary product-btn" onclick="openProductModal(${product.id})">Ver Detalles</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Filtrar productos
function filterProducts() {
    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const price = priceFilter.value;
    
    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search) || 
                             product.description.toLowerCase().includes(search);
        const matchesCategory = !category || product.category === category;
        const matchesPrice = !price || checkPriceRange(product.price, price);
        
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    renderProducts(filtered);
}

function checkPriceRange(price, range) {
    if (range === '0-50') return price < 50;
    if (range === '50-100') return price >= 50 && price < 100;
    if (range === '100-200') return price >= 100 && price < 200;
    if (range === '200') return price >= 200;
    return true;
}

// Abrir modal de producto
function openProductModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;
    
    document.getElementById('modal-title').textContent = currentProduct.name;
    document.getElementById('modal-description').textContent = currentProduct.description;
    document.getElementById('modal-price').textContent = `$${currentProduct.price.toFixed(2)}`;
    document.getElementById('modal-image').textContent = currentProduct.emoji;
    document.getElementById('quantity-input').value = 1;
    document.getElementById('size-select').value = 'M';
    
    productModal.classList.add('active');
}

// Cerrar modal
function closeModal() {
    productModal.classList.remove('active');
    currentProduct = null;
}

// Agregar al carrito
function addToCart() {
    if (!currentProduct) return;
    
    const quantity = parseInt(document.getElementById('quantity-input').value);
    const size = document.getElementById('size-select').value;
    
    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        quantity: quantity,
        size: size,
        emoji: currentProduct.emoji
    };
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === currentProduct.id && item.size === size);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push(cartItem);
    }
    
    saveCart();
    updateCartUI();
    closeModal();
    
    // Mostrar notificación
    showNotification('Producto agregado al carrito! ✨');
}

// Actualizar UI del carrito
function updateCartUI() {
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;
    
    // Renderizar items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.emoji} ${item.name}</div>
                    <div class="cart-item-size">Talla: ${item.size} | Cantidad: ${item.quantity}</div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">Eliminar</button>
            </div>
        `).join('');
    }
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalSpan.textContent = `$${total.toFixed(2)}`;
}

// Eliminar del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showNotification('Producto eliminado del carrito');
}

// Mostrar notificación
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 400;
        animation: slideInDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Proceder a pago
function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`¡Gracias por tu compra!\n\nTotal: $${total.toFixed(2)}\n\nEste es un sitio de demostración.`);
    cart = [];
    saveCart();
    updateCartUI();
    cartSidebar.classList.remove('active');
}

// Manejar formulario de contacto
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('¡Mensaje enviado! Te contactaremos pronto.');
    contactForm.reset();
});

// Event listeners
cartToggle.addEventListener('click', () => {
    cartSidebar.classList.toggle('active');
});

closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
});

closeModalBtn.addEventListener('click', closeModal);

addToCartBtn.addEventListener('click', addToCart);

searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);
priceFilter.addEventListener('change', filterProducts);

checkoutBtn.addEventListener('click', checkout);

// Cerrar modal al hacer clic fuera
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
        closeModal();
    }
});

// Cerrar carrito al hacer clic fuera
window.addEventListener('click', (e) => {
    if (!cartSidebar.contains(e.target) && !cartToggle.contains(e.target)) {
        if (cartSidebar.classList.contains('active') && e.target !== cartSidebar) {
            // cartSidebar.classList.remove('active');
        }
    }
});

// Inicializar
loadCart();
renderProducts();