const PokeURL = "https://pokeapi.co/api/v2/"
const Types = ["none", "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison",
    "ground", "flying", "psychic", "bug", "rock", "ghost", "dark", "dragon", "steel", "fairy"];
let pokemon = "";
let sprite;

window.onload = (e) => {
    document.querySelector("#search").onclick = searchButtonClicked
    sprite = document.querySelector("#sprite");
};


function searchButtonClicked() {
    pokemon = document.querySelector("#pokemon").value;
    if (pokemon == "") {
        let type1 = document.querySelector("#type1").value;
        let type2 = document.querySelector("#type2").value;
        let gen = document.querySelector("#gen").value;
        pokemon = getRandomPokemon(type1, type2, gen);
    }
    console.log(`${PokeURL}pokemon/${pokemon}/`);
    getDataByName(`${PokeURL}pokemon/${pokemon}/`);
}

function getDataByName(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedByName;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

function getDataByID(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedByID;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

function dataLoadedByName(e) {
    let xhr = e.target;

    let obj = JSON.parse(xhr.responseText);
    let pokeID = obj.id;
    sprite.src = obj.sprites.front_default;
    console.log(obj.id);
    getDataByID(`${PokeURL}pokemon-species/${pokeID}/`)
}

function dataLoadedByID(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);
}

function dataError(e) {
    console.log("An error occurred");
}

function getRandomPokemon(type1, type2, gen) {
    while ((type1 == "any") || (type1 == type2)) {
        type1 = Types[getRandomInt(1, Types.length)];
    }

    while ((type2 == "any") || (type1 == type2)) {
        type2 = Types[getRandomInt(0, Types.length)];
    }
    
    if (gen == "any"){

    }
    else {gen = gen.parse;}

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}