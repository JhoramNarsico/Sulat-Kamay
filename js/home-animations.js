// Configuration
const textContent = "My dearest, \n\nI just wanted to remind you that memories with the right people will always remain priceless. \n\nLet's keep this moment forever.";

// ADJUSTMENTS
const fontSize = 34;       
const strokeWidth = 2;     
const strokeColor = "#4e342e"; 
const speedPerChar = 70;  

export function runIntroSequence() {
    const introOverlay = document.getElementById('intro-overlay');
    
    if (introOverlay) {
        // 1. Open the envelope
        setTimeout(() => { document.querySelector('.envelope-container').classList.add('open'); }, 800);
        
        // 2. Hide overlay and start writing
        setTimeout(() => {
            introOverlay.style.opacity = '0';
            setTimeout(() => { 
                introOverlay.style.display = 'none'; 
                initHandwriting();
            }, 800);
        }, 3000);
    }
}

function initHandwriting() {
    const container = document.getElementById('typing-text');
    if (!container) return;
    container.innerHTML = '';

    const lines = textContent.split('\n');
    
    const varaText = lines.map(line => {
        const cleanLine = line.trim() === "" ? " " : line;
        const duration = cleanLine.length > 1 ? cleanLine.length * speedPerChar : 100;

        return { 
            text: cleanLine, 
            delay: 600, 
            duration: duration, 
            x: 5, 
            fromCurrentPosition: { y: false } 
        };
    });

    new Vara(
        "#typing-text", 
        "https://raw.githubusercontent.com/akzhy/Vara/master/fonts/Satisfy/SatisfySL.json", 
        varaText, 
        {
            fontSize: fontSize, 
            strokeWidth: strokeWidth,
            color: strokeColor,
            textAlign: "left",
            autoAnimation: true
        }
    );

    const totalChars = textContent.length;
    const estimatedTime = (totalChars * speedPerChar) + (lines.length * 600) + 1000;

    setTimeout(() => {
        finishAnimationSequence();
    }, estimatedTime);
}

function finishAnimationSequence() {
    const staticSection = document.querySelector('.static-hero-text');
    const stampContainer = document.getElementById('final-stamp-container');
    
    if(stampContainer && stampContainer.innerHTML === '') {
        const stampImg = document.createElement('img');
        stampImg.src = 'assets/sk-seal.png';
        stampImg.alt = 'Sulat Kamay Seal';
        stampImg.className = 'sk-stamp-img stamp-animation';
        stampContainer.appendChild(stampImg);
    }

    if(staticSection) {
        staticSection.classList.add('visible');
    }
    
    const cursor = document.querySelector('.cursor');
    if(cursor) cursor.style.display = 'none';
}

// SCROLL ANIMATION OBSERVER
export function initScrollAnimations() {
    // 1. Setup the observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add a slight delay between cards for a "staggered" effect
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 200); 

                // Stop watching once it's visible
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2 // Trigger when 20% of the card is visible
    });

    // 2. Target the cards
    const cards = document.querySelectorAll('.highlight-card');
    cards.forEach(card => observer.observe(card));
}