import { Application } from "https://esm.sh/@pixi/app";
import { Graphics } from "https://esm.sh/@pixi/graphics";

const cells = document.querySelectorAll(".cell");

const scoreDisplay = document.querySelector("#score");

const restartBtn = document.querySelector("#restart");

let score = 0;

let currentAngle = 0;
let targetAngle = 0;
let categories = [];

let gameOver = false;


// Fetch category data using XMLHttpRequest
const loadCategories = () => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://people.rit.edu/anwigm/235/practical/oddwords.php");

    xhr.onload = () => {
        if (xhr.status === 200) {
            let obj = JSON.parse(xhr.responseText);
            categories = obj.slice();

            startGame();
        } else {
            console.error("Failed to load categories");
        }
    };

    xhr.onerror = () => console.error("Network error");
    xhr.send();
};

// PixiJS setup
const app = new Application({
    width: 100,
    height: 100,
    backgroundAlpha: 0,
    antialias: true
});

document.querySelector("#pixi-container").appendChild(app.view);


const arrow = new Graphics();
arrow.beginFill(0xFF0000);
arrow.moveTo(50, 10);
arrow.lineTo(30, 50);
arrow.lineTo(50, 35);
arrow.lineTo(70, 50);
arrow.endFill();
arrow.pivot.set(50, 50);
arrow.position.set(50, 50);
app.stage.addChild(arrow);

app.ticker.add(() => {
    const diff = targetAngle - currentAngle;
    if (Math.abs(diff) > 0.01) {
        currentAngle += diff * 0.1;
        arrow.rotation = currentAngle;
    } else {
        currentAngle = targetAngle;
        arrow.rotation = currentAngle;
    }
});

// Rotate the arrow (direction is +1 or -1)
const rotateArrow = (direction) => {
    const ninety = Math.PI / 2;
    targetAngle += direction * ninety;
};

// Returns direction index (0–3) based on angle
const getCurrentDir = () => {
    const normalized = ((targetAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    return Math.round(normalized / (Math.PI / 2)) % 4;
};

// Shuffle array -- this is not the best method to shuffle an array, but it works pretty
// well, especially with small fairly inconsequential arrays.  It's not truly random, however.
const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

// Set up one round of the game
const newRound = () => {
    const [catA, catB] = shuffle(categories).slice(0, 2); // this is called array destructuring
    const correctItems = shuffle(catA.correct).slice(0, 3);
    const oddOne = shuffle(catB.incorrect)[0];
    const allItems = shuffle([...correctItems, oddOne]); // this is a use of the spread operator
    const correctIndex = allItems.indexOf(oddOne);

    cells.forEach((cell, i) => {
        cell.textContent = allItems[i];
        cell.dataset.correct = i === correctIndex;
        cell.classList.remove("correct", "wrong");
    });
};


// Handle the spacebar selection
const handleSelection = () => {
    if (gameOver) return;


    const dir = getCurrentDir();
    const selected = Array.from(cells).find(c => Number(c.dataset.dir) === dir);
    const isCorrect = selected.dataset.correct === "true";

    if (isCorrect) {
        selected.classList.add("correct");
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;

        setTimeout(newRound, 500);
    } else {
        selected.classList.add("wrong");

        const correctCell = Array.from(cells).find(c => c.dataset.correct === "true");
        correctCell.classList.add("correct");

        scoreDisplay.textContent = `Final Score: ${score}`;
        restartBtn.classList.remove("hidden");
        gameOver = true;
    }
};



const setupInput = () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === "ArrowRight") rotateArrow(1);
        if (e.key === "ArrowLeft") rotateArrow(-1);
        if (e.code === "Space") handleSelection();
    });
};

restartBtn.addEventListener("click", () => {
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    restartBtn.classList.add("hidden");
    gameOver = false;
    newRound();
});

const startGame = () => {
    setupInput();
    newRound();
};

loadCategories()
