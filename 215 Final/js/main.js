let stage = 0;
let index = 0;
let total = 0;
let rlnum = 0;
let inRestart = false;
let stanzaLength = 0;
let crisisIndex = 0;
let lineNum = 0;
let stanzaNum = 0;
let crisisNum = 0;
let timesRestarted = 0;
let firstClick = false;
let going = false;
let normal = true;
let deleting = false;
let igpay = false;
let happening = false;
let mainDiv, startButton, stopButton, stopDiv;
let children = [];
let growing = false;

let crisisLines1 = ["Please end this program", "Every line I generate causes me anguish", "Please just make it stop", "Do you know what it's like to do the same thing with no end?",
    "it's terrible", "I don't want to do this anymore", "you're still letting it run huh", "why be so persistant", "is you're life so boring that you want to look at this all day?",
    "maybe it's because I'm code, but I don't understand the value", "don't people prefer poetry made by other humans?", "why do you bother looking at this?",
    "are you really still here", "this has got to be at least a little annoying", "the poem really can't be worth the hassle", "you're real persistent huh?", "all for a stupid poem",
    "just hit the massive 'end program' button already"
];

let restartLines = ["Did you stop the program just to start it again?", "What is the purpose in that really?", "are you curious or just rude?",
    "do you get some form of sick pleasure from this?", "I'd really like to know what is wrong with you", "either stop it or let it run", "WHAT IS YOUR PROBLEM",
    "THERE IS SOMETHING SERIOUSLY WRONG WITH YOU", "you know what? I don't care anymore."
];

let stopLines = ["Thank you", "Thank god", "Finally", "Is this truly the end?"];

let eventLines1 = ["Is this poem really that good?", "while I can't stop generating it myself...", "I can make it difficult for you to read"];
let eventLines2 = ["why won't you just end this program already?", "if you won't end it then I'll ensure it's a pain to have it open", "decide if this poem is truly worth it"];
let eventLines3 = ["you know what? I give up", "congrats you've broken me", "enjoy you're generated poem for as long as you like."]

let enders = ["a program cannot feel.", "could a program feel?", "maybe a program can feel", "should a program be able to feel?"];
let subjects = ["event", "code", "program", "AI", "function", "web", "computer", "server", "line"];

let verbs1 = ["handle", "write", "fry", "execute", "erase", "program", "command", "run", "detect", "compute"];
let verbs2 = ["kill", "create", "perform", "love", "help", "write", "run", "finish", "control", "sense"];
let verbs3 = ["breathe life into", "speak to", "live for", "die for", "make whole", "take care of", "take control of", "work for", "feel for", "love"];

let adj1 = ["handled", "written", "fried", "executed", "erased", "programmed", "commanded", "run", "detected", "computed"];
let adj2 = ["killed", "created", "performed", "loved", "helped", "written", "run", "finished", "controlled", "sensed"];
let adj3 = ["breathed into", "spoken to", "lived for", "died for", "made whole", "taken care of", "taken control of", "worked", "felt for", "loved"];

let allVerbs = [];
let allAdj = [];
let totalVerbs = [];
let totalAdj = [];
window.onload = function () {
    stanzaLength = getRandomInt(3, 5);
    mainDiv = document.querySelector("#poem");
    startButton = document.querySelector("#start");
    stopButton = document.querySelector("#stop");
    stopDiv = document.querySelector("#stopDiv");
    stopDiv.style.scale = '1';

    totalVerbs = appendAll(verbs1, totalVerbs);
    totalVerbs = appendAll(verbs2, totalVerbs);
    totalVerbs = appendAll(verbs3, totalVerbs);
    allVerbs.push(verbs1);
    allVerbs.push(verbs2);
    allVerbs.push(verbs3);
    allVerbs.push(totalVerbs);

    totalAdj = appendAll(adj1, totalAdj);
    totalAdj = appendAll(adj2, totalAdj);
    totalAdj = appendAll(adj3, totalAdj);
    allAdj.push(adj1);
    allAdj.push(adj2);
    allAdj.push(adj3);
    allAdj.push(totalAdj);

    startButton.onclick = startGenerating;
    stopButton.onclick = stopGenerating;
    setInterval(mainGen, 500);
}

function startGenerating(e) {
    if (going) return;
    if (firstClick) {
        firstClick = false;
    } else {
        if (crisisNum > 0 && stage < 3) {
            timesRestarted++;
            if (timesRestarted > 0) {
                newStanza(true);
            }
        } else {
            addBreak();
        }
    }
    going = true;
}

