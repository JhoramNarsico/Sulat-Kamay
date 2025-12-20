import { addToCart } from './cart.js';

let builderState = { selectedBox: null, addons: [], letter: { to: '', body: '' } };

export function initLetterBuilder() {
    const dateElem = document.getElementById('current-date');
    if(dateElem) dateElem.innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    document.getElementById('recipient-name').addEventListener('input', (e) => {
        document.getElementById('preview-name').innerText = e.target.value || "Dearest...";
    });
    document.getElementById('letter-content').addEventListener('input', (e) => {
        document.getElementById('preview-body').innerText = e.target.value || "Your words will appear here...";
    });
}

export function selectBox(id, price, theme) {
    builderState.selectedBox = { id, name: `Curated Box "${theme}"`, price, theme };
    document.querySelectorAll('.selection-card').forEach(card => card.classList.remove('selected'));
    
    let themeClass = `.theme-${theme.toLowerCase()}`;
    if(theme === 'Flowers') themeClass = '.theme-flowers'; 
    
    const card = document.querySelector(themeClass);
    if(card) card.classList.add('selected');
    
    document.querySelectorAll('.build-step').forEach(step => step.classList.add('active'));
    const preview = document.getElementById('letter-preview');
    preview.className = `paper style-${theme}`;
    document.getElementById('selected-box-name').innerText = builderState.selectedBox.name;
    calculateBuilderTotal();
}

export function toggleAddon(element, name, price) {
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

export function addBundleToCart() {
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