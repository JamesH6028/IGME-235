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
        "images/player.png",
        "images/emptyHeart.png",
        "images/fullHeart.png",
        "images/drone.png",
        "images/walker.png",
        "images/ammoBox.png",
        "images/healthBox.png"
    ]);
app.loader.onComplete.add(setup);
app.loader.load();

let stage;

// scenes and undefined variables
let startScene;
let gameScene, player, ammoLabel, shootSound, hitSound, explosionSound, damageSound, goal, ground, map, lwall, rwall;
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
const BrunoFont = `"Bruno Ace SC", sans-serif`;
const AntaFont = `"Anta", sans-serif`;
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
    shootSound = new Howl({
        src: ['sounds/pew.wav']
    });

    hitSound = new Howl({
        src: ['sounds/clang.wav']
    });

    explosionSound = new Howl({
        src: ['sounds/explosion.mp3']
    });

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
        fill: 0x99a9c2,
        fontSize: 48,
        fontFamily: AntaFont
    });

    // set up 'startScene'
    // make title label
    let titleLabel = new PIXI.Text("ROBO-REVOLT");
    titleLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 80,
        fontFamily: BrunoFont,
        stroke: 0x707680,
        strokeThickness: 6,
    });
    titleLabel.x = 85;
    titleLabel.y = 60;
    startScene.addChild(titleLabel);

    // make controls title label
    let controlsTitleLabel = new PIXI.Text("Controls:");
    controlsTitleLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: AntaFont,
        stroke: 0x707680,
        strokeThickness: 6
    });
    controlsTitleLabel.x = 385;
    controlsTitleLabel.y = 220;
    startScene.addChild(controlsTitleLabel);

    // make controls label
    let controlsLabel = new PIXI.Text("   A/D: move\nspace: jump\n  click: shoot\n       R: reload");
    controlsLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 28,
        fontFamily: AntaFont,
        stroke: 0x707680,
        strokeThickness: 6
    });
    controlsLabel.x = 355;
    controlsLabel.y = 280;
    startScene.addChild(controlsLabel);

    // make start game button
    let startButton = new PIXI.Text("Start Game");
    startButton.style = buttonStyle;
    startButton.x = 330;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e => e.target.alpha = 0.7);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    // add hearts 
    let full1 = new Heart(58, 58, "images/fullHeart.png");
    fullHearts.push(full1);
    let full2 = new Heart(148, 58, "images/fullHeart.png");
    fullHearts.push(full2);
    let full3 = new Heart(238, 58, "images/fullHeart.png");
    fullHearts.push(full3);
    let empty1 = new Heart(58, 58, "images/emptyHeart.png", false);
    emptyHearts.push(empty1);
    let empty2 = new Heart(148, 58, "images/emptyHeart.png", false);
    emptyHearts.push(empty2);
    let empty3 = new Heart(238, 58, "images/emptyHeart.png", false);
    emptyHearts.push(empty3);

    // make the ammo label
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 28,
        fontFamily: AntaFont,
        stroke: 0x707680,
        strokeThickness: 4
    });
    ammoLabel = new PIXI.Text(`Ammo: ${ammo} / ${clipSize} | ${heldAmmo}`);
    ammoLabel.style = textStyle;
    ammoLabel.x = 20;
    ammoLabel.y = 120;

    // make the "game over" text
    let gameOverText = new PIXI.Text("You Died!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0x707680,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 305;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 310;
    playAgainButton.y = sceneHeight - 200;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7);
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);

    // make the "victory" text
    let victoryText = new PIXI.Text("You Won!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0x707680,
        strokeThickness: 6
    });
    victoryText.style = textStyle;
    victoryText.x = 310;
    victoryText.y = sceneHeight / 2 - 160;
    victoryScene.addChild(victoryText);

    // make the 2nd "play again?" button
    let playAgainButton2 = new PIXI.Text("Play Again?");
    playAgainButton2.style = buttonStyle;
    playAgainButton2.x = 310;
    playAgainButton2.y = sceneHeight - 200;
    playAgainButton2.interactive = true;
    playAgainButton2.buttonMode = true;
    playAgainButton2.on("pointerup", startGame);
    playAgainButton2.on('pointerover', e => e.target.alpha = 0.7);
    playAgainButton2.on('pointerout', e => e.currentTarget.alpha = 1.0);
    victoryScene.addChild(playAgainButton2);
}

