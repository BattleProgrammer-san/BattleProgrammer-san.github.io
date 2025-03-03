// Background parallax variables
let mouseX = 0.5; // Start in the middle
let mouseY = 0.5; // Start in the middle
let backgroundX = 0;
let backgroundY = 0;
let backgroundElement;

let currentBoard = [];
let currentLines = [];
let hasWon = false;

// Initialize the board on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the parallax background
    initParallaxBackground();
    
    // Set up menu toggle functionality
    const menuToggle = document.getElementById('menuToggle');
    menuToggle.addEventListener('click', function() {
        toggleMenu();
    });
    
    // Set up shuffle button functionality
    const shuffleButton = document.getElementById('shuffleButton');
    shuffleButton.addEventListener('click', function() {
        createBoard();
    });
    
    // Set up beforeunload event
    window.addEventListener('beforeunload', function(e) {
        if (hasCheckedCells()) {
            // Standard way of showing a confirmation dialog when leaving the page
            const confirmationMessage = 'You have checked items on your bingo board. Are you sure you want to leave?';
            e.returnValue = confirmationMessage; // For Chrome
            return confirmationMessage; // For Firefox and other browsers
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        resizeBoard();
        
        // Also update background position on resize
        if (backgroundElement) {
            updateBackgroundPosition();
        }
    });
    
    // Auto-create board on page load
    createBoard();
    
    // Initial resize
    resizeBoard();
});

// Initialize parallax background
function initParallaxBackground() {
    // Create background element if it doesn't exist
    if (!document.querySelector('.parallax-background')) {
        backgroundElement = document.createElement('div');
        backgroundElement.className = 'parallax-background';
        
        // Explicitly set the background image
        backgroundElement.style.backgroundImage = "url('./assets/img/bonjBackground.jpg')";
        
        document.body.insertBefore(backgroundElement, document.body.firstChild);
    } else {
        backgroundElement = document.querySelector('.parallax-background');
    }
    
    // Set up mouse tracking
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        updateBackgroundPosition();
    });
    
    // For mobile devices, use device orientation if available
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(e) {
            // Only use this if we have gamma and beta values
            if (e.gamma !== null && e.beta !== null) {
                // Normalize the values (gamma for left/right, beta for front/back)
                // and limit the range by dividing by 45 (45 degrees tilt)
                mouseX = (e.gamma / 45) * 0.5 + 0.5; // Convert -45...45 to 0...1
                mouseY = (e.beta / 45) * 0.5 + 0.5;  // Convert -45...45 to 0...1
                
                // Clamp values between 0 and 1
                mouseX = Math.max(0, Math.min(1, mouseX));
                mouseY = Math.max(0, Math.min(1, mouseY));
                
                updateBackgroundPosition();
            }
        });
    }
    
    // Initial position update
    updateBackgroundPosition();
}

function updateBackgroundPosition() {
    requestAnimationFrame(() => {
        // Calculate inverse movement (negative values)
        // Multiply by a small value (5) to limit movement to 5%
        backgroundX = -mouseX * 5; 
        backgroundY = -mouseY * 5;
        
        // Apply transform with slight easing
        if (backgroundElement) {
            backgroundElement.style.transform = 
            `translate(${backgroundX}%, ${backgroundY}%)`;
        }
    });
}

function resizeBoard() {
    const board = document.getElementById('board');
    if (!board) return;
    
    // Get the available width and height
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculate the optimal size based on both dimensions
    // Use the smaller of the two dimensions to ensure the board fits on screen
    let size;
    
    if (windowWidth <= 768) {
        // Mobile view
        size = Math.min(windowWidth * 0.9, windowHeight * 0.7);
    } else {
        // Desktop view
        size = Math.min(windowWidth * 0.8, windowHeight * 0.8);
    }
    
    // Apply the size
    board.style.width = `${size}px`;
    board.style.height = `${size}px`;
}

function toggleMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const overlay = document.getElementById('controlsOverlay');
    
    menuToggle.classList.toggle('active');
    overlay.classList.toggle('active');
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    html.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
}

