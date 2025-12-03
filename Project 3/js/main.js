"use strict";

// create & append the canvas
const app = new PIXI.Application({
    width: 900,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const gravity = -9;

// pre-load the images 
app.loader.
    add([
        "images/spaceship.png",
        "images/explosions.png"
    ]);
app.loader.onComplete.add(setup);
app.loader.load();

let stage;

// scenes and undefined variables
let startScene;
let gameScene, player, lifeLabel, ammoLabel, shootSound, hitSound, explosionSound, damageSound, goal, ground, map;
let gameOverScene;

// arrays
let playerShots = [];
let enemies = [];
let enemyShots = [];
let platforms = [];
let pickups = [];

// other pre-defined variables
let paused = true;

function setup() {
    stage = app.stage;
    // Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // Create labels & buttons
    createLabelsAndButtons();

    // Create player character
    player = new Player();
    gameScene.addChild(player);
    // Load sound effects

    // Start the game loop
    app.ticker.add(gameLoop);

    // Assign events
    document.addEventListener('keydown', (event) => {
        const key = event.key;

        if (key == "a") {
            move(-1);
        }
        if (key == "d") {
            move(1);
        }
        if (key == " ") {
            jump();
        }
    });

    app.view.onclick = shoot;
}

function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Futura"
    });

    // set up 'startScene'
    // make title label
    let titleLabel = new PIXI.Text("ROBO-REVOLT");
    titleLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6,
    });
    titleLabel.x = 120;
    titleLabel.y = 60;
    startScene.addChild(titleLabel);

    // make controls title label
    let controlsTitleLabel = new PIXI.Text("Controls:");
    controlsTitleLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    controlsTitleLabel.x = 395;
    controlsTitleLabel.y = 220;
    startScene.addChild(controlsTitleLabel);

    // make controls label
    let controlsLabel = new PIXI.Text("  A/D: move\nspace: jump\n click: shoot\n      R: reload");
    controlsLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 28,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    controlsLabel.x = 375;
    controlsLabel.y = 280;
    startScene.addChild(controlsLabel);

    // make start game button
    let startButton = new PIXI.Text("Start Game");
    startButton.style = buttonStyle;
    startButton.x = 350;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e => e.target.alpha = 0.7);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);
}

function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    let p = new Platform();
    platforms.push(p);
    gameScene.addChild(p);

    ground = new Platform(0xAAAAAA, 0, 580, 1000, 20);
    gameScene.addChild(ground);

    map = new Map(platforms, ground);
    paused = false;
}

function gameLoop() {
    if (paused) return;

    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    // move the player vertically
    if (player.inAir) {
        player.moveVertical(700, dt);
        let collis = map.checkCollision(player);
        if (collis == "above") {
            player.land(400);
        } else if (collis == "ground") {
            player.land(ground.y);
        }
    } else if (player.y < player.baseY) {
        map.isOnPlatform(player);
    }

    // move bullets
    for (let shot of playerShots) {
        shot.move(dt);
    }

}

function move(direction) {
    if (paused) return;

    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;
    //player.moveHorizontal(direction, dt);
    map.move(direction, player.speed, dt);
}

function jump() {
    if (paused || player.inAir) return;
    player.jump();
}

function shoot(e) {
    if (paused) return;

    let shot = new Bullet(0xFFFF00, player.x + player.width, player.y - (.5 * player.height));
    playerShots.push(shot);
    gameScene.addChild(shot);
}