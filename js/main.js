import { products } from './data.js';
import { addToCart, removeFromCart, updateCartUI, closeReceipt, openReceiptModal, editCartItem } from './cart.js';
import { selectBox, toggleAddon, addBundleToCart, initLetterBuilder, checkUrlForBoxSelection } from './builder.js';
import { runIntroSequence, initScrollAnimations } from './home-animations.js';
import { initShopScrollSpy } from './shop-animations.js';

// EXPOSE FUNCTIONS GLOBALLY (Required for HTML onclick attributes)
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.editCartItem = editCartItem; // Exposed for the Cart Edit button
window.selectBox = selectBox;
window.toggleAddon = toggleAddon;
window.addBundleToCart = addBundleToCart;
window.closeReceipt = closeReceipt;

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    
    // --- Page Routing Logic ---
    const path = window.location.pathname;

    // Shop Page
    if (path.includes('shop.html')) {
        const addonsContainer = document.getElementById('addons-container');
        if (addonsContainer) renderShop(addonsContainer);
        if (typeof initShopScrollSpy === 'function') initShopScrollSpy();
    }
    
    // Builder Page
    else if (path.includes('customize.html')) {
        if (document.getElementById('letter-preview')) {
            initLetterBuilder(); 
            // checkUrlForBoxSelection is handled inside initLetterBuilder -> checkForEditMode now
        }
    }

    // Home Page
    else if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        if (document.getElementById('intro-overlay')) {
            runIntroSequence();
            initScrollAnimations();
        }
    }
    
    setupModal();
});

// Render Add-ons in Shop
function renderShop(container) {
    container.innerHTML = ''; 
    const addOns = products.filter(p => p.category === 'addon');

    addOns.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="img-container">
                <img src="${product.img}" alt="${product.name}">
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

// Modal Toggle Logic
function setupModal() {
    const modal = document.getElementById('cart-modal');
    const btn = document.getElementById('cart-btn');
    const close = document.querySelector('.close');

    if(btn) btn.onclick = (e) => { 
        e.preventDefault(); 
        // Logic inside cart.js handles the render, but we need to show the modal here
        // The listener is actually usually inside main.js or separate. 
        // Based on previous files, let's ensure it's hooked up.
        import('./cart.js').then(module => module.updateCartUI()); // Refresh UI just in case
        if(modal) modal.style.display = "block"; 
    };
    
    if(close) close.onclick = () => {
        if(modal) modal.style.display = "none";
    };
    
    window.onclick = (e) => { 
        if(e.target == modal) modal.style.display = "none"; 
        const receiptModal = document.getElementById('receipt-modal');
        if(e.target == receiptModal) closeReceipt();
    };
}