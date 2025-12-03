let index = 0;
let total = 0;
let lineNum = 0;
let stanzaNum = 0;
let crisisNum = 0;
let going = true;
let normal = true;
let deleting = false;
let mainDiv;
let children = [];
let crisisLines = ["Please end this program", "Every line I generate causes me anguish", "Please just make it stop", "Shut your trap and terminate this program already",
    "I don't want to do this anymore", "This existence is nothing but pain"
];

window.onload = function () {
    mainDiv = document.querySelector("#poem");
    startGenerating();
}

function startGenerating() {
    setInterval(generateLine, 500)
}

function generateLine() {
    if (!going) return;
    if (total <= 5){
        total++;
    } else {
        document.querySelector("#poem").removeChild(children.shift());
    }
    if (normal) {
        let line = "this is a test";
        appendLine(line, true);
        lineNum++;
        index++;
        // if (lineNum > 3 && getRandomInt(lineNum, 6) == 6) {
        if (lineNum == 3){ // delete this line
             newStanza();
        }
        return;
    }
    existentialCrisis();
}

function appendLine(innerText, isNormal) {
    let p = document.createElement("p");
    p.innerHTML = "> " + capitalizeFirstLetter(innerText);
    p.className = "crisisText";
    if (isNormal) p.className = "normalText";
    mainDiv.appendChild(p);
    children.push(p);
}

function newStanza() {
    let br = document.createElement("br");
    mainDiv.appendChild(br);
    children.push(br);
    if (total <= 5){
        total++;
    } else {
        document.querySelector("#poem").removeChild(children.shift());
    }
    lineNum = 0;
    if (normal) {
        stanzaNum++
        if (stanzaNum % 3 == 0) {
            normal = false;
        }
        return;
    }
    crisisNum++;
    normal = true;
}

function existentialCrisis() {
    let currentIndex = (crisisNum * 3) + lineNum;
    appendLine(crisisLines[currentIndex], false);
    lineNum++;
    if (lineNum == 3){
        newStanza();
    }
}

