/* =========================================
   1. PRODUCT DATA
   ========================================= */
const products = [
    { id: 1, name: "Curated Box 'Love'", price: 280.00, category: "box", img: "assets/giftbox-love.jpg" },
    { id: 2, name: "Curated Box 'Cute'", price: 190.00, category: "box", img: "assets/giftbox-cute.jpg" },
    { id: 3, name: "Curated Box 'Flowers'", price: 160.00, category: "box", img: "assets/giftbox-flowers.jpg" },
    { id: 4, name: "Personalized Letter", price: 120.00, category: "addon", img: "assets/letter-personalized.jpg", desc: "Choose a theme. Handwritten with wax seal." },
    { id: 5, name: "Flower Bouquet (Add-on)", price: 150.00, category: "addon", img: "assets/addon-bouquet.jpg", desc: "Mini dried flower bouquet." },
    { id: 6, name: "Chocolates", price: 80.00, category: "addon", img: "assets/addon-choco.jpg", desc: "Sweet treats for your box." },
    { id: 7, name: "Polaroid-Inspired Photo", price: 5.00, category: "addon", img: "assets/polaroids.jpg", desc: "High quality print (per piece)." },
    { id: 8, name: "Aesthetic Stickers", price: 20.00, category: "addon", img: "assets/addon-stickers.jpg", desc: "Pack of vintage stickers." },
    { id: 9, name: "Hair Clips", price: 35.00, category: "addon", img: "assets/addon-clips.jpg", desc: "Cute aesthetic hair accessories." }
];

/* =========================================
   2. INITIALIZATION
   ========================================= */
let cart = JSON.parse(localStorage.getItem('sulatKamayCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    
    if (document.getElementById('addons-container')) renderShop();
    if (document.getElementById('letter-preview')) initLetterBuilder();

    const typingElement = document.getElementById('typing-text');
    if (typingElement) setTimeout(() => typeWriter(textToType, 0), 1000); 
});

/* =========================================
   3. CART LOGIC
   ========================================= */
function addToCart(id, customItem = null) {
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

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() { localStorage.setItem('sulatKamayCart', JSON.stringify(cart)); }

function updateCartUI() {
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
                    <p style="font-size:0.9rem; margin-top:10px;"><a onclick="document.querySelector('.close').click()" class="shop-link">Start filling it with memories</a></p>
                </li>
            `;
        } else {
            cart.forEach((item, index) => {
                const li = document.createElement('li');
                let shortDesc = item.desc ? item.desc : "Handcrafted item";
                shortDesc = shortDesc.replace(/<[^>]*>?/gm, '').substring(0, 40) + '...';

                li.innerHTML = `
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-desc">${shortDesc}</span>
                    </div>
                    <div class="item-price-action">
                        <span class="item-price">P${item.price.toFixed(2)}</span>
                        <button onclick="removeFromCart(${index})" class="remove-btn">Remove</button>
                    </div>
                `;
                list.appendChild(li);
            });
        }
    }
}

// Modal Event Listeners
const modal = document.getElementById('cart-modal');
const btn = document.getElementById('cart-btn');
const close = document.querySelector('.close');
if(btn) btn.onclick = (e) => { e.preventDefault(); modal.style.display = "block"; };
if(close) close.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; };

/* =========================================
   4. SHOP PAGE LOGIC (Add-ons)
   ========================================= */
function renderShop() {
    const container = document.getElementById('addons-container');
    if(!container) return;

    container.innerHTML = ''; 
    const addOns = products.filter(p => p.category === 'addon');

    addOns.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        const fallback = `https://via.placeholder.com/300x250?text=${encodeURIComponent(product.name)}`;
        
        card.innerHTML = `
            <img src="${product.img}" alt="${product.name}" onerror="this.src='${fallback}'">
            <h3>${product.name}</h3>
            <p style="font-size: 0.9rem; color: #795548; margin-bottom: 10px;">${product.desc}</p>
            <div class="price">P${product.price.toFixed(2)}</div>
            <button class="add-btn" onclick="addToCart(${product.id})">Add to Box</button>
        `;
        container.appendChild(card);
    });
}

