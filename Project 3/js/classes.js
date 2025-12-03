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
        this.xSpeed = 500;
        this.ySpeed = 0;
        this.inAir = false;
    }

    moveHorizontal(direction = 1, dt = 1 / 60) {
        this.x += direction * this.xSpeed * dt;
    }

    moveVertical(g = 981, dt = 1 / 60) {
        this.ySpeed -= dt * g;
        this.y -= this.ySpeed * dt;
    }

    land(ypos) {
        this.y = ypos;
        this.inAir = false;
        this.ySpeed = 0;
    }

    jump() {
        this.inAir = true;
        this.ySpeed = 600;
    }

    hitHead() {
        this.y += 10;
        this.ySpeed *= -0.5;
    }
}

class Map {
    constructor(platforms, ground) {
        this.platforms = platforms;
        this.ground = ground;
        this.activePlatform = null;
    }

    move(direction = 1, speed = 500, dt = 1 / 60) {
        direction *= -1;
        for (let plat of platforms) {
            plat.x += direction * speed * dt;
        }
    }

    checkCollision(player) {
        for (let plat of this.platforms) {
            if (!plat.isOnScreen()) continue;
            if (rectsIntersect(player, plat)) {
                // if (player.x + player.width < plat.x + 10 && player.y > plat.y + (.25 * plat.height)) {
                //     plat.x = player.x + player.width;
                //     return;
                // }
                // if (player.x > plat.x + plat.width - 10 && player.y > plat.y + (.25 * plat.height)) {
                //     plat.x = player.x - plat.width;
                //     return;
                // }
                if (player.y <= plat.y + (.25 * plat.height)) {
                    this.activePlatform = plat;
                    player.land(plat.y);
                    return;
                }
                if (player.y + player.height >= plat.y + plat.height - (.25 * plat.height)) {
                    player.hitHead();
                    return;
                }
            }
        }
        if (rectsIntersect(player, this.ground)) {
            player.land(this.ground.y);
        }
    }

    isOnPlatform(player) {
        if (player.x + player.width < this.activePlatform.x || player.x > this.activePlatform.x + this.activePlatform.width) {
            player.inAir = true;
        }
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

    isOnScreen(width = 900, height = 600) {
        if (this.x < 900 && this.x + width > 0) return true;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xFFFF00, x = 0, y = 0) {
        super();
        this.beginFill(color);
        this.drawRect(-2, -2, 4, 6);
        this.endFill();
        this.x = x;
        this.y = y;
        // variables
        this.fwd = { x: 1, y: 0 };
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}