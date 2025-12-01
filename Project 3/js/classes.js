class Player extends PIXI.Sprite {
    constructor(x = 400, y = 300, speed = 50) {
        super(app.loader.resources["images/spaceship.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    move(direction = 1, dt = 1 / 60) {
        this.x += direction * this.speed * dt;
    }
}