/* =========================================
   5. HOME PAGE ANIMATION
   ========================================= */
const textToType = "My dearest, \n\nI just wanted to remind you that memories with the right people will always remain priceless. \n\nLet's keep this moment forever.";
const typingSpeed = 60;

function typeWriter(text, i) {
    const elem = document.getElementById('typing-text');
    if (!elem) return;
    
    if (i < text.length) {
        elem.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
        let delay = typingSpeed;
        if (text.charAt(i) === ',') delay = 400;
        if (text.charAt(i) === '.') delay = 500;
        setTimeout(() => typeWriter(text, i + 1), delay);
    } else {
        const staticSection = document.querySelector('.static-hero-text');
        const cursor = document.querySelector('.cursor');
        if(staticSection) staticSection.classList.add('visible');
        if(cursor) cursor.style.display = 'none';
    }
}

/* =========================================
   6. BUILDER LOGIC (Customize Page)
   ========================================= */
let builderState = { selectedBox: null, addons: [], letter: { to: '', body: '' } };

function initLetterBuilder() {
    const dateElem = document.getElementById('current-date');
    if(dateElem) dateElem.innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    document.getElementById('recipient-name').addEventListener('input', (e) => {
        document.getElementById('preview-name').innerText = e.target.value || "Dearest...";
    });
    document.getElementById('letter-content').addEventListener('input', (e) => {
        document.getElementById('preview-body').innerText = e.target.value || "Your words will appear here...";
    });
}

function selectBox(id, price, theme) {
    builderState.selectedBox = { id, name: `Curated Box "${theme}"`, price, theme };
    document.querySelectorAll('.selection-card').forEach(card => card.classList.remove('selected'));
    // Logic to find matching theme class (plural or singular handling)
    let themeClass = `.theme-${theme.toLowerCase()}`;
    if(theme === 'Flowers') themeClass = '.theme-flowers'; // Fix for plural issue
    
    const card = document.querySelector(themeClass);
    if(card) card.classList.add('selected');
    
    document.querySelectorAll('.build-step').forEach(step => step.classList.add('active'));
    const preview = document.getElementById('letter-preview');
    preview.className = `paper style-${theme}`;
    document.getElementById('selected-box-name').innerText = builderState.selectedBox.name;
    calculateBuilderTotal();
}

function toggleAddon(element, name, price) {
    if(!builderState.selectedBox) return alert("Please choose a box first!");
    element.classList.toggle('selected');
    const index = builderState.addons.findIndex(item => item.name === name);
    if (index > -1) builderState.addons.splice(index, 1);
    else builderState.addons.push({ name, price });
    document.getElementById('addon-count').innerText = `${builderState.addons.length} Add-ons`;
    calculateBuilderTotal();
}

function calculateBuilderTotal() {
    let total = 0;
    if (builderState.selectedBox) total += builderState.selectedBox.price;
    builderState.addons.forEach(addon => total += addon.price);
    document.getElementById('builder-total').innerText = total.toFixed(2);
}

function addBundleToCart() {
    if(!builderState.selectedBox) return alert("Please select a box to start.");
    const recipient = document.getElementById('recipient-name').value;
    const message = document.getElementById('letter-content').value;
    if (!recipient || !message) return alert("Don't forget to write your letter!");

    const bundleItem = {
        id: 'bundle-'+Date.now(),
        name: `BUNDLE: ${builderState.selectedBox.name}`,
        price: parseFloat(document.getElementById('builder-total').innerText),
        desc: `<b>To:</b> ${recipient}<br><b>Add-ons:</b> ${builderState.addons.map(a=>a.name).join(', ') || 'None'}`
    };
    addToCart(null, bundleItem);
}