// DOM Elements
const proposalCard = document.getElementById('proposal-card');
const schedulerCard = document.getElementById('scheduler-card');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const dateInput = document.getElementById('date-input');
const dateForm = document.getElementById('date-form');
const particlesContainer = document.getElementById('particles-container');
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

// State Variables
let yesScale = 1.0;
const maxYesScale = 2.5;
let noClickCount = 0;

// Escape messages for the No button (Emoji-free)
const messages = [
    "Emin misin?",
    "Bir daha düşün?",
    "Pişman olursun...",
    "Yemekler benden ama?",
    "Sadece bir şans ver?",
    "Lütfen?",
    "Söz, çok eğleneceğiz!",
    "Beni üzme lütfen...",
    "Yine mi Hayır?",
    "Tıklayamayacaksın ki!",
    "Bak son kararın mı?",
    "Kalbimi kırıyorsun...",
    "Belki bir kahve?",
    "Israr etsem?",
    "Bir şans daha?",
    "Hemen hayır deme!",
    "Gözlerini kapatıp bir daha seç?",
    "Lütfen evet de...",
    "Çok tatlıyız ama biz!",
    "Bence de evet!"
];

// Set min date of date picker to today
const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1;
let dd = today.getDate();
if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;
dateInput.min = `${yyyy}-${mm}-${dd}`;
dateInput.value = `${yyyy}-${mm}-${dd}`;

// Floating Background Particles System
const particleTypes = [
    // Heart path
    '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
    // Sparkle path
    '<path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/>'
];

function spawnParticle() {
    if (particlesContainer.children.length > 12) {
        particlesContainer.removeChild(particlesContainer.children[0]);
    }
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.classList.add('floating-particle');
    
    const randomType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    svg.innerHTML = randomType;
    
    const size = Math.floor(Math.random() * 10) + 10; // 10px to 20px (smaller, less intrusive)
    const left = Math.random() * 100; // 0% to 100%
    const duration = Math.random() * 8 + 14; // 14s to 22s (slower, more elegant)
    const delay = Math.random() * 2;
    
    svg.style.width = `${size}px`;
    svg.style.height = `${size}px`;
    svg.style.left = `${left}%`;
    svg.style.animationDuration = `${duration}s`;
    svg.style.animationDelay = `${delay}s`;
    
    const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#ffd700'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    svg.style.fill = randomColor;
    svg.style.filter = `drop-shadow(0 0 6px ${randomColor})`;
    
    particlesContainer.appendChild(svg);
}

// Initial spawn particles
for (let i = 0; i < 6; i++) {
    spawnParticle();
}
setInterval(spawnParticle, 1800);


// Runaway "No" Button Functionality
function moveNoButton(e) {
    // Switch to absolute positioning after first hover/touch
    if (!noBtn.classList.contains('absolute-mode')) {
        noBtn.classList.add('absolute-mode');
        document.body.appendChild(noBtn);
    }

    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    
    // Viewport boundaries
    const maxX = window.innerWidth - btnWidth - 40;
    const maxY = window.innerHeight - btnHeight - 40;

    // Get current cursor/touch coordinates to avoid spawning underneath it
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;

    if (e) {
        if (e.clientX) {
            cursorX = e.clientX;
            cursorY = e.clientY;
        } else if (e.touches && e.touches[0]) {
            cursorX = e.touches[0].clientX;
            cursorY = e.touches[0].clientY;
        }
    }

    // Try finding coordinates that are at least 150px away from the cursor
    let targetX = Math.max(20, Math.floor(Math.random() * maxX));
    let targetY = Math.max(20, Math.floor(Math.random() * maxY));
    
    for (let i = 0; i < 30; i++) {
        const potentialX = Math.max(20, Math.floor(Math.random() * maxX));
        const potentialY = Math.max(20, Math.floor(Math.random() * maxY));
        const distance = Math.hypot(potentialX + btnWidth / 2 - cursorX, potentialY + btnHeight / 2 - cursorY);
        
        if (distance > 160) {
            targetX = potentialX;
            targetY = potentialY;
            break;
        }
    }

    // Relocate button
    noBtn.style.left = `${targetX}px`;
    noBtn.style.top = `${targetY}px`;

    // Make Yes button grow
    if (yesScale < maxYesScale) {
        yesScale += 0.15;
        yesBtn.style.transform = `scale(${yesScale})`;
    }

    // Change No button text dynamically
    noBtn.querySelector('.btn-text').innerText = messages[noClickCount % messages.length];
    noClickCount++;
}

