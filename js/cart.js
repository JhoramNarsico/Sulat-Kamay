import { products } from './data.js';

let cart = JSON.parse(localStorage.getItem('sulatKamayCart')) || [];

export function addToCart(id, customItem = null) {
    if (customItem) {
        cart.push(customItem);
    } else {
        const product = products.find(p => p.id === id);
        if(product) cart.push(product);
    }
    saveCart();
    updateCartUI();
    alert("Added to your Keepsake Box! 🍂");
}

export function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() { localStorage.setItem('sulatKamayCart', JSON.stringify(cart)); }

export function updateCartUI() {
    const count = document.getElementById('cart-count');
    const totalSpan = document.getElementById('cart-total');
    const list = document.getElementById('cart-items');
    
    if(count) count.innerText = cart.length;
    const totalAmount = cart.reduce((acc, item) => acc + item.price, 0);
    if(totalSpan) totalSpan.innerText = totalAmount.toFixed(2);
    
    if(list) {
        list.innerHTML = ''; 
        if(cart.length === 0) {
            list.innerHTML = `
                <li class="empty-cart-msg">
                    <span class="empty-icon">🍂</span>
                    <p>Your box is currently empty.</p>
                </li>
            `;
        } else {
            cart.forEach((item, index) => {
                let shortDesc = item.desc ? item.desc : "Handcrafted item";
                shortDesc = shortDesc.replace(/<[^>]*>?/gm, '').substring(0, 40) + '...';

                // Note: using window.removeFromCart to work with inline HTML
                list.innerHTML += `
                    <li>
                        <div class="item-details">
                            <span class="item-name">${item.name}</span>
                            <span class="item-desc">${shortDesc}</span>
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