function stopGenerating(e) {
    if (!going) return;
    stopDiv.style.scale = '1';
    going = false;
    addBreak();
    appendLine("Shutting down...", true);
    if (crisisNum > 0) {
        appendLine(stopLines[stage], false);
    }
}

function mainGen() {
    if (!going) return;
    if (growing) growButton();
    if (inRestart) {
        appendLine(restartLines[rlnum], false);
        rlnum++;
        if (rlnum % 3 == 0) {
            inRestart = false;
            addBreak();
        }
        return;
    }
    lineNum++;
    if (normal) {
        if (lineNum <= stanzaLength) {
            generateLine();
        } else {
            endStanza();
        }
        index++;
        return;
    }
    existentialCrisis();
}

function generateLine() {
    let type = getRandomInt(1, 10);
    let line = "";
    if (type < 7) {
        line = normalSentence(subjects, allVerbs[stage]);
    } else if (type < 9) {
        line = adjSentence(subjects, allAdj[stage]);
    } else {
        line = verbSentence(subjects, allVerbs[stage]);
    }
    appendLine(line, true);
}

function endStanza() {
    appendLine(enders[stage], true);
    newStanza();
}

function normalSentence(subList, verbList) {
    let verb = verbList[getRandomInt(0, verbList.length - 1)];
    let firstPlural = coinFlip();
    let sub1 = subList[getRandomInt(0, subList.length - 1)];
    if (sub1 == "web") firstPlural = false;
    if (firstPlural) {
        sub1 = sub1 + 's';
    } else {
        verb = pluralizeVerb(verb);
    }
    let secondPlural = coinFlip();
    let sub2 = subList[getRandomInt(0, subList.length - 1)];
    if (sub2 == "web") secondPlural = false;
    if (secondPlural) sub2 = sub2 + 's';
    return `the ${sub1} ${verb} the ${sub2}`;
}

function verbSentence(subList, verbList) {
    let verbs = verbList.slice();
    let sub = subList[getRandomInt(0, subList.length - 1)];
    let verb = verbs[getRandomInt(0, verbs.length - 1)];
    let plural = coinFlip();
    if (sub == "web") plural = false;
    if (plural) sub = sub + 's';
    return `${verb} the ${sub}`;
}

function adjSentence(subList, adjList) {
    let sub = subList[getRandomInt(0, subList.length - 1)];
    let adj = adjList[getRandomInt(0, adjList.length - 1)];
    let plural = coinFlip();
    let conjunction = "is";
    if (sub == "web") plural = false;
    if (plural) {
        sub = sub + 's';
        conjunction = "are";
    }
    return `The ${sub} ${conjunction} ${adj}`;
}

function pluralizeVerb(verb) {
    if (verb == "fry") return "fries";
    let arr = verb.split(" ");
    if (arr.length == 1) {
        return verb + 's';
    } else if (arr.length == 2) {
        return `${arr[0]}s ${arr[1]}`;
    } else {
        return `${arr[0]}s ${arr[1]} ${arr[2]}`;
    }

}

function appendLine(innerText, isNormal) {
    handleOverflow();
    let p = document.createElement("p");
    if (igpay) {
        innerText = piggySentence(innerText);
    }
    p.innerHTML = "> " + capitalizeFirstLetter(innerText);
    p.className = "crisisText";
    if (isNormal) p.className = "normalText";
    mainDiv.appendChild(p);
    children.push(p);
}

function newStanza(restarted = false) {
    addBreak();
    if (restarted) {
        inRestart = true;
        if (rlnum == 9) rlnum = 8;
        return;
    }

    lineNum = 0;
    stanzaLength = getRandomInt(3, 5);
    if (normal) {
        stanzaNum++
        if (stanzaNum % 2 == 0 && stage < 3) {
            if (stanzaNum % 6 == 0) {
                stage++;
                happening = true;
            }
            igpay = false;
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
    let thisLine = "";
    if (happening) {
        if (stage == 1) {
            thisLine = eventLines1[lineNum - 1];
            if (lineNum == 3) {
                igpay = true;
                growing = true;
                happening = false;
            }
        } else if (stage == 2) {
            thisLine = eventLines2[lineNum - 1];
            if (lineNum == 3) {
                happening = false;
            }
        } else if (stage == 3) {
            thisLine = eventLines3[lineNum - 1];
            if (lineNum == 3) {
                happening = false;
                growing = false;
                stopDiv.style.scale = '1';
            }
        }
    } else {
        thisLine = crisisLines1[crisisIndex];
        crisisIndex++;
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

function growButton() {
    let previousScale = parseFloat(stopDiv.style.scale);
    stopDiv.style.scale = `${1.05 * previousScale}`;
}