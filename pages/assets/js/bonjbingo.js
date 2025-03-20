// Background parallax variables
let mouseX = 0.5; // Start in the middle
let mouseY = 0.5; // Start in the middle
let backgroundX = 0;
let backgroundY = 0;
let backgroundElement;
let enableParallax = true; // Flag to enable/disable parallax movement
let enableFireworks = true; // Flag to enable/disable fireworks

let currentBoard = [];
let currentLines = [];
let hasWon = false;

// Initialize the board on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load random background
    loadRandomBackground();
    
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
    
    // Set up reset button functionality
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            resetBoard();
        });
    }
    
    // Set up Bonj Order button functionality
    const bonjOrderButton = document.getElementById('bonjOrderButton');
    if (bonjOrderButton) {
        bonjOrderButton.addEventListener('click', function() {
            loadBonjOrder();
        });
    }
    
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

    const infoButton = document.getElementById('infoButton');
    infoButton.addEventListener('click', function() {
        toggleDisclaimer();
    });
    
    // Add keyboard support
    infoButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDisclaimer();
        }
    });

    const screenshotButton = document.getElementById('screenshotButton');
    if (screenshotButton) {
        screenshotButton.addEventListener('click', takeScreenshot);
    }
    
    // Initialize download button
    const downloadButton = document.getElementById('downloadButton');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadScreenshot);
    }
    
    // Initialize twitter button
    const twitterButton = document.getElementById('twitterButton');
    if (twitterButton) {
        twitterButton.addEventListener('click', shareOnTwitter);
    }
    
    // Auto-create board on page load
    createBoard();
    
    // Initial resize
    resizeBoard();
});

// Load a random background from the JSON file
async function loadRandomBackground() {
    try {
        // Fetch the JSON file containing background list
        const response = await fetch('./assets/js/backgrounds.json');
        const backgrounds = await response.json();
        
        // Choose a random background from the list
        const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        
        // Create background element if it doesn't exist
        if (!document.querySelector('.parallax-background')) {
            backgroundElement = document.createElement('div');
            backgroundElement.className = 'parallax-background';
            
            // Set the background image to the randomly selected one
            backgroundElement.style.backgroundImage = `url('./assets/img/${randomBackground}')`;
            
            document.body.insertBefore(backgroundElement, document.body.firstChild);
        } else {
            backgroundElement = document.querySelector('.parallax-background');
            // Update the background image
            backgroundElement.style.backgroundImage = `url('./assets/img/${randomBackground}')`;
        }
    } catch (error) {
        console.error('Error loading backgrounds:', error);
        // Fallback to default background
        if (!document.querySelector('.parallax-background')) {
            backgroundElement = document.createElement('div');
            backgroundElement.className = 'parallax-background';
            backgroundElement.style.backgroundImage = "url('./assets/img/bonjBackground.jpg')";
            document.body.insertBefore(backgroundElement, document.body.firstChild);
        }
    }
}

function toggleDisclaimer() {
    const disclaimerOverlay = document.getElementById('disclaimerOverlay');
    disclaimerOverlay.classList.toggle('active');
    
    // Focus management for accessibility
    if (disclaimerOverlay.classList.contains('active')) {
        const closeButton = disclaimerOverlay.querySelector('.close-overlay');
        if (closeButton) {
            closeButton.focus();
        }
    } else {
        const infoButton = document.getElementById('infoButton');
        if (infoButton) {
            infoButton.focus();
        }
    }
}

// Initialize parallax background
function initParallaxBackground() {
    // Ensure background element exists
    if (!backgroundElement) {
        backgroundElement = document.querySelector('.parallax-background');
        if (!backgroundElement) {
            // Create a default one if it doesn't exist
            backgroundElement = document.createElement('div');
            backgroundElement.className = 'parallax-background';
            backgroundElement.style.backgroundImage = "url('./assets/img/bonjBackground.jpg')";
            document.body.insertBefore(backgroundElement, document.body.firstChild);
        }
    }
    
    // Set up mouse tracking if parallax is enabled
    if (enableParallax) {
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
    }
    
    // Initial position update
    updateBackgroundPosition();
}

