// Configuration
const textContent = "My dearest, \n\nI just wanted to remind you that memories with the right people will always remain priceless. \nLet's keep this moment \nforever.";

const fontSize = 34;       
const strokeWidth = 2;     
const strokeColor = "#4e342e"; 
const speedPerChar = 70;  
const lineDelay = 800;    

export function runIntroSequence() {
    const introOverlay = document.getElementById('intro-overlay');
    
    if (introOverlay) {
        setTimeout(() => { document.querySelector('.envelope-container').classList.add('open'); }, 800);
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
    
    // --- OPTIMIZED: Calculate total animation time for final sequence ---
    let totalDuration = 0;
    lines.forEach(line => {
        const cleanLine = line.trim() === "" ? " " : line;
        const duration = cleanLine.length > 1 ? cleanLine.length * speedPerChar : 100;
        totalDuration += (lineDelay + duration);
    });

    // Schedule final sequence after writing is complete
    setTimeout(finishAnimationSequence, totalDuration + 500); // 500ms buffer

    // --- VARA CONFIGURATION (No changes needed here) ---
    const varaText = lines.map(line => {
        const cleanLine = line.trim() === "" ? " " : line;
        const duration = cleanLine.length > 1 ? cleanLine.length * speedPerChar : 100;

        return { 
            text: cleanLine, 
            delay: lineDelay, 
            duration: duration, 
            x: 0, 
            y: 5, 
            fromCurrentPosition: { y: true } 
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
}

export function initScrollAnimations() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 200); 
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    const cards = document.querySelectorAll('.highlight-card');
    cards.forEach(card => observer.observe(card));
}