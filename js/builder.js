import { addToCart, updateCartItem, cart, showToast } from './cart.js';

let builderState = { selectedBox: null, addons: [], letter: { to: '', body: '' } };

const BOX_DATA = {
    1: { price: 280, theme: 'Love' },
    2: { price: 190, theme: 'Cute' },
    3: { price: 160, theme: 'Flowers' }
};

export function initLetterBuilder() {
    // Auto-set Date
    const dateElem = document.getElementById('preview-date');
    if(dateElem) dateElem.innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
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

    checkForEditMode();
}

function checkForEditMode() {
    const params = new URLSearchParams(window.location.search);
    const editIndex = params.get('editIndex');

    if (editIndex !== null) {
        loadEditState(parseInt(editIndex));
    } else {
        checkUrlForBoxSelection();
    }
}

function loadEditState(index) {
    const item = cart[index];
    if (!item || !item.rawBuilderData) return;

    const data = item.rawBuilderData;

    // 1. Load Box
    selectBox(data.boxId, data.boxPrice, data.boxTheme);

    // 2. Load Addons
    builderState.addons = []; // Clear current state
    document.querySelectorAll('.addon-card').forEach(card => card.classList.remove('selected'));
    
    // We match by text content since we don't have IDs on the addon cards in HTML
    data.selectedAddons.forEach(savedAddon => {
        const addonCards = document.querySelectorAll('.addon-card');
        addonCards.forEach(card => {
            if(card.querySelector('h5').innerText === savedAddon.name) {
                toggleAddon(card, savedAddon.name, savedAddon.price);
            }
        });
    });

    // 3. Load Letter
    const nameInput = document.getElementById('recipient-name');
    const bodyInput = document.getElementById('letter-content');

    if(nameInput) {
        nameInput.value = data.letterTo;
        document.getElementById('preview-name').innerText = data.letterTo || "My Dearest...";
    }
    if(bodyInput) {
        bodyInput.value = data.letterMsg;
        document.getElementById('preview-body').innerText = data.letterMsg || "Your words will appear here...";
    }

    // 4. Update Button State
    const btn = document.querySelector('.add-bundle-btn');
    if(btn) {
        btn.innerText = "Save Changes ➝";
        btn.style.backgroundColor = "#bf360c";
        // Tag button so we know to update instead of add
        btn.setAttribute('data-mode', 'edit');
        btn.setAttribute('data-index', index);
    }

    showToast(`Editing "${item.name}"`);
}

export function selectBox(id, price, theme) {
    builderState.selectedBox = { id, name: `Curated Box "${theme}"`, price, theme };
    
    // UI Updates
    document.querySelectorAll('.selection-card').forEach(card => card.classList.remove('selected'));
    const card = document.querySelector(`.theme-${theme.toLowerCase()}`);
    if(card) card.classList.add('selected');
    
    document.querySelectorAll('.build-step').forEach(step => step.classList.add('active'));
    document.getElementById('selected-box-name').innerText = builderState.selectedBox.name;
    
    const preview = document.getElementById('letter-preview');
    preview.classList.remove('style-Love', 'style-Cute', 'style-Flowers');
    preview.classList.add(`style-${theme}`);
    
    document.getElementById('step-2').scrollIntoView({ behavior: 'smooth', block: 'center' });
    calculateBuilderTotal();
}

export function toggleAddon(element, name, price) {
    if(!builderState.selectedBox) {
        alert("Please choose a vessel (Box) first!");
        document.getElementById('step-1').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Determine if we are adding or removing based on state, not just class toggle
    // This is safer for programmatic loading
    const existsIndex = builderState.addons.findIndex(item => item.name === name);

    if (existsIndex > -1) {
        // Remove
        builderState.addons.splice(existsIndex, 1);
        element.classList.remove('selected');
    } else {
        // Add
        builderState.addons.push({ name, price });
        element.classList.add('selected');
    }
    
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
    
    let addonString = 'None';
    if(builderState.addons.length > 0) {
        addonString = builderState.addons.map(a => a.name).join(', ');
    }

    const bundleItem = {
        id: 'bundle-' + Date.now(),
        name: `BUNDLE: ${builderState.selectedBox.name}`,
        price: parseFloat(document.getElementById('builder-total').innerText),
        desc: `
            <b>To:</b> ${recipient || 'Blank'}<br>
            <b>Add-ons:</b> ${addonString}
        `,
        fullMessage: message,
        // Save Raw Data for Edit Mode
        rawBuilderData: {
            boxId: builderState.selectedBox.id,
            boxPrice: builderState.selectedBox.price,
            boxTheme: builderState.selectedBox.theme,
            selectedAddons: [...builderState.addons],
            letterTo: recipient,
            letterMsg: message
        }
    };
    
    const btn = document.querySelector('.add-bundle-btn');
    const isEdit = btn && btn.getAttribute('data-mode') === 'edit';
    
    if (isEdit) {
        const index = parseInt(btn.getAttribute('data-index'));
        updateCartItem(index, bundleItem);
        // Reset URL
        window.history.replaceState({}, document.title, "customize.html");
        // Reset UI
        btn.innerText = "Add to Box ➝";
        btn.removeAttribute('data-mode');
    } else {
        addToCart(null, bundleItem);
    }
}

export function checkUrlForBoxSelection() {
    const params = new URLSearchParams(window.location.search);
    const boxId = params.get('box');

    if (boxId && BOX_DATA[boxId]) {
        const box = BOX_DATA[boxId];
        selectBox(parseInt(boxId), box.price, box.theme);
        window.history.replaceState({}, document.title, "customize.html");
    }
}