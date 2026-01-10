import { products } from './data.js';

export let cart = JSON.parse(localStorage.getItem('sulatKamayCart')) || [];

// =========================================
// 1. HELPER: TOASTS
// =========================================
export function showToast(message) {
    const box = document.getElementById('toast-box');
    if (!box) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🍂</span> ${message}`;
    box.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// =========================================
// 2. CORE CART LOGIC
// =========================================

export function addToCart(id, customItem = null) {
    let itemToAdd;

    if (customItem) {
        itemToAdd = customItem;
    } else {
        const product = products.find(p => p.id === id);
        if (!product) return;
        itemToAdd = { ...product }; 
    }

    // 1. Add Timestamp (for "Just now" logic)
    itemToAdd.timestamp = Date.now(); 
    // 2. Add Formatted Date (for persistence)
    itemToAdd.addedAt = new Date().toLocaleString('en-US', { 
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
    });

    cart.push(itemToAdd);
    saveCart();
    updateCartUI();
    showToast("Added to your Keepsake Box");
}

export function updateCartItem(index, newItem) {
    if (cart[index]) {
        newItem.timestamp = cart[index].timestamp;
        newItem.addedAt = cart[index].addedAt;
        
        cart[index] = newItem;
        saveCart();
        updateCartUI();
        showToast("Keepsake updated successfully");
    }
}

export function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast("Item removed");
}

export function editCartItem(index) {
    const item = cart[index];
    if (item.rawBuilderData) {
        window.location.href = `customize.html?editIndex=${index}`;
    } else {
        showToast("Cannot edit this item.");
    }
}

function saveCart() { 
    localStorage.setItem('sulatKamayCart', JSON.stringify(cart)); 
}

// =========================================
// 3. UI RENDERING
// =========================================
export function updateCartUI() {
    const count = document.getElementById('cart-count');
    const totalSpan = document.getElementById('cart-total');
    const list = document.getElementById('cart-items');
    
    if(count) count.innerText = cart.length;
    
    const totalAmount = cart.reduce((acc, item) => acc + item.price, 0);
    if(totalSpan) totalSpan.innerText = totalAmount.toFixed(2);
    
    // Checkout Button Setup
    const checkoutBtn = document.querySelector('.cart-summary .cta-button');
    if(checkoutBtn) {
        checkoutBtn.onclick = openReceiptModal;
        checkoutBtn.innerText = "Proceed to Checkout";
    }

    if(list) {
        list.innerHTML = ''; 
        if(cart.length === 0) {
            list.innerHTML = `<li class="empty-cart-msg" style="text-align:center; padding:40px; color:#a1887f; font-style:italic;">Your box is currently empty.<br>Go write some memories.</li>`;
            if(checkoutBtn) checkoutBtn.style.display = 'none';
        } else {
            if(checkoutBtn) checkoutBtn.style.display = 'block';
            
            cart.forEach((item, index) => {
                let descHtml = '';
                
                if (item.rawBuilderData) {
                    if(item.rawBuilderData.letterTo) {
                        descHtml += `<span class="cart-recipient">To: ${item.rawBuilderData.letterTo}</span>`;
                    }
                    if(item.rawBuilderData.selectedAddons && item.rawBuilderData.selectedAddons.length > 0) {
                        const addonNames = item.rawBuilderData.selectedAddons.map(a => `+ ${a.name}`).join('<br>');
                        descHtml += `<div class="cart-addons-list">${addonNames}</div>`;
                    }
                } else {
                    let cleanDesc = (item.desc || "").replace(/<[^>]*>?/gm, ' '); 
                    if(cleanDesc.length > 40) cleanDesc = cleanDesc.substring(0, 40) + '...';
                    descHtml = `<span class="item-desc">${cleanDesc}</span>`;
                }
                
                let timeDisplay = item.addedAt || ''; 
                const now = Date.now();
                if (item.timestamp && (now - item.timestamp < 60000)) {
                    timeDisplay = "Just now";
                }

                const showEdit = item.rawBuilderData ? 
                    `<span class="action-link edit-btn" onclick="editCartItem(${index})">EDIT</span>` : '';

                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="item-row-top">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-meta-block">${descHtml}</div>
                        </div>
                        <div class="item-price">P${item.price.toFixed(2)}</div>
                    </div>
                    <div class="item-row-bottom">
                        <div class="item-time">Added: ${timeDisplay}</div>
                        <div class="item-actions">
                            ${showEdit}
                            <span class="action-link remove-btn" onclick="removeFromCart(${index})">REMOVE</span>
                        </div>
                    </div>
                `;
                list.appendChild(li);
            });
        }
    }
}

