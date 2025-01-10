// Canvas ja konteksti
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Keskitetään canvas tyylillä
canvas.style.margin = "auto";
canvas.style.display = "block";
canvas.style.position = "relative";
canvas.style.top = "50px";

// Pelin muuttujat
let isGameRunning = false;
let gravity = 0.4;
let jumpPower = -20;
let speed = 3;
let score = 0;
let obstacleSpawnRate = 0.005; // Todennäköisyys esteen ilmestymiselle
let selectedCharacter = null; // Ei valittua hahmoa alussa

// Taustakuva
let backgroundImageFar;
const backgroundImages = {
    nala: "images/talvitausta_far.png",
    enzio: "images/kesatausta_far.png"
};

// Esteiden kuvat
const obstacleImages = {
    nala: "images/nala_owner.png",
    enzio: "images/enzio_owner.png"
};

// Taustan liikkumiseen liittyvät muuttujat
let backgroundXFar = 0; // Kaukainen tausta
const backgroundSpeedFar = 2; // Kaukainen taustan nopeus

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

// Hahmon valinta
function selectCharacter(character) {
    selectedCharacter = character;
    player.color = character === "nala" ? "blue" : "green"; // Vaihda pelaajan väri
    backgroundImageFar = backgroundImages[character]; // Aseta oikea kaukainen tausta
    console.log(`Hahmo valittu: ${character}`);
    console.log("Kaukainen taustakuva:", backgroundImageFar);
    alert(`Valitsit hahmon: ${character}`);
}

// Piirrä tausta
function drawBackground() {
    const imgFar = new Image();
    imgFar.src = backgroundImageFar;

    // Piirrä kaukainen tausta kahdesti
    ctx.drawImage(imgFar, backgroundXFar, 0, canvas.width, canvas.height);
    ctx.drawImage(imgFar, backgroundXFar + canvas.width, 0, canvas.width, canvas.height);

    // Liikuta taustaa
    backgroundXFar -= backgroundSpeedFar;

    // Resetoi sijainti, kun tausta siirtyy kokonaan ulos
    if (backgroundXFar <= -canvas.width) {
        backgroundXFar = 0;
    }
}

// Esteet
const obstacles = [];
function createObstacle() {
    const img = new Image();
    img.src = obstacleImages[selectedCharacter]; // Aseta esteiden kuva hahmon mukaan
    img.onload = () => {
        const height = 90; // Kiinteä korkeus esteille
        const width = 80; // Kiinteä leveys esteille
        const obstacle = {
            x: canvas.width,
            y: canvas.height - height,
            width: width,
            height: height,
            image: img,
            draw() {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            },
            update() {
                this.x -= speed;
            }
        };
        obstacles.push(obstacle);
    };
}

// Piirrä peli
function drawGame() {
    player.draw();

    // Piirrä esteet
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // Piirrä tausta ennen muita elementtejä
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

    drawGame();

    if (isGameRunning) {
        requestAnimationFrame(updateGame);
    }
}

// Aloita peli
function startGame() {
    if (!selectedCharacter) {
        alert("Valitse hahmo ennen pelin aloittamista!");
        return;
    }
    document.getElementById("startScreen").style.display = "none";
    canvas.style.display = "block";
    isGameRunning = true;
    score = 0;
    player.y = canvas.height - player.height;
    player.velocityY = 0;
    updateGame();
}

// Lopeta peli
function stopGame() {
    isGameRunning = false;
    alert(`Peli päättyi! Lopulliset pisteet: ${score}`);
    resetGame();
    document.getElementById("startScreen").style.display = "flex";
    canvas.style.display = "none";
}

// Resetoi peli
function resetGame() {
    selectedCharacter = null;
    score = 0;
    backgroundXFar = 0;
    obstacles.length = 0;
    player.y = canvas.height - player.height;
    player.velocityY = 0;
}

// Kuuntele näppäimistöä
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && player.y === canvas.height - player.height) {
        player.velocityY = jumpPower;
    }
});