function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    victoryScene.visible = false;
    gameScene.visible = true;

    life = 3;
    invincible = false;
    inTimer = 0;
    player.land(player.baseY);
    heldAmmo = 50;
    ammo = clipSize;
    reloading = true;
    reloadTimer = 1.99;

    // create the goal & ground
    goal = new Finish();
    gameScene.addChild(goal);
    ground = new Platform(0x2E1600, 0, 580, 1000, 20);
    gameScene.addChild(ground);

    // create bounding walls
    lwall = new Platform(0x000000, -450, -50, 450, 700);
    platforms.push(lwall);
    gameScene.addChild(lwall);
    rwall = new Platform(0x000000, goal.x + goal.width, -50, 450, 700);
    platforms.push(rwall);
    gameScene.addChild(rwall);

    // create platforms
    createPlatform(400, 400);
    createPlatform(700, 350);
    createPlatform(1000, 300);
    createPlatform(1450, 400);
    createPlatform(1700, 200);
    createPlatform(1950, 400);
    createPlatform(2350, 400);
    createPlatform(2350, 200);



    // create enemies
    createWalker(800, 522);
    createWalker(1260, 522);
    createWalker(1760, 142);
    createWalker(2410, 342);
    createWalker(2410, 142);

    createDrone(610, 200, 300, 150);
    createDrone(910, 250, 300, 150, -1);
    createDrone(1760, 440, 475, 400);
    createDrone(2210, 200, 300, 150);
    createDrone(2620, 200, 400, 150);
    createDrone(2820, 350, 400, 150, -1);

    // add ui elements
    for (let i = 0; i < 3; i++) {
        fullHearts[i].visible = true
        gameScene.addChild(fullHearts[i]);
        emptyHearts[i].visible = false;
        gameScene.addChild(emptyHearts[i]);
    }
    gameScene.addChild(ammoLabel);

    map = new Map(platforms, ground, enemies, goal);
    app.renderer.backgroundColor = 0x4f4e4d;
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
        if (movingLeft && player.x - 1 > lwall.x + lwall.width) {
            map.move(-1, player.xSpeed, dt);
        } else if (movingRight && player.x + player.width < rwall.x - 1) {
            map.move(1, player.xSpeed, dt);
        }
    }

    // check if the player crosses the goal
    if (rectsIntersect(player, goal)) {
        end(true);
    }

    // enemies shoot and move
    for (let e of enemies) {
        e.move(dt);
        if (!isOnScreen(e, sceneWidth, sceneHeight)) continue;
        let col = e.checkCollision(player);
        if (col == "stomp") {
            explosionSound.play();
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
                    explosionSound.play();
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
    collideWithPlat = false;
    paused = true;

    // clear out arrays & remove children
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
    gameScene.removeChild(goal);
    fullHearts.forEach(h => gameScene.removeChild(h));
    emptyHearts.forEach(h => gameScene.removeChild(h));
    gameScene.removeChild(ammoLabel);

    app.renderer.backgroundColor = 0x000000;
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
    hitSound.play();
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
        if (!movingRight) player.scale.set(4, 4);
        movingRight = starting;
        return;
    }
    if (!movingLeft) player.scale.set(-4, 4);
    movingLeft = starting;
}

// jumps if the player is on the ground
function jump() {
    if (paused || player.inAir) return;
    player.jump();
}

// fires a player bullet and updates the ammo count
function playerShoot(e) {
    if (paused || ammo <= 0 || reloading) return;
    ammo--;
    ammoLabel.text = `Ammo: ${ammo} / ${clipSize} | ${heldAmmo}`;
    shoot(player, playerShots, 0xFFFF00);
}

// fires a bullet in the direction the player is facing
function shoot(e, shotArray, color, type = "not drone") {
    if (paused) return;

    shootSound.play();
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
    let sprite = "images/ammoBox.png"
    if (chance < 5) return;
    if (chance < 8) {
        type = "health";
        sprite = "images/healthBox.png";
    }
    let drop = new Pickup(sprite, e.x, e.y, type);
    gameScene.addChild(drop);
    pickups.push(drop);
}

// gives the player the associated benefit of the pickup type
function grabPickup(drop) {
    if (drop.type == "health") {
        increaseLife();
    } else if (drop.type == "ammo") {
        heldAmmo += 30;
        if (reloading) {
            ammoLabel.text = `Ammo: RELOADING... | ${heldAmmo}`;
        }
        else {
            ammoLabel.text = `Ammo: ${ammo} / ${clipSize} | ${heldAmmo}`;
        }
    }
    entityDeath(drop);
}

// creates a platform at the given coordinates and appends it
function createPlatform(x = 0, y = 0) {
    let platform = new Platform(0xFFFFFF, x, y);
    platforms.push(platform);
    gameScene.addChild(platform);
}

// creates a walker at the given coordinates and appends it
function createWalker(x = 0, y = 0) {
    let walker = new Enemy("images/walker.png", "walker", x, y);
    gameScene.addChild(walker);
    enemies.push(walker);
}

// creates a drone at the given coordinates with a given min & max and appends it
function createDrone(x = 0, y = 0, min = 0, max = 0, direction = 1) {
    let drone = new Enemy("images/drone.png", "drone", x, y, min, max, direction);
    gameScene.addChild(drone);
    enemies.push(drone);
}