// =========================================
// 4. RECEIPT MODAL LOGIC
// =========================================
export function openReceiptModal() {
    if(cart.length === 0) return showToast("Cart is empty");
    let nickname = prompt("Enter Nickname for Receipt (Optional):");
    if(nickname === null) return; 
    if(!nickname.trim()) nickname = "Guest";

    const cartModal = document.getElementById('cart-modal');
    if(cartModal) cartModal.style.display = 'none';
    const receiptModal = document.getElementById('receipt-modal');
    if(receiptModal) receiptModal.style.display = 'block';
    
    generateFiles(nickname);
}

export function closeReceipt() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.style.display = 'none';
}

function generateFiles(nickname) {
    const ref = 'SK-' + Math.floor(1000 + Math.random() * 9000); 
    const now = new Date();
    
    document.getElementById('r-ref').innerText = ref;
    document.getElementById('r-date').innerText = now.toLocaleDateString();
    document.getElementById('r-time').innerText = now.toLocaleTimeString();
    document.getElementById('r-nickname').innerText = nickname;
    document.getElementById('l-ref').innerText = ref;
    document.getElementById('l-nickname').innerText = nickname;

    const tbody = document.getElementById('r-items-body');
    const letterBody = document.getElementById('letter-content-body');
    
    tbody.innerHTML = '';
    letterBody.innerHTML = '';
    
    let total = 0;
    let hasLetters = false;

    cart.forEach(item => {
        total += item.price;
        
        // Order Slip Add-ons
        let addonsReceiptHtml = '';
        if (item.rawBuilderData && item.rawBuilderData.selectedAddons && item.rawBuilderData.selectedAddons.length > 0) {
            const names = item.rawBuilderData.selectedAddons.map(a => `&nbsp;&nbsp;<span class="receipt-addon-item">+ ${a.name}</span>`).join('<br>');
            addonsReceiptHtml = `<div class="receipt-addon-container">${names}</div>`;
        }

        tbody.innerHTML += `
            <tr>
                <td class="r-name">
                    ${item.name}
                    ${addonsReceiptHtml}
                </td>
                <td class="r-price">P${item.price.toFixed(2)}</td>
            </tr>
        `;

        // Letter Slip Content
        if (item.fullMessage) {
            hasLetters = true;
            
            // --- NEW LOGIC: Add "To: [Name]" ---
            let recipientHtml = '';
            if (item.rawBuilderData && item.rawBuilderData.letterTo) {
                recipientHtml = `<div class="task-recipient"><strong>TO:</strong> ${item.rawBuilderData.letterTo}</div>`;
            }

            letterBody.innerHTML += `
                <div class="transcription-task">
                    ${recipientHtml}
                    <div class="task-message">"${item.fullMessage}"</div>
                </div><hr class="task-divider">
            `;
        }
    });

    document.getElementById('r-total').innerText = total.toFixed(2);

    setTimeout(() => {
        html2canvas(document.getElementById('receipt-preview'), { scale: 2 }).then(canvas => {
            const img = document.getElementById('img-preview-order');
            const btn = document.getElementById('btn-dl-order');
            if(img) img.src = canvas.toDataURL("image/png");
            if(btn) { btn.href = canvas.toDataURL("image/png"); btn.download = `Order_${ref}.png`; }
        });
        
        const blockLetter = document.getElementById('block-letter');
        const sourceLetter = document.getElementById('letter-slip');

        if (hasLetters && sourceLetter) {
            if(blockLetter) blockLetter.style.display = 'block';
            html2canvas(sourceLetter, { scale: 2 }).then(canvas => {
                const img = document.getElementById('img-preview-letter');
                const btn = document.getElementById('btn-dl-letter');
                if(img) img.src = canvas.toDataURL("image/png");
                if(btn) { btn.href = canvas.toDataURL("image/png"); btn.download = `Letter_${ref}.png`; }
            });
        } else if (blockLetter) {
            blockLetter.style.display = 'none';
        }
    }, 100);
}