function toggleControls() {
    toggleMenu();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function checkWin() {
    for (let i = 0; i < 5; i++) {
        if (currentBoard.slice(i * 5, (i + 1) * 5).every(cell => cell.checked)) return true;
    }
    for (let i = 0; i < 5; i++) {
        if (currentBoard.filter((_, index) => index % 5 === i).every(cell => cell.checked)) return true;
    }
    if ([0, 6, 12, 18, 24].every(i => currentBoard[i].checked)) return true;
    if ([4, 8, 12, 16, 20].every(i => currentBoard[i].checked)) return true;
    
    return false;
}

function hasCheckedCells() {
    // Check if any cells besides FREE SPACE are checked
    if (!currentBoard || currentBoard.length === 0) return false;
    
    for (let i = 0; i < currentBoard.length; i++) {
        if (i !== 12 && currentBoard[i].checked) {
            return true;
        }
    }
    return false;
}

function createBoard() {
    // Check if there are already checked cells besides FREE SPACE
    if (hasCheckedCells()) {
        if (!confirm('This will reset your current progress. Are you sure you want to create a new board?')) {
            return; // User cancelled the operation
        }
    }
    
    const textarea = document.getElementById('cards');
    currentLines = textarea.value.split('\n').filter(line => line.trim());
    
    if (currentLines.length < 24) {
        // If not enough lines, just use what we have and repeat if necessary
        while (currentLines.length < 24) {
            currentLines = [...currentLines, ...currentLines];
        }
        currentLines = currentLines.slice(0, 24);
    }
    
    if (currentLines.length > 24) {
        currentLines = shuffleArray([...currentLines]).slice(0, 24);
    }
    
    const shuffledLines = shuffleArray([...currentLines]);
    currentBoard = [];
    
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    
    let lineIndex = 0;
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.onclick = () => toggleCell(i);
        
        if (i === 12) {
            cell.textContent = 'FREE SPACE';
            cell.classList.add('checked'); // Auto-check FREE SPACE
            currentBoard[i] = { content: 'FREE SPACE', checked: true };
        } else {
            cell.textContent = shuffledLines[lineIndex];
            currentBoard[i] = { content: shuffledLines[lineIndex], checked: false };
            lineIndex++;
        }
        
        // Make cells accessible
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-pressed', i === 12 ? 'true' : 'false');
        
        // Add keyboard support
        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCell(i);
            }
        });
        
        boardDiv.appendChild(cell);
    }
    hasWon = false;
    
    generateShareCode();
    
    // Make sure board is properly sized
    resizeBoard();
}

function toggleCell(index) {
    if (!currentBoard[index]) return;
    
    currentBoard[index].checked = !currentBoard[index].checked;
    const cells = document.getElementsByClassName('cell');
    cells[index].classList.toggle('checked');
    cells[index].setAttribute('aria-pressed', currentBoard[index].checked ? 'true' : 'false');
    
    if (checkWin()) {
        showWinMessage();
    }
    
    generateShareCode();
}

function generateShareCode() {
    if (!currentBoard.length) return;
    
    let code = '';
    for (let i = 0; i < currentBoard.length; i++) {
        code += `${i.toString().padStart(2, '0')}|${currentBoard[i].content}|${currentBoard[i].checked ? '1' : '0'};`;
    }
    
    document.getElementById('shareCode').value = btoa(code);
}

function loadSharedBoard() {
    try {
        const code = atob(document.getElementById('shareCode').value);
        const cells = code.split(';').filter(c => c);
        
        currentBoard = Array(25).fill().map(() => ({ content: '', checked: false }));
        
        for (const cell of cells) {
            const [index, content, checked] = cell.split('|');
            const cellIndex = parseInt(index);
            currentBoard[cellIndex] = {
                content: content,
                checked: checked === '1'
            };
        }
        
        const boardDiv = document.getElementById('board');
        boardDiv.innerHTML = '';
        
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (currentBoard[i].checked) cell.classList.add('checked');
            cell.onclick = () => toggleCell(i);
            cell.textContent = currentBoard[i].content;
            
            // Make cells accessible
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('aria-pressed', currentBoard[i].checked ? 'true' : 'false');
            
            // Add keyboard support
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCell(i);
                }
            });
            
            boardDiv.appendChild(cell);
        }
        
        if (checkWin()) {
            showWinMessage();
        }
        
        // Close the overlay after loading
        toggleMenu();
        
        // Make sure board is properly sized
        resizeBoard();
    } catch (error) {
        alert('Invalid share code');
    }
}

function showWinMessage() {
    if (!hasWon) launchFireworks();
    hasWon = true;	
}

function randomTime(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function launchFireworks() {
    for(let i = 0; i < 25; i++) {
        setTimeout(() => {
            createFirework();
        }, i * 50 * randomTime(1, 3));
    }
}

function createFirework() {
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = Math.random() * 100 + 'vw';
    firework.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
    document.body.appendChild(firework);
    
    setTimeout(() => {
        const particles = 30;
        for(let i = 0; i < particles; i++) {
            createParticle(firework.offsetLeft, firework.offsetTop);
        }
        firework.remove();
    }, 500);
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--angle', Math.random() * 360 + 'deg');
    particle.style.setProperty('--speed', Math.random() * 2 + 1 + 's');
    particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 2000);
}