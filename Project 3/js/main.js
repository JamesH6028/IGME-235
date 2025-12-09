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
        "images/emptyHeart.png",
        "images/fullHeart.png"
    ]);
app.loader.onComplete.add(setup);
app.loader.load();

let stage;

// scenes and undefined variables
let startScene;
let gameScene, player, ammoLabel, shootSound, hitSound, explosionSound, damageSound, goal, ground, map;
let gameOverScene;
let victoryScene;

// arrays
let playerShots = [];
let enemies = [];
let enemyShots = [];
let platforms = [];
let pickups = [];
let fullHearts = [];
let emptyHearts = [];

// other pre-defined variables
let paused = true;
let movingLeft = false;
let movingRight = false;
let collideWithPlat = false;
let invincible = false;
let inTime = 1;
let inTimer = 0;
let reloading = true;
let reloadTime = 2;
let reloadTimer = 1.99;
let life = 3;
let heldAmmo = 50;
let clipSize = 10;
let ammo = clipSize;

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

    // Create the `victory` scene and make it invisible
    victoryScene = new PIXI.Container();
    victoryScene.visible = false;
    stage.addChild(victoryScene);

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
            updateMove(-1, true);
        }
        if (key == "d") {
            updateMove(1, true);
        }
        if (key == " ") {
            jump();
        }
        if (key == "r") {
            startReload();
        }
    });

    document.addEventListener('keyup', (event) => {
        const key = event.key;

        if (key == "a") {
            updateMove(-1, false);
        }
        if (key == "d") {
            updateMove(1, false);
        }
    })

    app.view.onclick = playerShoot;
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

    // add hearts 
    let full1 = new Heart(10, 10, "images/fullHeart.png");
    fullHearts.push(full1);
    gameScene.addChild(full1);
    let full2 = new Heart(100, 10, "images/fullHeart.png");
    fullHearts.push(full2);
    gameScene.addChild(full2);
    let full3 = new Heart(190, 10, "images/fullHeart.png");
    fullHearts.push(full3);
    gameScene.addChild(full3);
    let empty1 = new Heart(10, 10, "images/emptyHeart.png", false);
    emptyHearts.push(empty1);
    gameScene.addChild(empty1);
    let empty2 = new Heart(100, 10, "images/emptyHeart.png", false);
    emptyHearts.push(empty2);
    gameScene.addChild(empty2);
    let empty3 = new Heart(190, 10, "images/emptyHeart.png", false);
    emptyHearts.push(empty3);
    gameScene.addChild(empty3);

    // make the ammo label
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 28,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    ammoLabel = new PIXI.Text(`Ammo: ${ammo} / ${clipSize} | ${heldAmmo}`);
    ammoLabel.style = textStyle;
    ammoLabel.x = 20;
    ammoLabel.y = 120;
    gameScene.addChild(ammoLabel);

    let gameOverText = new PIXI.Text("You Died!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);
}

function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    victoryScene.visible = false;
    gameScene.visible = true;

    life = 3;
    for (let i = 0; i < 3; i++) {
        fullHearts[i].visible = true;
        emptyHearts[i].visible = false;
    }
    invincible = false;
    inTimer = 0;
    player.land(player.baseY);
    heldAmmo = 50;
    ammo = clipSize;
    reloading = true;
    reloadTimer = 1.99;

    // Create platforms & ground
    let p = new Platform();
    platforms.push(p);
    gameScene.addChild(p);
    let p1 = new Platform(0xFFFFFF, 1000, 300);
    platforms.push(p1);
    gameScene.addChild(p1);
    let p2 = new Platform(0xFFFFFF, 750, 350);
    platforms.push(p2);
    gameScene.addChild(p2);
    ground = new Platform(0xAAAAAA, 0, 580, 1000, 20);
    gameScene.addChild(ground);

    // create enemies
    // CREATE CONSTRUCTOR FUNCTIONS FOR THE ENEMIES/PLATFORMS
    let walker = new Enemy();
    gameScene.addChild(walker);
    enemies.push(walker);

    let drone = new Enemy("drone", 500, 200, 300, 150);
    gameScene.addChild(drone);
    enemies.push(drone);

    map = new Map(platforms, ground, enemies);
    paused = false;
}

