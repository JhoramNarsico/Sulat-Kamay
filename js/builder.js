import { addToCart } from './cart.js';

let builderState = { selectedBox: null, addons: [], letter: { to: '', body: '' } };

export function initLetterBuilder() {
    // Auto-set Date
    const dateElem = document.getElementById('preview-date');
    if(dateElem) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        dateElem.innerText = new Date().toLocaleDateString('en-US', options);
    }
    
    // Live Typing Listeners
    const recipientInput = document.getElementById('recipient-name');
    if(recipientInput) {
        recipientInput.addEventListener('input', (e) => {
            document.getElementById('preview-name').innerText = e.target.value || "My Dearest...";
        });
    }
    
    const bodyInput = document.getElementById('letter-content');
    if(bodyInput) {
        bodyInput.addEventListener('input', (e) => {
            document.getElementById('preview-body').innerText = e.target.value || "Your words will appear here...";
        });
    }
}

export function selectBox(id, price, theme) {
    builderState.selectedBox = { id, name: `Curated Box "${theme}"`, price, theme };
    
    // UI Updates
    document.querySelectorAll('.selection-card').forEach(card => card.classList.remove('selected'));
    
    // Find the clicked card based on theme class
    const card = document.querySelector(`.theme-${theme.toLowerCase()}`);
    if(card) card.classList.add('selected');
    
    // Activate Steps
    document.querySelectorAll('.build-step').forEach(step => step.classList.add('active'));
    
    // Update Summary
    document.getElementById('selected-box-name').innerText = builderState.selectedBox.name;
    
    // Update Paper Style
    const preview = document.getElementById('letter-preview');
    preview.classList.remove('style-Love', 'style-Cute', 'style-Flowers');
    preview.classList.add(`style-${theme}`);
    
    // Scroll to next step gently
    document.getElementById('step-2').scrollIntoView({ behavior: 'smooth', block: 'center' });

    calculateBuilderTotal();
}

export function toggleAddon(element, name, price) {
    if(!builderState.selectedBox) {
        alert("Please choose a vessel (Box) first!");
        document.getElementById('step-1').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    element.classList.toggle('selected');
    
    // Check if exists
    const index = builderState.addons.findIndex(item => item.name === name);
    
    if (index > -1) {
        builderState.addons.splice(index, 1); // Remove
    } else {
        builderState.addons.push({ name, price }); // Add
    }
    
    // Update UI text
    const count = builderState.addons.length;
    document.getElementById('addon-count').innerText = count === 0 ? "0 Add-ons" : `${count} Add-on${count > 1 ? 's' : ''}`;
    
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
    
    if (!recipient && !message) {
        if(!confirm("You haven't written a letter yet. Add blank paper?")) return;
    }

    // Build Description string with Add-ons
    let addonString = 'None';
    if(builderState.addons.length > 0) {
        addonString = builderState.addons.map(a => a.name).join(', ');
    }

    // Create a composite Item
    const bundleItem = {
        id: 'bundle-' + Date.now(),
        name: `BUNDLE: ${builderState.selectedBox.name}`,
        price: parseFloat(document.getElementById('builder-total').innerText),
        desc: `
            <b>To:</b> ${recipient || 'Blank'}<br>
            <b>Add-ons:</b> ${addonString}
        `,
        // Save the raw text for the receipt generator
        fullMessage: message 
    };
    
    addToCart(null, bundleItem);
}

// --- NEW FUNCTION: Check URL for Auto-Selection ---
export function checkUrlForBoxSelection() {
    const params = new URLSearchParams(window.location.search);
    const boxId = params.get('box');

    if (boxId) {
        // Map IDs to their Data
        const boxMap = {
            '1': { price: 280, theme: 'Love' },
            '2': { price: 190, theme: 'Cute' },
            '3': { price: 160, theme: 'Flowers' }
        };

        const box = boxMap[boxId];
        
        if (box) {
            // Trigger selection
            selectBox(parseInt(boxId), box.price, box.theme);
            
            // Clean URL so refresh doesn't jump again
            window.history.replaceState({}, document.title, "customize.html");
        }
    }
}