// Canvas ja konteksti
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Keskitetään canvas tyylillä
document.getElementById("gameCanvas").style.margin = "auto";
document.getElementById("gameCanvas").style.display = "block";
document.getElementById("gameCanvas").style.position = "relative";
document.getElementById("gameCanvas").style.top = "50px";

// Pelin muuttujat
let isGameRunning = false;
let gravity = 0.5;
let jumpPower = -15;
let speed = 3;
let score = 0;
let obstacleSpawnRate = 0.005; // Todennäköisyys esteen ilmestymiselle
let selectedCharacter = null; // Ei valittua hahmoa alussa

// Taustakuvat
let backgroundImage;
const backgroundImages = {
    nala: "images/talvitaustakuva.png",
    enzio: "images/kesätaustakuva.png"
};

// Esteiden kuvat
const obstacleImages = {
    nala: "images/nala_owner.png",
    enzio: "images/enzio_owner.png"
};

// Taustan liikkumiseen liittyvät muuttujat
let backgroundX = 0;
const backgroundSpeed = 2;

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
    backgroundImage = backgroundImages[character]; // Aseta oikea tausta
    console.log(`Hahmo valittu: ${character}`);
    console.log("Taustakuva:", backgroundImage);
    console.log("Esteen kuva:", obstacleImages[character]);
    alert(`Valitsit hahmon: ${character}`);
}

// Piirrä tausta
function drawBackground() {
    const img = new Image();
    img.src = backgroundImage;
    ctx.drawImage(img, backgroundX, 0, canvas.width, canvas.height); // Ensimmäinen taustakuva
    ctx.drawImage(img, backgroundX + canvas.width, 0, canvas.width, canvas.height); // Jatko

    // Liikuta taustaa
    backgroundX -= backgroundSpeed;
    if (backgroundX <= -canvas.width) {
        backgroundX = 0; // Resetoi taustan sijainti
    }
}

// Esteet
const obstacles = [];
function createObstacle() {
    const img = new Image();
    img.src = obstacleImages[selectedCharacter]; // Aseta esteiden kuva hahmon mukaan
    img.onload = () => {
        console.log(`Kuva ladattu: ${img.src}`);
        const height = 80; // Kiinteä korkeus esteille
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
    img.onerror = () => {
        console.error(`Kuvaa ei voitu ladata: ${img.src}`);
    };
}

// Piirrä peli
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Piirrä pelaaja
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
    resetGame(); // Resetoi pelin tila
    document.getElementById("startScreen").style.display = "flex";
    canvas.style.display = "none";
}

// Resetoi peli
function resetGame() {
    selectedCharacter = null; // Poista hahmon valinta
    score = 0; // Nollaa pisteet
    backgroundX = 0; // Resetoi taustan sijainti
    obstacles.length = 0; // Tyhjennä esteet
    player.y = canvas.height - player.height; // Palauta pelaajan sijainti
    player.velocityY = 0; // Nollaa pelaajan nopeus
    backgroundImage = null; // Poista taustakuva
}


// Kuuntele näppäimistöä
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && player.y === canvas.height - player.height) {
        player.velocityY = jumpPower;
    }
});
