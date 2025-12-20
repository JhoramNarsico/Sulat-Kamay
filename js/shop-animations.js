export function initShopScrollSpy() {
    const body = document.body;
    const sections = document.querySelectorAll('.showroom');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                body.classList.remove('theme-love', 'theme-cute', 'theme-flower');

                if (entry.target.classList.contains('showroom-love')) {
                    body.classList.add('theme-love');
                } else if (entry.target.classList.contains('showroom-cute')) {
                    body.classList.add('theme-cute');
                } else if (entry.target.classList.contains('showroom-flower')) {
                    body.classList.add('theme-flower');
                }
            }
        });
    }, {
        // OPTIMIZATION FOR SCROLL SNAP:
        // Use 0.5 threshold. Since sections are 100vh, 
        // 0.5 means "Trigger when this section takes up half the screen"
        threshold: 0.5 
    });

    sections.forEach(section => observer.observe(section));
}