function gameLoop() {
    if (paused) return;

    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    // update invincibility status
    if (invincible) {
        inTimer += dt;
        if (inTimer >= inTime) {
            invincible = false;
            inTimer = 0;
        }
    }

    // update reload status
    if (reloading) {
        reloadTimer += dt;
        if (reloadTimer >= reloadTime) {
            endReload();
        }
    }

    // move the player vertically
    if (player.inAir) {
        player.moveVertical(700, dt);
        collideWithPlat = map.checkCollision(player);
    } else if (player.y < player.baseY) {
        map.stepOffPlat(player);
    }

    // moves the map so long as the player isn't colliding with a platform
    if (!collideWithPlat) {
        if (movingLeft) {
            map.move(-1, player.xSpeed, dt);
        } else if (movingRight) {
            map.move(1, player.xSpeed, dt);
        }
    }

    // enemies shoot and move
    for (let e of enemies) {
        e.move(dt);
        if (!isOnScreen(e, sceneWidth, sceneHeight)) continue;
        let col = e.checkCollision(player);
        if (col == "stomp") {
            e.takeDamage(2);
            spawnPickup(e);
            entityDeath(e);
            continue;
        } else if (col == "damage") {
            decreaseLife();
        }
        if (e.canShoot(dt, player)) {
            shoot(e, enemyShots, 0xFF9900, e.type);
        }
    }

    // move bullets
    for (let shot of playerShots) {
        shot.move(dt);
    }
    for (let shot of enemyShots) {
        shot.move(dt);
    }

    // move pickups 
    for (let p of pickups) {
        if (!p.inAir) continue;
        p.fall(dt);
        if (rectsIntersect(p, ground)) {
            p.y = ground.y;
            p.inAir = false;
            continue;
        }
        for (let plat of platforms) {
            if (!isOnScreen(plat, 900, 600));
            if (rectsIntersect(p, plat)) {
                p.y = plat.y;
                p.inAir = false;
                break;
            }
        }
    }

    // handle collisions
    for (let s of playerShots) {
        // remove any offscreen bullets
        if (!isOnScreen(s, sceneWidth, sceneHeight)) {
            entityDeath(s);
            continue;
        }
        for (let p of platforms) {
            // remove any bullets that collide with platforms
            if (rectsIntersect(s, p)) {
                entityDeath(s);
                break;
            }
        }
        if (!s.isAlive) continue;
        for (let e of enemies) {
            // collision between player bullets & enemies
            if (rectsIntersect(s, e)) {
                e.takeDamage(s.damage);
                entityDeath(s);
                if (!e.isAlive) {
                    spawnPickup(e);
                    entityDeath(e);
                }
                break;
            }
        }
    }

    for (let s of enemyShots) {
        // remove any offscreen bullets
        if (!isOnScreen(s, sceneWidth, sceneHeight)) {
            entityDeath(s);
            continue;
        }
        if (rectsIntersect(s, ground)) {
            entityDeath(s);
            continue;
        }
        for (let p of platforms) {
            // remove any bullets that collide with platforms
            if (rectsIntersect(s, p)) {
                entityDeath(s);
                break;
            }
        }
        if (rectsIntersect(s, player)) {
            // colisions with player
            entityDeath(s);
            decreaseLife();
        }
    }

    for (let p of pickups) {
        if (rectsIntersect(p, player)) {
            grabPickup(p);
        }
    }

    // remove dead entities from arrays
    playerShots = playerShots.filter(s => s.isAlive);
    enemies = enemies.filter(e => e.isAlive);
    enemyShots = enemyShots.filter(s => s.isAlive);
    pickups = pickups.filter(p => p.isAlive);
    map.updateProjectiles(enemyShots, playerShots);
    map.enemies = enemies.slice();
    map.pickups = pickups.slice();

    // end the game if the player dies
    if (life <= 0) end(false);
}

