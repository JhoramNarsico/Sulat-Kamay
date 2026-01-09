import { products } from './data.js';

// Load cart from LocalStorage or start empty
let cart = JSON.parse(localStorage.getItem('sulatKamayCart')) || [];

// =========================================
// 1. TOAST NOTIFICATION SYSTEM
// =========================================
function showToast(message) {
    const box = document.getElementById('toast-box');
    if (!box) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🍂</span> ${message}`;
    box.appendChild(toast);

    // Animation: Slide In
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto Remove after 3 seconds
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
        // Add custom bundle from Builder
        cart.push(customItem);
    } else {
        // Add standard item from Shop
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
    
    // Update Counter
    if(count) count.innerText = cart.length;
    
    // Update Total
    const totalAmount = cart.reduce((acc, item) => acc + item.price, 0);
    if(totalSpan) totalSpan.innerText = totalAmount.toFixed(2);
    
    // Hook the "Checkout" button to the new Receipt Modal
    const checkoutBtn = document.querySelector('.cart-summary .cta-button');
    if(checkoutBtn) {
        checkoutBtn.onclick = openReceiptModal; // Connects to the receipt system
        checkoutBtn.innerText = "Proceed to Checkout";
    }

    // Render List
    if(list) {
        list.innerHTML = ''; 
        if(cart.length === 0) {
            // Empty State
            list.innerHTML = `
                <li class="empty-cart-msg">
                    <span class="empty-icon">🍂</span>
                    <p>Your box is currently empty.</p>
                </li>
            `;
            if(checkoutBtn) checkoutBtn.style.display = 'none';
        } else {
            // Populate Items
            if(checkoutBtn) checkoutBtn.style.display = 'block';
            
            cart.forEach((item, index) => {
                let shortDesc = item.desc ? item.desc : "Handcrafted item";
                // Strip HTML tags for clean list view
                let cleanDesc = shortDesc.replace(/<[^>]*>?/gm, ''); 
                if(cleanDesc.length > 30) cleanDesc = cleanDesc.substring(0, 30) + '...';

                // Expose remove function to window for inline onclick
                window.removeFromCart = removeFromCart; 

                list.innerHTML += `
                    <li>
                        <div class="item-details">
                            <span class="item-name">${item.name}</span>
                            <span class="item-desc">${cleanDesc}</span>
                        </div>
                        <div class="item-price-action">
                            <span class="item-price">P${item.price.toFixed(2)}</span>
                            <button onclick="window.removeFromCart(${index})" class="remove-btn">Remove</button>
                        </div>
                    </li>
                `;
            });
        }
    }
}

// =========================================
// 3. RECEIPT & POS SYSTEM
// =========================================

function openReceiptModal() {
    if(cart.length === 0) return showToast("Your cart is empty!");

    // 1. Ask for Nickname (Optional)
    let nickname = prompt("Enter your Nickname for the receipt (Optional):");
    
    // Handle Cancel button
    if (nickname === null) return; 
    
    // Default if empty
    if (nickname.trim() === "") nickname = "Guest";

    // 2. Switch Modals (Hide Cart -> Show Receipt)
    const cartModal = document.getElementById('cart-modal');
    if(cartModal) cartModal.style.display = 'none';
    
    const receiptModal = document.getElementById('receipt-modal');
    if(receiptModal) receiptModal.style.display = 'block';

    // 3. Generate Data
    generateReceiptData(nickname);
}

function generateReceiptData(nickname) {
    // A. Generate Metadata (Ref, Date, Time)
    const ref = 'SK-' + Math.floor(1000 + Math.random() * 9000); 
    const now = new Date();
    
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Populate HTML Elements
    document.getElementById('r-ref').innerText = ref;
    document.getElementById('r-date').innerText = dateStr;
    const timeEl = document.getElementById('r-time');
    if(timeEl) timeEl.innerText = timeStr;
    
    const nickEl = document.getElementById('r-nickname');
    if(nickEl) nickEl.innerText = nickname;

    // B. Build Receipt Items Table
    const tbody = document.getElementById('r-items-body');
    tbody.innerHTML = '';
    
    let total = 0;

    cart.forEach(item => {
        total += item.price;
        
        // Add "For: [Name]" detail if it's a Bundle
        let details = '';
        if(item.desc && item.desc.includes('To:')) {
             const match = item.desc.match(/To:\s*([^<]*)/);
             if(match) {
                 details = `<br><small style="color:#5d4037; font-style:italic;">For: ${match[1]}</small>`;
             }
        }

        tbody.innerHTML += `
            <tr>
                <td class="r-name">${item.name}${details}</td>
                <td class="r-price">P${item.price.toFixed(2)}</td>
            </tr>
        `;
    });

    document.getElementById('r-total').innerText = total.toFixed(2);

    // C. Convert HTML Receipt to Image (Canvas)
    const receiptEl = document.getElementById('receipt-preview');
    const imgPreview = document.getElementById('receipt-canvas-img');
    const downloadLink = document.getElementById('download-link');

    // 1. Ensure HTML is visible for capture
    receiptEl.style.display = 'block';
    imgPreview.style.display = 'none';

    // 2. Wait 300ms for DOM to render styles before snapping
    setTimeout(() => {
        // Use solid background color to ensure text is readable
        html2canvas(receiptEl, { scale: 2, backgroundColor: '#fffdf5' }).then(canvas => {
            
            // 3. Hide HTML, Show Image
            receiptEl.style.display = 'none'; 
            imgPreview.style.display = 'block';
            
            // 4. Set Image Source
            const imgData = canvas.toDataURL("image/png");
            imgPreview.src = imgData;
            
            // 5. Update Download Link
            downloadLink.href = imgData;
            downloadLink.download = `SulatKamay_Order_${ref}.png`;
        });
    }, 300);
}

// Global Function to Close Receipt
window.closeReceipt = function() {
    document.getElementById('receipt-modal').style.display = 'none';
    
    // Reset view state for next time
    document.getElementById('receipt-preview').style.display = 'block'; 
    document.getElementById('receipt-canvas-img').style.display = 'none';
}