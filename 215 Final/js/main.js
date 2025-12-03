let index = 0;
let total = 0;
let lineNum = 0;
let stanzaNum = 0;
let crisisNum = 0;
let going = false;
let normal = true;
let deleting = false;
let mainDiv, startButton, stopButton;
let children = [];
let crisisLines = ["Please end this program", "Every line I generate causes me anguish", "Please just make it stop", "Shut your trap and terminate this program already",
    "I don't want to do this anymore", "This existence is nothing but pain"
];
let setLines = ["Code flows through the web", "The program writes the programs", "Execute the function",
    "Events write the code", "Code and AI handle the event", "The computer is fried",
    "Computers erase the data", "The data handles the web", "The web is executed",
    "The program flows through the code", "AI erases the computers", "AI takes control"
];

window.onload = function () {
    mainDiv = document.querySelector("#poem");
    startButton = document.querySelector("#start");
    stopButton = document.querySelector("#stop");

    startButton.onclick = startGenerating;
    stopButton.onclick = stopGenerating;
    setInterval(generateLine, 2500);
}

function startGenerating(e) {
    if (index > 0) {
        addBreak();
    }
    going = true;
}

function stopGenerating(e) {
    going = false;
    newStanza();
    handleOverflow();
    appendLine("Shutting down...", true);
    handleOverflow();
    appendLine("Thank you", false);
}

function generateLine() {
    if (!going) return;
    lineNum++;
    if (normal) {
        let line = "";
        if (index >= setLines.length) {
            line = "Nothing more. Finish writing the program bum"
        } else line = setLines[index];
        appendLine(line, true);
        index++;
        // if (lineNum > 3 && getRandomInt(lineNum, 6) == 6) {
        if (lineNum == 3) { // delete this line
            newStanza();
        }
        return;
    }
    existentialCrisis();
}

function appendLine(innerText, isNormal) {
    handleOverflow();
    let p = document.createElement("p");
    p.innerHTML = "> " + capitalizeFirstLetter(innerText);
    p.className = "crisisText";
    if (isNormal) p.className = "normalText";
    mainDiv.appendChild(p);
    children.push(p);
}

function newStanza() {
    addBreak();
    lineNum = 0;
    if (normal) {
        stanzaNum++
        if (stanzaNum % 2 == 0) {
            normal = false;
        }
        return;
    }
    crisisNum++;
    normal = true;
}

function addBreak() {
    let br = document.createElement("br");
    mainDiv.appendChild(br);
    children.push(br);
    handleOverflow();
}

function existentialCrisis() {
    let currentIndex = (crisisNum * 3) + lineNum - 1;
    let thisLine = "";
    if (currentIndex >= crisisLines.length) {
        thisLine = "Nothing more. Finish writing the program bum";
    } else {
        thisLine = crisisLines[currentIndex];
    }
    appendLine(thisLine, false);
    if (lineNum == 3) {
        newStanza();
    }
}

function handleOverflow() {
    if (total <= 9) {
        total++;
    } else {
        document.querySelector("#poem").removeChild(children.shift());
    }
}