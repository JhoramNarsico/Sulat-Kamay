import { products } from './data.js';
import { addToCart, removeFromCart, updateCartUI, closeReceipt, openReceiptModal, editCartItem } from './cart.js';
import { selectBox, toggleAddon, addBundleToCart, initLetterBuilder } from './builder.js';
import { runIntroSequence, initScrollAnimations } from './home-animations.js';
import { initShopScrollSpy } from './shop-animations.js';

// EXPOSE FUNCTIONS GLOBALLY (Required for HTML onclick attributes)
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.editCartItem = editCartItem; 
window.selectBox = selectBox;
window.toggleAddon = toggleAddon;
window.addBundleToCart = addBundleToCart;
window.closeReceipt = closeReceipt;

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    
    // --- ROBUST PAGE DETECTION ---
    // Instead of checking URL strings (which break on Netlify),
    // we check if specific elements exist on the page.

    const addonsContainer = document.getElementById('addons-container');
    const letterPreview = document.getElementById('letter-preview');
    const introOverlay = document.getElementById('intro-overlay');

    // 1. SHOP PAGE LOGIC
    // We know we are on the Shop page if 'addons-container' exists
    if (addonsContainer) {
        renderShop(addonsContainer);
        // Initialize Scroll Spy for background color changes
        if (typeof initShopScrollSpy === 'function') {
            initShopScrollSpy();
        }
    }
    
    // 2. BUILDER / WRITE PAGE LOGIC
    // We know we are on the Write page if 'letter-preview' exists
    if (letterPreview) {
        initLetterBuilder(); 
    }

    // 3. HOME PAGE LOGIC
    // We know we are on the Home page if 'intro-overlay' exists
    if (introOverlay) {
        runIntroSequence();
        initScrollAnimations();
    }
    
    setupModal();
});

// Render Shop Addons Helper
function renderShop(container) {
    container.innerHTML = ''; 
    // Filter only items with category 'addon'
    const addOns = products.filter(p => p.category === 'addon');

    if (addOns.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">No items found.</p>';
        return;
    }

    addOns.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="img-container">
                <img src="${product.img}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-content">
                <h3>${product.name}</h3>
                <p>${product.desc || ''}</p>
                <div class="price-action-row">
                    <span class="price">P${product.price.toFixed(2)}</span>
                    <button class="add-btn" onclick="addToCart(${product.id})">Add</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Modal Toggle Logic (Cart & Receipt)
function setupModal() {
    const modal = document.getElementById('cart-modal');
    const btn = document.getElementById('cart-btn');
    const close = document.querySelector('.close');

    // Open Cart
    if(btn) btn.onclick = (e) => { 
        e.preventDefault(); 
        // Import dynamically to ensure UI is fresh, though mostly handled by cart.js export
        import('./cart.js').then(module => module.updateCartUI());
        if(modal) modal.style.display = "block"; 
    };
    
    // Close Cart via X button
    if(close) close.onclick = () => {
        if(modal) modal.style.display = "none";
    };
    
    // Close Modals on Outside Click
    window.onclick = (e) => { 
        if(e.target == modal) modal.style.display = "none"; 
        const receiptModal = document.getElementById('receipt-modal');
        if(e.target == receiptModal) closeReceipt();
    };
}