class Player extends PIXI.Graphics {
    constructor(x = 400, y = 550) {
        super();
        // this.anchor.set(.5, .5);
        // this.scale.set(0.2);
        this.width = 50;
        this.height = 100;
        this.x = x;
        this.y = y;
        this.beginFill(0x00FF00);
        this.drawRect(0, -70, 50, 100);
        this.endFill;
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

    jump() {
        this.inAir = true;
        this.ySpeed = 600;
    }
}

class Map {
    constructor(platforms, ground){
        this.platforms = platforms;
        this.ground = ground;
    }

    move(direction = 1, speed = 500, dt = 1 / 60){
        direction *= -1;
        for (let plat of platforms){
            plat.x += direction * speed * dt;
        }
    }

    checkCollision(player){
        for (let plat of this.platforms){
            if (rectsIntersect(player, plat)){
                return;
            }
        }
    }
}

class Platform extends PIXI.Graphics {
    constructor(color = 0xFFFFFF, x = 400, y = 450, width = 120, height = 40) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.beginFill(color);
        this.drawRect(0, 0, width, height);
        this.endFill;
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