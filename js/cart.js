import { products } from './data.js';

let cart = JSON.parse(localStorage.getItem('sulatKamayCart')) || [];

// =========================================
// 1. TOAST NOTIFICATIONS
// =========================================
function showToast(message) {
    const box = document.getElementById('toast-box');
    if (!box) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🍂</span> ${message}`;
    box.appendChild(toast);

    // Animation In
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto Remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// =========================================
// 2. CORE CART LOGIC
// =========================================
export function addToCart(id, customItem = null) {
    if (customItem) {
        cart.push(customItem);
    } else {
        const product = products.find(p => p.id === id);
        if(product) cart.push(product);
    }
    saveCart();
    updateCartUI();
    showToast("Added to your Keepsake Box");
}

export function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast("Item removed");
}

function saveCart() { 
    localStorage.setItem('sulatKamayCart', JSON.stringify(cart)); 
}

export function updateCartUI() {
    const count = document.getElementById('cart-count');
    const totalSpan = document.getElementById('cart-total');
    const list = document.getElementById('cart-items');
    
    // Update Counts/Totals
    if(count) count.innerText = cart.length;
    const totalAmount = cart.reduce((acc, item) => acc + item.price, 0);
    if(totalSpan) totalSpan.innerText = totalAmount.toFixed(2);
    
    // Setup Checkout Button
    const checkoutBtn = document.querySelector('.cart-summary .cta-button');
    if(checkoutBtn) {
        checkoutBtn.onclick = openReceiptModal;
        checkoutBtn.innerText = "Proceed to Checkout";
    }

    // Render List Items
    if(list) {
        list.innerHTML = ''; 
        if(cart.length === 0) {
            list.innerHTML = `<li class="empty-cart-msg"><span class="empty-icon">🍂</span><p>Your box is currently empty.</p></li>`;
            if(checkoutBtn) checkoutBtn.style.display = 'none';
        } else {
            if(checkoutBtn) checkoutBtn.style.display = 'block';
            cart.forEach((item, index) => {
                let clean = (item.desc || "").replace(/<[^>]*>?/gm, ''); 
                if(clean.length > 30) clean = clean.substring(0, 30) + '...';
                window.removeFromCart = removeFromCart; 
                list.innerHTML += `
                    <li>
                        <div class="item-details"><span class="item-name">${item.name}</span><span class="item-desc">${clean}</span></div>
                        <div class="item-price-action"><span class="item-price">P${item.price.toFixed(2)}</span><button onclick="window.removeFromCart(${index})" class="remove-btn">Remove</button></div>
                    </li>
                `;
            });
        }
    }
}

// =========================================
// 3. DUAL-FILE GENERATION SYSTEM
// =========================================

function openReceiptModal() {
    if(cart.length === 0) return showToast("Cart is empty");
    
    // 1. Prompt
    let nickname = prompt("Enter Nickname for Receipt (Optional):");
    if(nickname === null) return; // Cancelled
    if(!nickname.trim()) nickname = "Guest";

    // 2. UI Switch
    const cartModal = document.getElementById('cart-modal');
    if(cartModal) cartModal.style.display = 'none';

    const receiptModal = document.getElementById('receipt-modal');
    if(receiptModal) receiptModal.style.display = 'block';
    
    // 3. Generate
    generateFiles(nickname);
}

function generateFiles(nickname) {
    // A. Generate Metadata
    const ref = 'SK-' + Math.floor(1000 + Math.random() * 9000); 
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Fill HTML Source for Order Slip
    document.getElementById('r-ref').innerText = ref;
    document.getElementById('r-date').innerText = dateStr;
    document.getElementById('r-time').innerText = timeStr;
    document.getElementById('r-nickname').innerText = nickname;

    // Fill HTML Source for Letter Slip
    document.getElementById('l-ref').innerText = ref;
    document.getElementById('l-nickname').innerText = nickname;

    const tbody = document.getElementById('r-items-body');
    const letterBody = document.getElementById('letter-content-body');
    
    tbody.innerHTML = '';
    letterBody.innerHTML = '';
    
    let total = 0;
    let hasLetters = false;

    // B. Loop items and populate sources
    cart.forEach(item => {
        total += item.price;
        
        // 1. Add to Order Slip
        let details = '';
        if(item.desc && item.desc.includes('To:')) {
             const match = item.desc.match(/To:\s*([^<]*)/);
             if(match) details = `<br><small style="color:#5d4037; font-style:italic;">For: ${match[1]}</small>`;
        }
        tbody.innerHTML += `<tr><td class="r-name">${item.name}${details}</td><td class="r-price">P${item.price.toFixed(2)}</td></tr>`;

        // 2. Add to Letter Slip (if message exists)
        if (item.fullMessage) {
            hasLetters = true;
            letterBody.innerHTML += `
                <div class="transcription-task">
                    <div class="task-header"><strong>Subject:</strong> ${item.name}</div>
                    <div class="task-message">"${item.fullMessage}"</div>
                </div><hr class="task-divider">
            `;
        }
    });

    document.getElementById('r-total').innerText = total.toFixed(2);

    // C. Screenshot Generation (Order Slip)
    const sourceOrder = document.getElementById('receipt-preview');
    // We clear src to show loading state if needed
    document.getElementById('img-preview-order').src = '';
    
    setTimeout(() => {
        html2canvas(sourceOrder, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL("image/png");
            document.getElementById('img-preview-order').src = imgData;
            
            const btn = document.getElementById('btn-dl-order');
            btn.href = imgData;
            btn.download = `OrderSlip_${ref}.png`;
        });
    }, 100);

    // D. Screenshot Generation (Letter Slip) - Only if letters exist
    const blockLetter = document.getElementById('block-letter');
    const sourceLetter = document.getElementById('letter-slip');
    
    if (hasLetters) {
        blockLetter.style.display = 'block';
        document.getElementById('img-preview-letter').src = '';
        
        setTimeout(() => {
            html2canvas(sourceLetter, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL("image/png");
                document.getElementById('img-preview-letter').src = imgData;
                
                const btn = document.getElementById('btn-dl-letter');
                btn.href = imgData;
                btn.download = `LetterContent_${ref}.png`;
            });
        }, 300); // Slight delay after first one to prevent lag
    } else {
        blockLetter.style.display = 'none';
    }
}

// Global Close Function
window.closeReceipt = function() {
    document.getElementById('receipt-modal').style.display = 'none';
}