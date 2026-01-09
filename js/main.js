import { products } from './data.js';
import { addToCart, removeFromCart, updateCartUI, closeReceipt } from './cart.js';
import { selectBox, toggleAddon, addBundleToCart, initLetterBuilder, checkUrlForBoxSelection } from './builder.js';
import { runIntroSequence, initScrollAnimations } from './home-animations.js';
import { initShopScrollSpy } from './shop-animations.js';

// EXPOSE FUNCTIONS GLOBALLY
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.selectBox = selectBox;
window.toggleAddon = toggleAddon;
window.addBundleToCart = addBundleToCart;
window.closeReceipt = closeReceipt; // This is now safely imported

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    
    // --- Shop Page Logic ---
    const addonsContainer = document.getElementById('addons-container');
    if (addonsContainer) {
        renderShop(addonsContainer);
        // Check if function exists before calling to prevent errors on other pages
        if (typeof initShopScrollSpy === 'function') initShopScrollSpy();
    }
    
    // --- Builder Page Logic ---
    if (document.getElementById('letter-preview')) {
        initLetterBuilder();
        checkUrlForBoxSelection();
    }

    // --- Home Page Logic ---
    if (document.getElementById('intro-overlay')) {
        runIntroSequence();
        initScrollAnimations();
    }
    
    // --- Modal Logic ---
    setupModal();
});

// Render Add-ons in Shop
function renderShop(container) {
    container.innerHTML = ''; 
    const addOns = products.filter(p => p.category === 'addon');

    addOns.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        const fallback = `https://via.placeholder.com/300x250?text=${encodeURIComponent(product.name)}`;
        
        card.innerHTML = `
            <div class="img-container">
                <img src="${product.img}" alt="${product.name}" onerror="this.src='${fallback}'">
            </div>
            <div class="card-content">
                <h3>${product.name}</h3>
                <p>${product.desc}</p>
                <div class="price-action-row">
                    <span class="price">P${product.price.toFixed(2)}</span>
                    <button class="add-btn" onclick="addToCart(${product.id})">Add</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Modal Toggle Logic
function setupModal() {
    const modal = document.getElementById('cart-modal');
    const btn = document.getElementById('cart-btn');
    const close = document.querySelector('.close');

    if(btn) btn.onclick = (e) => { 
        e.preventDefault(); 
        if(modal) modal.style.display = "block"; 
    };
    
    if(close) close.onclick = () => {
        if(modal) modal.style.display = "none";
    };
    
    window.onclick = (e) => { 
        if(e.target == modal) modal.style.display = "none"; 
    };
}