function updateBackgroundPosition() {
    if (!enableParallax) {
        // Reset position when parallax is disabled
        if (backgroundElement) {
            backgroundElement.style.transform = 'translate(0%, 0%)';
        }
        return;
    }
    
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

// Toggle parallax effect
function toggleParallax() {
    enableParallax = !enableParallax;
    // Update the checkbox state
    const parallaxCheckbox = document.getElementById('parallaxToggle');
    if (parallaxCheckbox) {
        parallaxCheckbox.checked = enableParallax;
    }
    
    // Update background position immediately
    updateBackgroundPosition();
}

// Toggle fireworks effect
function toggleFireworks() {
    enableFireworks = !enableFireworks;
    // Update the checkbox state
    const fireworksCheckbox = document.getElementById('fireworksToggle');
    if (fireworksCheckbox) {
        fireworksCheckbox.checked = enableFireworks;
    }
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

// Function to reset the board without reshuffling
function resetBoard() {
    if (hasCheckedCells()) {
        if (!confirm('This will reset your current progress but keep the same board. Are you sure?')) {
            return; // User cancelled the operation
        }
    }
    
    // Keep the same content but reset the checked state
    const cells = document.getElementsByClassName('cell');
    
    for (let i = 0; i < currentBoard.length; i++) {
        if (i !== 12) { // Don't touch FREE SPACE
            currentBoard[i].checked = false;
            cells[i].classList.remove('checked');
            cells[i].setAttribute('aria-pressed', 'false');
        }
    }
    
    hasWon = false;
    generateShareCode();
}

// Function to load Bonj Order
async function loadBonjOrder() {
    try {
        // Check if there are already checked cells besides FREE SPACE
        if (hasCheckedCells()) {
            if (!confirm('This will reset your current progress and apply the Bonj Order. Are you sure?')) {
                return; // User cancelled the operation
            }
        }
        
        // Fetch the Bonj Order JSON file
        const response = await fetch('./assets/js/bonjorder.json');
        const bonjOrderData = await response.json();
        
        // Use the Bonj Order to populate the board
        const boardDiv = document.getElementById('board');
        boardDiv.innerHTML = '';
        
        currentBoard = [];
        let bonjIndex = 0;
        
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.onclick = () => toggleCell(i);
            
            if (i === 12) {
                cell.textContent = 'FREE SPACE';
                cell.classList.add('checked'); // Auto-check FREE SPACE
                currentBoard[i] = { content: 'FREE SPACE', checked: true };
            } else {
                // Use the bonjOrderData in sequence, making sure we don't go out of bounds
                if (bonjIndex < bonjOrderData.length) {
                    cell.textContent = bonjOrderData[bonjIndex];
                    currentBoard[i] = { content: bonjOrderData[bonjIndex], checked: false };
                    bonjIndex++;
                } else {
                    // Fallback if we don't have enough items in the Bonj Order
                    cell.textContent = `Item ${i}`;
                    currentBoard[i] = { content: `Item ${i}`, checked: false };
                }
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
        
        // Update the textarea with the Bonj Order items
        document.getElementById('cards').value = bonjOrderData.join('\n');
        
        hasWon = false;
        generateShareCode();
        
        // Make sure board is properly sized
        resizeBoard();
    } catch (error) {
        console.error('Error loading Bonj Order:', error);
        alert('Failed to load Bonj Order. Check the console for details.');
    }
}

function toggleCell(index) {
    if (!currentBoard[index]) return;
    
    currentBoard[index].checked = !currentBoard[index].checked;
    const cells = document.getElementsByClassName('cell');
    cells[index].classList.toggle('checked');
    cells[index].setAttribute('aria-pressed', currentBoard[index].checked ? 'true' : 'false');
    
    if (checkWin() && !hasWon) {
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
    // Launch fireworks if enabled
    if (!hasWon && enableFireworks) launchFireworks();
    
    // Show the bingo image
    showBingoImage();
    
    // Set hasWon to true
    hasWon = true;	
}

function showBingoImage() {
    // Check if bingo image element already exists
    let bingoImage = document.getElementById('bingoImage');
    
    // If it doesn't exist, create it
    if (!bingoImage) {
        bingoImage = document.createElement('img');
        bingoImage.id = 'bingoImage';
        bingoImage.className = 'bingo-image';
        bingoImage.src = './assets/img/bingo.png';
        bingoImage.alt = 'BINGO!';
        document.body.appendChild(bingoImage);
    }
    
    // Trigger the animation sequence by adding the 'show' class
    // Short timeout to ensure the DOM is ready
    setTimeout(() => {
        bingoImage.classList.add('show');
        
        // Remove the image from DOM after animations complete (5 seconds)
        setTimeout(() => {
            bingoImage.classList.remove('show');
            setTimeout(() => {
                // Optional: remove from DOM after fade out completes
                if (bingoImage.parentNode) {
                    bingoImage.parentNode.removeChild(bingoImage);
                }
            }, 500);
        }, 5000);
    }, 10);
}

function randomTime(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function launchFireworks() {
    // Only launch fireworks if enabled
    if (!enableFireworks) return;
    
    for(let i = 0; i < 15; i++) {
        setTimeout(() => {
            createFirework();
        }, i * 100 * randomTime(1, 3));
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
function takeScreenshot() {
    const board = document.getElementById('board');
    
    if (!board) {
        alert('Could not find the bingo board!');
        return;
    }
    
    function captureBoard() {
        // Create a container for the screenshot with proper styling
        const screenshotContainer = document.createElement('div');
        screenshotContainer.style.position = 'fixed';
        screenshotContainer.style.top = '0';
        screenshotContainer.style.left = '0';
        screenshotContainer.style.width = '1100px';
        screenshotContainer.style.height = '1400px';
        screenshotContainer.style.zIndex = '-9999';
        screenshotContainer.style.display = 'flex';
        screenshotContainer.style.flexDirection = 'column';
        screenshotContainer.style.justifyContent = 'center';
        screenshotContainer.style.alignItems = 'center';
        screenshotContainer.style.padding = '20px';
        
        // Set background image with blur
        screenshotContainer.style.backgroundImage = 'url("./assets/img/bonjBackgroundBlur.jpg")';
        screenshotContainer.style.backgroundSize = 'cover';
        screenshotContainer.style.backgroundPosition = 'center';
        
        // Clone the board with fixed width
        const boardClone = board.cloneNode(true);
        const boardWidth = board.offsetWidth;

        const allElements = boardClone.querySelectorAll('*');
        allElements.forEach(el => {
          el.style.animation = 'none';
          el.style.transition = 'none';
          el.style.opacity = '1';
        });
        
        boardClone.style.animation = 'none';
        boardClone.style.transition = 'none';
        
        // Create a wrapper with margin - fixed width based on board
        const boardWrapper = document.createElement('div');
        boardWrapper.style.padding = '30px';
        boardWrapper.style.width = boardWidth + 60 + 'px'; // Board width + 30px padding on each side
        boardWrapper.style.backgroundColor = 'rgba(26, 23, 18, 0.7)';
        boardWrapper.style.borderRadius = '8px';
        boardWrapper.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        boardWrapper.style.margin = '0 auto'; // Center the wrapper
        boardWrapper.style.marginTop = '100px';
        boardWrapper.style.position = 'relative'; // For logo positioning
        boardWrapper.style.opacity = '1'; // Ensure full opacity
        boardWrapper.style.width = '900px';
        boardWrapper.style.height = '900px';
        
        // Style the cloned board - remove radius, gap, and opacity
        boardClone.style.gap = '0';
        boardClone.style.width = '100%';
        boardClone.style.height = '100%';
        boardClone.style.opacity = '1'; // Ensure full opacity
        boardClone.style.marginTop = '0';
        
        // Style all cells in the cloned board with light theme colors
        const cells = boardClone.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.style.borderRadius = '0';
            cell.style.backgroundColor = '#1A1712';
            cell.style.color = cell.classList.contains('checked') ? 
                '#1A1712' : // Light theme checked text
                '#F2ECE0'; // Light theme text
            cell.style.border = '1px solid #F2ECE0';
            cell.style.opacity = '1'; // Ensure full opacity
            cell.style.fontSize = "24px";
            
            // Explicitly add cross image to checked cells for screenshots
            if (cell.classList.contains('checked')) {
                // Create a cross overlay element
                const crossOverlay = document.createElement('div');
                crossOverlay.style.position = 'absolute';
                crossOverlay.style.top = '0';
                crossOverlay.style.left = '0';
                crossOverlay.style.width = '100%';
                crossOverlay.style.height = '100%';
                crossOverlay.style.backgroundImage = 'url("./assets/img/crossDark.png")';
                crossOverlay.style.backgroundSize = 'cover';
                crossOverlay.style.backgroundPosition = 'center';
                crossOverlay.style.pointerEvents = 'none';
                crossOverlay.style.zIndex = '1';
                
                // Create a wrapper for proper positioning
                if (window.getComputedStyle(cell).position === 'static') {
                    cell.style.position = 'relative';
                }
                
                // Append the cross overlay
                cell.appendChild(crossOverlay);
                
                // For screenshots, use a different approach to invert text color
                // Create a special span and move the cell text into it with inverted color
                const originalText = cell.textContent;
                cell.textContent = '';
                const textSpan = document.createElement('span');
                textSpan.textContent = originalText;
                textSpan.style.position = 'relative';
                textSpan.style.zIndex = '2';
                textSpan.style.mixBlendMode = 'difference';
                textSpan.style.color = '#FFFFFF'; // White text for difference blend
                cell.appendChild(textSpan);
            }
        });
        
        // Add logo above and overlapping the board
        const logo = document.createElement('img');
        logo.src = './assets/img/bonjLogoBig.png';
        logo.style.width = '40%'; // Half size
        logo.style.height = 'auto';
        logo.style.position = 'absolute';
        logo.style.top = '-110px';
        logo.style.left = '20px';
        logo.style.zIndex = '1';
        
        // Append elements to the container
        boardWrapper.appendChild(boardClone);
        boardWrapper.appendChild(logo); // Logo is in the wrapper but absolutely positioned
        screenshotContainer.appendChild(boardWrapper);
        
        // Add to document, capture, then remove
        document.body.appendChild(screenshotContainer);
        
        // Remove the blur for capturing
        const containerForCapture = screenshotContainer.cloneNode(true);
        document.body.appendChild(containerForCapture);
        
        // Use html2canvas to capture the screenshot
        html2canvas(containerForCapture, {
            backgroundColor: null,
            scale: 2, // Higher quality
            logging: false,
            allowTaint: true,
            useCORS: true
        }).then(canvas => {
            // Remove the temporary containers
            document.body.removeChild(screenshotContainer);
            document.body.removeChild(containerForCapture);
            
            // Get image data and display it
            const imageData = canvas.toDataURL('image/png');
            const screenshotImage = document.getElementById('screenshotImage');
            screenshotImage.src = imageData;
            
            // Store the image data globally for download/sharing
            window.screenshotImageData = imageData;
            
            // Open the screenshot overlay
            openScreenshotOverlay();
        }).catch(err => {
            console.error('Error capturing screenshot:', err);
            document.body.removeChild(screenshotContainer);
            document.body.removeChild(containerForCapture);
            alert('Failed to capture screenshot. Please try again.');
        });
    }
    
    // Use locally hosted html2canvas
    // Assuming html2canvas is already loaded
    if (typeof html2canvas === 'undefined') {
        // Load it if not already available
        const script = document.createElement('script');
        script.src = './assets/js/html2canvas.min.js';
        script.onload = captureBoard;
        script.onerror = () => alert('Failed to load html2canvas. Please check if the file exists in your js folder.');
        document.head.appendChild(script);
    } else {
        captureBoard();
    }
}

// Function to open screenshot overlay
function openScreenshotOverlay() {
    const overlay = document.getElementById('screenshotOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

// Function to close screenshot overlay
function closeScreenshotOverlay() {
    const overlay = document.getElementById('screenshotOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Function to download the screenshot
function downloadScreenshot() {
    if (!window.screenshotImageData) {
        alert('No screenshot available. Please take a screenshot first.');
        return;
    }
    
    // Create timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    
    // Create a download link
    const link = document.createElement('a');
    link.href = window.screenshotImageData;
    link.download = `hag-hours-bingo_${timestamp}.png`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareOnTwitter() {
    if (!window.screenshotImageData) {
        alert('No screenshot available. Please take a screenshot first.');
        return;
    }
    
    // Try Web Share API first (for mobile devices)
    if (navigator.share) {
        try {
            // Create a blob from the data URL
            const blob = dataURItoBlob(window.screenshotImageData);
            const file = new File([blob], 'hag-hours-bingo.png', { type: 'image/png' });
            
            // First try with files
            const shareDataWithFile = {
                title: 'Hag Hours Bingo',
                text: 'Check out my Hag Hours Bingo board! #HagHours',
                files: [file]
            };
            
            // Check if sharing files is supported
            if (navigator.canShare && navigator.canShare(shareDataWithFile)) {
                navigator.share(shareDataWithFile)
                    .then(() => console.log('Shared with file successfully'))
                    .catch(err => {
                        console.warn('Error sharing with file:', err);
                        // Try without files as fallback
                        fallbackShareWithoutFile();
                    });
                return;
            } else {
                // If files aren't supported, try without file
                fallbackShareWithoutFile();
            }
        } catch (err) {
            console.error('Error in Web Share API:', err);
            fallbackTwitterShare();
        }
    } else {
        // Fallback to Twitter intent URL
        fallbackTwitterShare();
    }
    
    // Helper function for sharing without file
    function fallbackShareWithoutFile() {
        const shareDataWithoutFile = {
            title: 'Hag Hours Bingo',
            text: 'Check out my Hag Hours Bingo board! #HagHours\n' + window.location.href
        };
        
        navigator.share(shareDataWithoutFile)
            .then(() => console.log('Shared without file successfully'))
            .catch(err => {
                console.error('Error sharing without file:', err);
                fallbackTwitterShare();
            });
    }
}

// Helper function to convert dataURI to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], {type: mimeString});
}

// Traditional Twitter sharing fallback
function fallbackTwitterShare() {
    // Save the image to device first
    const link = document.createElement('a');
    link.download = 'hag-hours-bingo.png';
    link.href = window.screenshotImageData;
    link.click();
    
    // Small delay to allow download to start
    setTimeout(() => {
        const text = encodeURIComponent('Check out my Hag Hours Bingo board! #HagHours');
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        alert('Your bingo image has been downloaded. You can attach it to your tweet manually.');
    }, 500);
}