// ends the game
function end(win) {
    movingLeft = false;
    movingRight = false;
    paused = true;

    // clear out arrays
    platforms.forEach(p => gameScene.removeChild(p));
    platforms = [];
    enemies.forEach(e => gameScene.removeChild(e));
    enemies = [];
    playerShots.forEach(s => gameScene.removeChild(s));
    playerShots = [];
    enemyShots.forEach(s => gameScene.removeChild(s));
    enemyShots = [];
    pickups.forEach(p => gameScene.removeChild(p));
    pickups = [];

    // goes to the victory scene if the player wins or game over scene if they lose
    if (win) {
        victoryScene.visible = true;
    } else {
        gameOverScene.visible = true;
    }
    gameScene.visible = false;
}

// decreases the player's life
function decreaseLife() {
    if (invincible) return;
    life--;
    fullHearts[life].visible = false;
    emptyHearts[life].visible = true;
    if (life > 0) invincible = true;
}

// increases the player's life 
function increaseLife() {
    if (life == 3) return;
    fullHearts[life].visible = true;
    emptyHearts[life].visible = false;
    life++;
}

// tells the game to start/stop movement in designated direction 
function updateMove(direction, starting) {
    if (paused) return;
    if (direction == 1) {
        movingRight = starting;
        return;
    }
    movingLeft = starting;
}

// jumps if the player is on the ground
function jump() {
    if (paused || player.inAir) return;
    player.jump();
}

// fires a player bullet and updates the ammo count
function playerShoot(e) {
    if (ammo <= 0 || reloading) return;
    ammo--;
    ammoLabel.text = `Ammo: ${ammo} / ${clipSize} | ${heldAmmo}`;
    shoot(player, playerShots, 0xFFFF00);
}

// fires a bullet in the direction the player is facing
function shoot(e, shotArray, color, type = "not drone") {
    if (paused) return;

    let xspawn = e.x + e.width;
    let yspawn = e.y - (.5 * e.height);
    let shotDirection = 1;
    let yMove = 0;
    if (!e.facingRight) {
        xspawn = e.x;
        shotDirection = -1;
    }
    if (type == "drone") {
        xspawn = e.x + (e.width / 2);
        yspawn = e.y;
        yMove = 1;
    }
    let shot = new Bullet(color, xspawn, yspawn, shotDirection, 1, yMove);
    shotArray.push(shot);
    gameScene.addChild(shot);
    map.updateProjectiles(enemyShots, playerShots);
}

// starts the process of reloading
function startReload() {
    if (ammo == clipSize || ammo + heldAmmo == 0 || paused) return;
    reloading = true;
    ammoLabel.text = `Ammo: RELOADING... | ${heldAmmo}`;
}

// ends the process of reloading
function endReload() {
    reloading = false;
    reloadTimer = 0;
    let amount = clipSize - ammo;
    if (amount > heldAmmo) amount = heldAmmo;
    ammo += amount;
    heldAmmo -= amount;
    ammoLabel.text = `Ammo: ${ammo} / ${clipSize} | ${heldAmmo}`;
}

// removes an entity from the scene and sets it to not be alive
function entityDeath(e) {
    gameScene.removeChild(e);
    e.isAlive = false;
}

// spawns a pickup at the location of a dead enemy
function spawnPickup(e) {
    let chance = getRandomInt(0, 10);
    let type = "ammo";
    if (chance < 5) return;
    if (chance < 8) type = "health";
    let drop = new Pickup(e.x, e.y, type);
    gameScene.addChild(drop);
    pickups.push(drop);
}

// gives the player the associated benefit of the pickup type
function grabPickup(drop) {
    if (drop.type == "health") {
        increaseLife();
    } else if (drop.type == "ammo") {
        heldAmmo += 30;
        ammoLabel.text = `Ammo: ${ammo} / ${clipSize} | ${heldAmmo}`;
    }
    entityDeath(drop);
}