 //start game when button is clicked
 document.getElementById("startGameBtn").addEventListener("click", () => {
    document.getElementById("startGameBtn").style.display = "none";
    startGame();
});

const BOARD_SIZE = 15;
const INTERVAL = 100;

let gameState = {
snake: [
    { x: 7, y: 7 },
    { x: 7, y: 6 },
    { x: 7, y: 5 }
],
direction: "down",
food: { x: 2, y: 2 },
score: 0,
highscore: 0
};

document.addEventListener("keydown", event => {
switch (event.key) {
    case "ArrowUp":
    if (gameState.direction !== "down") {
        gameState.direction = "up";
    }
    break;
    case "ArrowDown":
    if (gameState.direction !== "up") {
        gameState.direction = "down";
    }
    break;
    case "ArrowLeft":
    if (gameState.direction !== "right") {
        gameState.direction = "left";
    }
    break;
    case "ArrowRight":
    if (gameState.direction !== "left") {
        gameState.direction = "right";
    }
    break;
}
});

const startGame = () => {
    //read highscore from local storage
    gameState.highscore = localStorage.getItem("snakeHighscore");
    if (gameState.highscore === null) {
        gameState.highscore = 0;
    }
    const highscoreDisplay = document.querySelector("#highscore");
    highscoreDisplay.innerText = `Highscore: ${gameState.highscore}`;

    setInterval(() => {
        const head = gameState.snake[0];
        let newHead;
        switch (gameState.direction) {
            case "up":
            newHead = { x: head.x, y: (head.y - 1 + BOARD_SIZE) % BOARD_SIZE };
            break;
            case "down":
            newHead = { x: head.x, y: (head.y + 1) % BOARD_SIZE };
            break;
            case "left":
            newHead = { x: (head.x - 1 + BOARD_SIZE) % BOARD_SIZE, y: head.y };
            break;
            case "right":
            newHead = { x: (head.x + 1) % BOARD_SIZE, y: head.y };
            break;
        }
        gameState.snake.unshift(newHead);

        // check if the snake has collided with itself
        if (gameState.snake.slice(1).some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            //stop the game
            clearInterval();
            localStorage.setItem("snakeHighscore", gameState.highscore);
            alert(`Game over! Your score was ${gameState.score}.`);
            location.reload();
        }

        // check if the snake has eaten the food
        if (newHead.x === gameState.food.x && newHead.y === gameState.food.y) {
            gameState.food = { x: Math.floor(Math.random() * BOARD_SIZE), y: Math.floor(Math.random() * BOARD_SIZE) };
            gameState.score += gameState.snake.length;
            if (gameState.score > gameState.highscore) {
                gameState.highscore = gameState.score;
                const highscoreDisplay = document.querySelector("#highscore");
                highscoreDisplay.innerText = `Highscore: ${gameState.highscore}`;
            }
        } else {
            gameState.snake.pop();
        }

        // draw the game board
        const board = document.querySelector("#board");
        board.innerHTML = "";
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if (x === gameState.food.x && y === gameState.food.y) {
                cell.classList.add("food");
            }
            if (gameState.snake.some(segment => segment.x === x && segment.y === y)) {
                cell.classList.add("snake");
            }
            board.appendChild(cell);
            }
        }

        // update the score display
        const scoreDisplay = document.querySelector("#score");
        scoreDisplay.innerText = `Score: ${gameState.score}`;
    }, INTERVAL);
}