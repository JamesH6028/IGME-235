// gets a random integer value (inclusive)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// capitalizes the first letter in a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// 50/50 shot at getting true or false
function coinFlip() {
    let i = getRandomInt(0, 1);
    if (i == 0) return false;
    return true;
}

// converts a word to pig latin
function piggy(str) {
    const vowels = "aeiouAEIOU";
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (vowels.includes(char)) {
            if (i == 0) {
                return str + "way";
            } else {
                return str.substring(i, str.length) + str.substring(0, i) + "ay";
            }
        }
    }
}

// converts a sentence to pig latin
function piggySentence(str) {
    end = "";
    if (str.includes("?")) {
        end = "?";
        str = str.replace("?", "");
    }
    let sentence = "";
    const words = str.split(" ")
    for (let word of words) {
        sentence += piggy(word) + " ";
    }
    return sentence.trim() + end;
}

// adds one array to another while taking out duplicates
function appendAll(words, arr) {
    for (let word of words) {
        if (!arr.includes(word)) {
            arr.push(word);
        }
    }
    return arr;
}