// Bind Events to No Button
noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent click delay and double tap zoom on mobile
    moveNoButton(e);
});
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton(e);
});


// Yes Button Click Action - Switch Card & Start Confetti
yesBtn.addEventListener('click', () => {
    // Hide proposal
    proposalCard.classList.add('hidden');
    
    // Remove the runaway No button from the DOM
    noBtn.remove();
    
    // Wait for the transition of hiding, then show scheduler
    setTimeout(() => {
        proposalCard.style.display = 'none';
        schedulerCard.classList.remove('hidden');
        startConfetti();
    }, 400);
});


// Confetti Canvas Particle System
let animationFrameId;
let confettiActive = false;
const confettiParticles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20 - Math.random() * 100;
        this.size = Math.random() * 12 + 6;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 + 3;
        this.gravity = 0.12;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.04 - 0.02;
        
        const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#ffd700', '#ffcbd5'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // 0 = heart, 1 = star, 2 = dot/sparkle
        this.shape = Math.floor(Math.random() * 3);
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;
        
        if (this.y > canvas.height + 20) {
            this.y = -20;
            this.x = Math.random() * canvas.width;
            this.speedY = Math.random() * 4 + 3;
            this.speedX = Math.random() * 4 - 2;
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.shape === 0) {
            // Heart shape drawing
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.bezierCurveTo(this.size / 2, -this.size, this.size, -this.size / 2, this.size, 0);
            ctx.bezierCurveTo(this.size, this.size / 2, this.size / 2, this.size, 0, this.size * 0.95);
            ctx.bezierCurveTo(-this.size / 2, this.size, -this.size, this.size / 2, -this.size, 0);
            ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size / 2, -this.size, 0, -this.size / 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else if (this.shape === 1) {
            // Four-point star
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size * 0.3, -this.size * 0.3);
            ctx.lineTo(this.size, 0);
            ctx.lineTo(this.size * 0.3, this.size * 0.3);
            ctx.lineTo(0, this.size);
            ctx.lineTo(-this.size * 0.3, this.size * 0.3);
            ctx.lineTo(-this.size, 0);
            ctx.lineTo(-this.size * 0.3, -this.size * 0.3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        } else {
            // Circle confetti
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        ctx.restore();
    }
}

function startConfetti() {
    confettiActive = true;
    confettiParticles.length = 0;
    
    // Spawn burst
    for (let i = 0; i < 80; i++) {
        const p = new ConfettiParticle();
        p.y = Math.random() * canvas.height * 0.7; // Distribute on screen
        confettiParticles.push(p);
    }
    
    animateConfetti();
}

function animateConfetti() {
    if (!confettiActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiParticles.forEach(p => {
        p.update();
        p.draw();
    });
    
    animationFrameId = requestAnimationFrame(animateConfetti);
}


// Form Submission & WhatsApp Redirect
dateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const chosenDate = dateInput.value;
    const selectedActivityElement = document.querySelector('input[name="activity"]:checked');
    const chosenActivity = selectedActivityElement ? selectedActivityElement.value : "Buluşma";
    
    // Format date nicely (DD.MM.YYYY)
    let formattedDate = chosenDate;
    if (chosenDate) {
        const dateParts = chosenDate.split('-');
        if (dateParts.length === 3) {
            formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
        }
    }

    // Build the template message without emojis
    const message = `Harika haber! Date teklifini kabul ettim. Buluşma planımız şu şekilde: \n\nTarih: ${formattedDate} \nPlan: ${chosenActivity} \n\nSözleştiğimiz gibi orada olacağım!`;
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp URL (without phone number to open contact chooser)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
});
