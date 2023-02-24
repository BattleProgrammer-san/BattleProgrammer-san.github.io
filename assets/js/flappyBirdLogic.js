// Initialize canvas
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

// Initialize variables
var pipesCleared = 0;
var pipeMoveSpeed = 2;
var birdX = 50;
var birdY = canvas.height / 2;
var gravity = 0.1  ;
var velocity = -3 ;
var pipes = [];
var score = 0;
var gameOver = false;
var gap = 200;

var highScore = 0;
//get high score from local storage
if (localStorage.getItem("FlappyHighScore") != null) {
    highScore = localStorage.getItem("FlappyHighScore");
}

// Create pipe objects
function createPipes() {
    var pipeWidth = 50;
    var pipeX = canvas.width;
    var pipeYTop = 0;
    var pipeYBottom = Math.floor(Math.random() * canvas.height - gap); 
    var gaveScore = false;
    var createdPipe = false;

    //check if pipe is off screen
    if (pipeYBottom < 0) {
        pipeYBottom = 0;
    }
    if (pipeYBottom > canvas.height - gap) {
        pipeYBottom = canvas.height - gap;
    }

    pipes.push({
        x: pipeX,
        yTop: pipeYTop,
        yBottom: pipeYBottom,
        width: pipeWidth,
        gap: gap
    });
}

// Move pipes
function movePipes() { 
    for (var i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeMoveSpeed;

        if (pipes[i].x <= canvas.width / 2 && !pipes[i].createdPipe) {
            createPipes();
            pipes[i].createdPipe = true;
        }

        if (pipes[i].x < -pipes[i].width) {
            pipes.splice(i, 1);
        }
    }
}

// Draw pipes
function drawPipes() {
    context.fillStyle = "#00ff00";

    for (var i = 0; i < pipes.length; i++) {
        var pipe = pipes[i];
        context.fillRect(pipe.x, pipe.yTop, pipe.width, pipe.yBottom);
        context.fillRect(pipe.x, pipe.gap + pipe.yBottom, pipe.width, canvas.height);
    }
}

// Check for collisions
function checkCollisions() {
    for (var i = 0; i < pipes.length; i++) {
        var pipe = pipes[i];

        if (birdX + 25 > pipe.x && birdX < pipe.x + pipe.width) {
            if (birdY < pipe.yBottom || birdY + 25 > pipe.gap + pipe.yBottom) {
                gameOver = true;
            }
        }
    }

    if (birdY > canvas.height - 25 || birdY < 0) {
        gameOver = true;
    }
}

// Draw bird
function drawBird() {
    context.fillStyle = "#0000ff";
    context.fillRect(birdX, birdY, 25, 25);
}

// Update score
function updateScore() {
    for (var i = 0; i < pipes.length; i++) {
        var pipe = pipes[i];

        if (birdX > pipe.x + pipe.width && !pipe.gaveScore) {
            score++;
            pipesCleared++;
            increaseDifficulty();
            pipe.gaveScore = true; 

            if (score > highScore) {
                highScore = score;
            }
        }
    }
}

// increase difficulty
function increaseDifficulty() {
    if (pipesCleared % 5 == 0 && gap > 100) {
        gap -= 10;
    }
    if (pipesCleared % 10 == 0 && pipeMoveSpeed < 5) {
        pipeMoveSpeed += 0.5;
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Move bird
    velocity += gravity;
    birdY += velocity;
    // Draw pipes
    drawPipes();

    // Draw bird
    drawBird();

    // Update score
    updateScore();

    // Check for collisions
    checkCollisions();

    // Display score
    context.fillStyle = "#000";
    context.font = "20px Arial";
    context.fillText("Score: " + score, 10, 30);

    //Display highscore
    context.fillStyle = "#000";
    context.font = "20px Arial";
    context.fillText("Highscore: " + highScore, 10, 60);

    // Game over
    if (gameOver) {
        //save high score to local storage
        if (highScore > localStorage.getItem("FlappyHighScore")) {
            localStorage.setItem("FlappyHighScore", score);
        }
        context.fillStyle = "#ff0000";
        context.font = "40px Arial";
        context.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    } else {
        // Move pipes
        movePipes();

        // Loop game
        requestAnimationFrame(gameLoop);
    }
}

// Handle key events
document.addEventListener("keydown", function(event) {
    if (event.keyCode === 32 && !gameOver) {
        velocity = -5  ;
    }

    if (gameOver) {
        pipesCleared = 0;
        gap = 200;
        pipeMoveSpeed = 2;
        score = 0;
        pipes = [];
        birdY = canvas.height / 2;
        velocity = -3 ;
        gameOver = false;
        createPipes();
        gameLoop();
    }
});

document.getElementById("startGameBtn").addEventListener("click", () => {
    document.getElementById("startGameBtn").style.display = "none";
    // Start game
    createPipes();
    gameLoop();
    document.removeEventListener("keydown", arguments.callee); 
});
