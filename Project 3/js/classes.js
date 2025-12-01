class Player extends PIXI.Sprite {
    constructor(x = 400, y = 300) {
        super(app.loader.resources["images/spaceship.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
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
        this.ySpeed = 500;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xFFFFFF, x = 0, y = 0) {
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