console.log('main.js started loading at:', new Date().toISOString());

// Cookie Management (global functions for all pages)
function showCookiePopup(attempt = 1, maxAttempts = 10) {
    console.log(`Attempt ${attempt} to show cookie popup`);
    if (!localStorage.getItem('cookiesAccepted')) {
        const cookiePopup = document.getElementById('cookie-popup');
        if (cookiePopup) {
            console.log('Cookie popup element found, showing after delay');
            console.log('Cookie popup HTML:', cookiePopup.outerHTML);
            setTimeout(() => {
                cookiePopup.classList.add('show');
                console.log('Added .show class to cookie popup');
            }, 2000);
        } else if (attempt < maxAttempts) {
            console.warn(`Cookie popup element not found, retrying (${attempt}/${maxAttempts})`);
            console.log('DOM state:', document.body ? 'Body exists' : 'Body not found');
            setTimeout(() => showCookiePopup(attempt + 1, maxAttempts), 500);
        } else {
            console.error('Cookie popup element not found after max attempts');
        }
    } else {
        console.log('Cookies already accepted or declined, skipping popup');
    }
}

function acceptCookies() {
    console.log('Cookies accepted');
    localStorage.setItem('cookiesAccepted', 'true');
    const cookiePopup = document.getElementById('cookie-popup');
    if (cookiePopup) {
        cookiePopup.classList.remove('show');
    }
}

function declineCookies() {
    console.log('Cookies declined');
    localStorage.setItem('cookiesAccepted', 'false');
    const cookiePopup = document.getElementById('cookie-popup');
    if (cookiePopup) {
        cookiePopup.classList.remove('show');
    }
}

// Initialize Cart as early as possible
if (!window.cart) {
    console.log('Creating new ShoppingCart instance');
    class ShoppingCart {
        constructor() {
            console.log('Initializing ShoppingCart...');
            this.items = JSON.parse(localStorage.getItem('cart')) || [];
            console.log('Initial cart items:', this.items);
            this.updateCartCount();
            this.loadFeaturedProducts();
        }

        addItem(product) {
            console.log('Adding item to cart:', product);
            const existingItem = this.items.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({ ...product, quantity: 1 });
            }
            
            this.saveCart();
            this.updateCartCount();
            this.showNotification('Product added to cart!');
        }

        removeItem(productId) {
            console.log('Removing item:', productId);
            this.items = this.items.filter(item => item.id !== productId);
            this.saveCart();
            this.updateCartCount();
        }

        updateQuantity(productId, quantity) {
            console.log(`Updating quantity for product ${productId} to ${quantity}`);
            const item = this.items.find(item => item.id === productId);
            if (item) {
                if (quantity <= 0) {
                    this.removeItem(productId);
                } else {
                    item.quantity = quantity;
                    this.saveCart();
                    this.updateCartCount();
                }
            }
        }

        getTotal() {
            return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        }

        getItemCount() {
            return this.items.reduce((count, item) => count + item.quantity, 0);
        }

        saveCart() {
            console.log('Saving cart to localStorage:', this.items);
            localStorage.setItem('cart', JSON.stringify(this.items));
        }

        updateCartCount() {
            console.log('Updating cart count:', this.getItemCount());
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                cartCount.textContent = this.getItemCount();
            } else {
                console.warn('Cart count element not found');
            }
        }

        clearCart() {
            console.log('Clearing cart');
            this.items = [];
            this.saveCart();
            this.updateCartCount();
        }

        showNotification(message) {
            console.log('Showing notification:', message);
            const notification = document.createElement('div');
            notification.className = 'alert alert-success position-fixed';
            notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
            notification.innerHTML = `
                <i class="fas fa-check-circle me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
        }

        loadFeaturedProducts() {
            console.log('Loading featured products...');
            const container = document.getElementById('featured-products');
            if (!container) {
                console.log('Featured products container not found');
                return;
            }

            const isIndexPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
            const imagePathPrefix = isIndexPage ? 'images/' : '../images/';
            const featuredProducts = products.slice(0, 3).map(product => ({
                ...product,
                image: imagePathPrefix + product.image.split('/').pop()
            }));
            
            try {
                container.innerHTML = featuredProducts.map(product => `
                    <div class="col-md-4">
                        <div class="card bg-dark-card border-purple h-100 product-card">
                            <div class="position-relative">
                                <img src="${product.image}" class="card-img-top product-image" alt="${product.name}" 
                                     style="height: 200px; object-fit: cover;">
                                <span class="badge badge-category position-absolute top-0 end-0 m-2">${product.badge}</span>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title text-white">${product.name}</h5>
                                <p class="card-text text-light-1 flex-grow-1">${product.description}</p>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <span class="h5 text-purple mb-0">$${product.price}</span>
                                    <button class="btn btn-purple btn-sm" onclick="cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                        <i class="fas fa-cart-plus me-1"></i>Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
                console.log('Featured products rendered successfully');
            } catch (error) {
                console.error('Error rendering featured products:', error);
            }
        }
    }

    window.cart = new ShoppingCart();
} else {
    console.log('Cart already defined, skipping initialization');
}

