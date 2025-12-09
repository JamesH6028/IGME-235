class Player extends PIXI.Graphics {
    constructor(x = 400, y = 580) {
        super();
        // this.anchor.set(.5, .5);
        // this.scale.set(0.2);
        this.width = 50;
        this.height = 100;
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.beginFill(0x00FF00);
        this.drawRect(0, -100, 50, 100);
        this.endFill();
        this.xSpeed = 300;
        this.ySpeed = 0;
        this.inAir = false;
        this.facingRight = true;
    }

    // moves the player vertically
    moveVertical(g = 981, dt = 1 / 60) {
        if (!this.inAir) return;
        this.ySpeed -= dt * g;
        this.y -= this.ySpeed * dt;
    }

    // handles when the player makes contact with the ground or a platform
    land(ypos) {
        this.y = ypos;
        this.inAir = false;
        this.ySpeed = 0;
    }

    // makes the layer jump into the air
    jump() {
        this.inAir = true;
        this.ySpeed = 600;
    }

    // handles collision between the top of the player & bottom of a platform
    hitHead() {
        this.y += 10;
        this.ySpeed *= -0.5;
    }

    // gets an integer value for the player's direction
    getDirection() {
        if (this.facingRight) return 1;
        return -1;
    }
}

class Enemy extends PIXI.Graphics {
    constructor(type = "walker", x = 500, y = 580, min = 0, max = 0) {
        super();
        this.type = type;
        this.x = x;
        this.y = y;
        let width = 50;
        let height = 100;
        let health = 5;
        let cooldown = 2;
        if (type == "drone") {
            width = 80;
            height = 40;
            health = 2;
            cooldown = 1.25;
        }
        this.width = width;
        this.height = height;
        this.beginFill(0xFF0000);
        this.drawRect(0, -1 * height, width, height);
        this.endFill();
        this.health = health;
        this.isAlive = true;
        this.cooldown = cooldown;
        this.timer = 0;
        this.facingRight = false;
        this.acceleration = 200;
        this.maxSpeed = 200;
        this.ySpeed = 200;
        this.min = min;
        this.max = max;
    }

    // takes a given amount of damage
    // if health drops to 0, it is dead
    takeDamage(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) this.isAlive = false;
    }

    // gets if the enemy can shoot
    // also updates facing direction
    canShoot(dt = 1 / 60, player) {
        this.changeDirection(player);
        this.timer += dt;
        if (this.timer < this.cooldown) return false;
        this.timer = 0;
        return true;
    }

    // changes the direction the enemy is facing
    changeDirection(player) {
        if (player.x < this.x + (this.width / 2) && this.facingRight) {
            this.facingRight = false;
        } else if (player.x > this.x + (this.width / 2) && !this.facingRight) {
            this.facingRight = true;
        }
    }

    // moves the drones vertically
    move(dt = 1 / 60) {
        if (this.type != "drone") return;
        this.ySpeed += this.acceleration * dt;
        //if (Math.abs(this.ySpeed) > this.maxSpeed) this.ySpeed = (this.ySpeed / this.ySpeed) * this.maxSpeed;
        this.y += this.ySpeed * dt;
        if ((this.y >= this.max && this.acceleration > 0) || (this.y + this.height <= this.min && this.acceleration < 0)) {
            this.acceleration *= -1;
        }
    }

    // checks if it collides with the player
    checkCollision(player) {
        if (!rectsIntersect(player, this)) return "none";
        if (this.type == "drone" && player.y < this.y - (this.height * 0.5)) return "stomp";
        return "damage";
    }
}

class Map {
    constructor(platforms, ground, enemies) {
        this.platforms = platforms;
        this.ground = ground;
        this.activePlatform = null;
        this.enemies = enemies;
        this.enemyProjectiles = [];
        this.playerProjectiles = [];
        this.pickups = [];
    }

    // moves the map
    move(direction = 1, speed = 500, dt = 1 / 60) {
        // set the direction the player is facing
        if (direction == 1) {
            player.facingRight = true;
        } else { player.facingRight = false; }

        direction *= -1;

        // move platforms 
        for (let plat of this.platforms) {
            plat.x += direction * speed * dt;
        }

        // move enemies
        for (let enemy of this.enemies) {
            enemy.x += direction * speed * dt;
        }

        // move projectiles
        for (let p of this.enemyProjectiles) {
            p.x += direction * speed * dt;
        }
        for (let p of this.playerProjectiles) {
            p.x += direction * speed * dt;
        }

        // move pickups 
        for (let p of this.pickups) {
            p.x += direction * speed * dt;
        }
    }

    // handles collision between the player and platforms
    checkCollision(player) {
        for (let plat of this.platforms) {
            if (!isOnScreen(plat, 900, 600)) continue;
            if (rectsIntersect(player, plat)) {
                if (player.x + player.width < plat.x + 10 && player.y > plat.y + (.25 * plat.height)) {
                    return true;
                }
                if (player.x > plat.x + plat.width - 10 && player.y > plat.y + (.25 * plat.height)) {
                    return true;
                }
                if (player.y <= plat.y + (.25 * plat.height)) {
                    this.activePlatform = plat;
                    player.land(plat.y);
                    return false;
                }
                if (player.y + player.height >= plat.y + plat.height - (.25 * plat.height)) {
                    player.hitHead();
                    return false;
                }
            }
        }
        if (rectsIntersect(player, this.ground)) {
            player.land(this.ground.y);
            return false;
        }
        return false;
    }

    // puts the player in free fall if they step off the platform
    stepOffPlat(player) {
        if (player.x + player.width < this.activePlatform.x || player.x > this.activePlatform.x + this.activePlatform.width) {
            player.inAir = true;
        }
    }

    // updates the list of projectiles to move
    updateProjectiles(enemyProj, playerProj) {
        this.enemyProjectiles = enemyProj.slice();
        this.playerProjectiles = playerProj.slice();
    }
}

class Platform extends PIXI.Graphics {
    constructor(color = 0xFFFFFF, x = 400, y = 400, width = 120, height = 40) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.beginFill(color);
        this.drawRect(0, 0, width, height);
        this.endFill();
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xFFFF00, x = 0, y = 0, direction = 1, damage = 1, yMove = 0) {
        super();
        this.beginFill(color);
        this.drawRect(-2, -2, 4, 6);
        this.endFill();
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.direction = direction;
        // variables
        this.fwd = { x: 1 * direction, y: yMove };
        this.speed = 600;
        this.isAlive = true;
        Object.seal(this);
    }

    // moves the bullet
    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

class Heart extends PIXI.Sprite {
    constructor(x = 0, y = 0, img, visible = true) {
        super(app.loader.resources[img].texture);
        this.scale.set(0.5);
        this.visible = visible;
        this.x = x;
        this.y = y;
    }
}

class Pickup extends PIXI.Graphics {
    constructor(x = 0, y = 0, type = "health") {
        super();
        this.x = x;
        this.y = y;
        this.type = type;
        let color = 0x072602;
        if (type == "health") {
            color = 0x990994;
        }
        this.color = color;
        this.size = 30;
        this.beginFill(color);
        this.drawRect(0, -30, 30, 30);
        this.endFill();
        this.inAir = true;
        this.ySpeed = 0;
        this.isAlive = true;
    }

    // moves the pickup when it's in free fall
    fall(dt = 1 / 60) {
        if (!this.inAir) return;
        this.ySpeed += 700 * dt;
        this.y += this.ySpeed * dt;
    }
}