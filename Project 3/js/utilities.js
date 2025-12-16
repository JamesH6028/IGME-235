// bounding box collision detection - it compares PIXI.Rectangles
function rectsIntersect(a, b) {
	let ab = a.getBounds();
	let bb = b.getBounds();
	return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

// checks if an object is on screen
function isOnScreen(rect, screenWidth, screenHeight) {
	let r = rect.getBounds();
	return r.x < screenWidth && r.x + r.width > 0 && r.y < screenHeight && r.y + r.height > 0;
}

//gets a random integer value
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}