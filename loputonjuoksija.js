// Canvas ja konteksti
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Päivitä canvasin koko
canvas.width = 1200; // Uusi leveys
canvas.height = 600; // Uusi korkeus

// Keskitetään canvas tyylillä
canvas.style.margin = "auto";
canvas.style.display = "block";
canvas.style.position = "relative";
canvas.style.top = "50px";

// Pelin muuttujat
let isGameRunning = false;
let gravity = 0.4;
let jumpPower = -20;
let speed = 4; // Nopeutettu hieman isommalle pelialueelle
let score = 0;
let obstacleSpawnRate = 0.002; // Todennäköisyys esteen ilmestymiselle
let selectedCharacter = null;

// Pelaajan hyppyjen määrä
let jumpCount = 0;

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
let backgroundXFar = 0; 
const backgroundSpeedFar = 3;

// Pelaaja
const player = {
    x: 100, // Pelaaja siirtyy hieman oikealle suuremmalla pelialueella
    y: canvas.height - 180, 
    width: 120, 
    height: 160, 
    velocityY: 0,
    image: null, 
    draw() {
        const img = new Image();
        img.src = this.image; 
        ctx.drawImage(img, this.x, this.y, this.width, this.height); 
    },
    update() {
        this.y += this.velocityY;
        this.velocityY += gravity;

        // Estä pelaajaa putoamasta lattian läpi
        if (this.y > canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            jumpCount = 0; 
        }

        // Estä pelaajaa menemästä katosta läpi
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0; 
        }
    }
};

// Hahmon valinta
function selectCharacter(character) {
    selectedCharacter = character;

    document.getElementById("nalaButton").classList.remove("active-character");
    document.getElementById("enzioButton").classList.remove("active-character");

    if (character === "nala") {
        document.getElementById("nalaButton").classList.add("active-character");
        player.image = "images/nala.png"; 
    } else if (character === "enzio") {
        document.getElementById("enzioButton").classList.add("active-character");
        player.image = "images/enzio.png"; 
    }

    backgroundImageFar = backgroundImages[character];
    console.log(`Hahmo valittu: ${character}`);
}

// Piirrä tausta
function drawBackground() {
    const imgFar = new Image();
    imgFar.src = backgroundImageFar;

    ctx.drawImage(imgFar, backgroundXFar, 0, canvas.width, canvas.height);
    ctx.drawImage(imgFar, backgroundXFar + canvas.width, 0, canvas.width, canvas.height);

    backgroundXFar -= backgroundSpeedFar;

    if (backgroundXFar <= -canvas.width) {
        backgroundXFar = 0;
    }
}

// Esteet
const obstacles = [];
function createObstacle() {
    const img = new Image();
    img.src = obstacleImages[selectedCharacter]; 
    img.onload = () => {
        const height = 120; 
        const width = 100; 
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

    obstacles.forEach(obstacle => {
        obstacle.draw();
    });

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Pisteet: ${score}`, 10, 20);
}

// Päivitä peli
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); 
    player.update();

    obstacles.forEach((obstacle, index) => {
        obstacle.update();

        // Pelaajan törmäyslaatikon määrittely
        const playerCollisionBox = {
            x: player.x + 20, // Pelaajan laatikon vasen reuna
            y: player.y + 20, // Pelaajan laatikon yläreuna
            width: player.width - 40, // Pelaajan laatikon leveys
            height: player.height - 40 // Pelaajan laatikon korkeus
        };

        // Esteen törmäyslaatikon määrittely
        const obstacleCollisionBox = {
            x: obstacle.x + 10, // Esteen laatikon vasen reuna
            y: obstacle.y + 10, // Esteen laatikon yläreuna
            width: obstacle.width - 20, // Esteen laatikon leveys
            height: obstacle.height - 20 // Esteen laatikon korkeus
        };

        // Tarkista törmäys rajatuilla alueilla
        if (
            playerCollisionBox.x < obstacleCollisionBox.x + obstacleCollisionBox.width &&
            playerCollisionBox.x + playerCollisionBox.width > obstacleCollisionBox.x &&
            playerCollisionBox.y < obstacleCollisionBox.y + obstacleCollisionBox.height &&
            playerCollisionBox.y + playerCollisionBox.height > obstacleCollisionBox.y
        ) {
            stopGame();
        }

        // Poista esteet, kun ne ovat ruudun ulkopuolella
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }
    });

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
    if (e.code === "Space" && jumpCount < 2) { 
        player.velocityY = jumpPower;
        jumpCount++; 
    }
});
