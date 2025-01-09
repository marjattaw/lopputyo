// Canvas ja konteksti
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Pelin muuttujat
let isGameRunning = false;
let gravity = 0.5;
let jumpPower = -15;
let speed = 3;
let score = 0;
let obstacleSpawnRate = 0.005; // Todennäköisyys esteen ilmestymiselle

// Pelaaja
const player = {
    x: 50,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    color: "blue",
    velocityY: 0,
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        this.y += this.velocityY;
        this.velocityY += gravity;

        // Estä pelaajaa putoamasta lattian läpi
        if (this.y > canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
        }
    }
};

// Laske pelaajan maksimihyppykaari
function calculateJumpHeight() {
    let jumpHeight = Math.abs(jumpPower) * (Math.abs(jumpPower) / (2 * gravity));
    return jumpHeight;
}

// Esteet
const obstacles = [];
function createObstacle() {
    const maxObstacleHeight = Math.min(50, canvas.height / 4); // Maksimikorkeus esteelle asetettu matalaksi
    const height = Math.random() * maxObstacleHeight + 20; // Esteiden korkeus 20 - maxObstacleHeight
    const obstacle = {
        x: canvas.width,
        y: canvas.height - height,
        width: 20,
        height: height,
        color: "red",
        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            this.x -= speed;
        }
    };
    obstacles.push(obstacle);
}

// Piirrä peli
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Piirä pelaaja
    player.draw();

    // Piirä esteet
    obstacles.forEach(obstacle => {
        obstacle.draw();
    });

    // Näytä pisteet
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Pisteet: ${score}`, 10, 20);
}

// Päivitä peli
function updateGame() {
    player.update();

    obstacles.forEach((obstacle, index) => {
        obstacle.update();

        // Törmäystarkistus
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            stopGame();
        }

        // Poista esteet, kun ne ovat ruudun ulkopuolella
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }
    });

    // Lisää este satunnaisesti
    if (Math.random() < obstacleSpawnRate) {
        createObstacle();
    }

    // Lisää haastetta ajan myötä
    if (score % 10 === 0 && score > 0) {
        obstacleSpawnRate += 0.001; // Lisää esteiden ilmestymistiheyttä
    }

    drawGame();

    if (isGameRunning) {
        requestAnimationFrame(updateGame);
    }
}

// Aloita peli
function startGame() {
    document.getElementById("startScreen").style.display = "none";
    canvas.style.display = "block";
    isGameRunning = true;
    score = 0;
    obstacles.length = 0;
    player.y = canvas.height - player.height;
    player.velocityY = 0;
    obstacleSpawnRate = 0.005; // Palauta alkuperäinen ilmestymistiheys
    updateGame();
}

// Lopeta peli
function stopGame() {
    isGameRunning = false;
    alert(`Peli päättyi! Lopulliset pisteet: ${score}`);
    document.getElementById("startScreen").style.display = "flex";
    canvas.style.display = "none";
}

// Kuuntele näppäimistöä
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && player.y === canvas.height - player.height) {
        player.velocityY = jumpPower;
    }
});

// Aloita pelin napista
document.getElementById("startGameButton").addEventListener("click", startGame);