// Product Data (aligned with shop/index.html)
const products = [
    {
        id: 1,
        name: "110 Diamonds",
        price: 1.49,
        image: "../images/battle-pass.jpg",
        category: "Diamonds",
        description: "Perfect starter pack for essential items and quick upgrades.",
        badge: "Popular"
    },
    {
        id: 2,
        name: "231 Diamonds",
        price: 2.99,
        image: "../images/akm-skin.jpg",
        category: "Diamonds",
        description: "Great value for weapon skins and character upgrades.",
        badge: "Limited"
    },
    {
        id: 3,
        name: "583 Diamonds",
        price: 6.99,
        image: "../images/elite-outfit.jpg",
        category: "Diamonds",
        description: "Excellent choice for serious players and collectors..",
        badge: "New"
    },
    {
        id: 4,
        name: "5600 Diamonds",
        price: 64.99,
        image: "../images/uc-credits.jpg",
        category: "Diamonds",
        description: "Professional player pack with maximum value.",
        badge: "Best Value"
    },
    {
        id: 5,
        name: "1188 Diamonds",
        price: 13.99,
        image: "../images/pro-bundle.jpg",
        category: "Diamonds",
        description: "Premium pack for Elite Pass and exclusive content.",
        badge: "Hot Deal"
    },
    {
        id: 6,
        name: "2530 Diamonds",
        price: 29.99,
        image: "../images/victory-emote.jpg",
        category: "Diamonds",
        description: "Ultimate pack for the most dedicated gamers.",
        badge: "Trending"
    },
    {
        id: 7,
        name: "5600 Diamonds",
        price: 64.99,
        image: "../images/sniper-skin.webp",
        category: "Diamonds",
        description: "Professional player pack with maximum value.",
        badge: "Limited"
    },
    {
        id: 8,
        name: "$10 Gift Card",
        price: 10.0,
        image: "../images/helmet.jpg",
        category: "Gift Cards",
        description: "Perfect gift for any Free Fire enthusiast.",
        badge: "New"
    },
    {
        id: 9,
        name: "$25 Gift Card",
        price: 25.00,
        image: "../images/uc-credits-2k.jpg",
        category: "Gift Cards",
        description: "Excellent value gift card for serious gamers.",
        badge: "Best Value"
    },
    {
        id: 10,
        name: "$50 Gift Card",
        price: 50.00,
        image: "../images/ultimate-pack.jpg",
       category: "Gift Cards",
        description: "Excellent value gift card for serious gamers.",
        badge: "Premium"
    },
    {
        id: 11,
        name: "Cobra Rage Bundle",
        price: 19.99,
        image: "../images/chicken-dinner.jpg",
        category: "Bundles",
        description: "Exclusive skin bundle with weapon attachments.",
        badge: "Popular"
    },
    {
        id: 12,
        name: "Elite Pass Bundle",
        price: 24.99,
        image: "../images/season-pass.jpg",
        category: "Bundles",
        description: "Complete Elite Pass with bonus diamonds included.",
        badge: "Hot Deal"
    },
        {
        id: 13,
        name: "Vehicle Skin Pack",
        price: 22.99,
        image: "../images/season-pass.jpg",
        category: "Bundles",
        description: "Complete collection of vehicle skins and upgrades.",
        badge: "Hot Deal"
    },
        {
        id: 14,
        name: "Dragon AK Skin",
        price: 15.99,
        image: "../images/season-pass.jpg",
        category: "Special Offers",
        description: "Legendary weapon skin with special effects.",
        badge: "Hot Deal"
    },
     {
        id: 15,
        name: "Chrono Character",
        price: 39.99,
        image: "../images/season-pass.jpg",
        category: "Special Offers",
        description: "Unlock the powerful Chrono character with unique abilities.",
        badge: "Hot Deal"
    },
      {
        id: 16,
        name: "Pet Collection",
        price: 18.99,
        image: "../images/season-pass.jpg",
        category: "Special Offers",
        description: "Exclusive pet bundle with rare companions.",
        badge: "Hot Deal"
    },
      {
        id: 17,
        name: "Mystery Loot Box",
        price: 9.99,
        image: "../images/season-pass.jpg",
        category: "Special Offers",
        description: "Surprise box containing rare skins and items.",
        badge: "Hot Deal"
    }
];

// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing contact form and cookie popup');
    showCookiePopup();
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Contact form submitted');
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Message Sent!';
                submitBtn.classList.remove('btn-gradient');
                submitBtn.classList.add('btn-success');
                
                this.reset();
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-success');
                    submitBtn.classList.add('btn-gradient');
                }, 3000);
            }, 1500);
        });
    }
    if (window.cart) {
        try {
            window.cart.updateCartCount();
            window.cart.loadFeaturedProducts();
        } catch (error) {
            console.error('Error in cart initialization:', error);
        }
    } else {
        console.error('Cart object not found in global DOMContentLoaded handler');
    }
});

// Search Functionality
function searchProducts(query) {
    console.log('Searching products with query:', query);
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );
    return filteredProducts;
}

// Utility Functions
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export products for potential use in other pages
window.products = products;

console.log('main.js finished loading at:', new Date().toISOString());