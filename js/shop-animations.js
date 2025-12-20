export function initShopScrollSpy() {
    const body = document.body;
    
    // CHANGED: Added '.shop-intro' to the selector list
    const sections = document.querySelectorAll('.shop-intro, .showroom, .accessories-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 1. Remove all existing theme classes
                body.classList.remove('theme-intro', 'theme-love', 'theme-cute', 'theme-flower', 'theme-accessories');

                // 2. Add 'active' class to trigger internal animations
                entry.target.classList.add('active');

                // 3. Add the specific theme class
                if (entry.target.classList.contains('shop-intro')) {
                    body.classList.add('theme-intro'); // Revert to dirty white
                } else if (entry.target.classList.contains('showroom-love')) {
                    body.classList.add('theme-love');
                } else if (entry.target.classList.contains('showroom-cute')) {
                    body.classList.add('theme-cute');
                } else if (entry.target.classList.contains('showroom-flower')) {
                    body.classList.add('theme-flower');
                } else if (entry.target.classList.contains('accessories-section')) {
                    body.classList.add('theme-accessories');
                }
            }
        });
    }, {
        threshold: 0.2, // Adjusted threshold to catch the top section earlier
        rootMargin: "-20% 0px -20% 0px"
    });

    sections.forEach(section => observer.observe(section));
}