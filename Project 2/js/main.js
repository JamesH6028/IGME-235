const PokeURL = "https://pokeapi.co/api/v2/"
const Types = ["none", "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison",
    "ground", "flying", "psychic", "bug", "rock", "ghost", "dark", "dragon", "steel", "fairy"];
const Gens = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
let unusedGens = Gens.slice();
let pokemon = {
    name: "",
    type1: "",
    type2: "",
    gen: "",
    number: "",
    genderDiff: false,
    forms: [],
    sprites: [],
    description: "",
};
let type_1 = "any";
let type_2 = "any";
let generation = "any";
let previous = "";
let sprite, currentType, statusText, genSelector;

let typesArrays = [];
for (let i = 0; i < 18; i++) {
    typesArrays.push(null);
}

window.onload = (e) => {
    document.querySelector("#search").onclick = searchButtonClicked
    sprite = document.querySelector("#sprite");
    statusText = document.querySelector("#status");
    genSelector = document.querySelector("#gen");
};


function searchButtonClicked() {
    resetPokemon();
    statusText.innerHTML = "Status: Searching...";
    pokemon.name = document.querySelector("#pokemon").value;
    if (pokemon.name == "") {
        type_1 = document.querySelector("#type1").value;
        type_2 = document.querySelector("#type2").value;
        generation = genSelector.value;
        getRandomPokemon();
        return;
    }
    getSpeciesData(`${PokeURL}pokemon-species/${pokemon.name}/`);
    console.log(`${PokeURL}pokemon-species/${pokemon.name}/`);
}

function getPokemonData(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedPokemon;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

function getSpeciesData(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedSpecies;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

function getDataByGeneration(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedByGen;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

function getDataByType(url) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = dataLoadedByType;
    xhr.onerror = dataError;
    xhr.send();
}

function dataLoadedPokemon(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);

    pokemon.sprites.push(obj.sprites.front_default);
    pokemon.sprites.push(obj.sprites.front_shiny);
    if (pokemon.genderDiff) {
        pokemon.sprites.push(obj.sprites.front_female);
        pokemon.sprites.push(obj.sprites.front_shiny_female);
    }
    sprite.src = pokemon.sprites[0];
    statusText.innerHTML = "Status: Found!";
}

function dataLoadedSpecies(e) {
    let xhr = e.target;
    if (xhr.responseText == "Not Found") {
        statusText.innerHTML = `Error: No Pokemon found with name "${pokemon.name}"`;
        return
    }
    let obj = JSON.parse(xhr.responseText);
    pokemon.name = obj.name;
    pokemon.number = obj.pokedex_numbers[0].entry_number;
    pokemon.forms = obj.varieties.slice();
    pokemon.genderDiff = obj.has_gender_difference;
    pokemon.gen = obj.generation.url[obj.generation.url.length - 2];
    getPokemonData(obj.varieties[0].pokemon.url);
}

function dataLoadedByGen(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);
    let pokemonInGen = [];
    let urls = [];
    let viable = [];
    for (let poke of obj.pokemon_species) {
        pokemonInGen.push(poke.name);
        urls.push(poke.url);
    }

    if (type_1 == "any" && type_2 == "any") {
        getSpeciesData(urls[getRandomInt(0, urls.length - 1)]);
        unusedGens = Gens.slice();
        return;
    }

    if (type_1 == "any") {
        let index = Types.indexOf(type_2) - 1;
        for (let i = 0; i < pokemonInGen.length; i++) {
            if (typesArrays[index].includes(pokemonInGen[i])) {
                viable.push(urls[i]);
            }
        }
        getRandomURL(viable);
        return;
    }

    if (type_2 == "any") {
        let index = Types.indexOf(type_1) - 1;
        for (let i = 0; i < pokemonInGen.length; i++) {
            if (typesArrays[index].includes(pokemonInGen[i])) {
                viable.push(urls[i]);
            }
        }
        getRandomURL(viable);
        return;
    }

    if (type_1 != "any" && type_2 != "any") {
        let index1 = Types.indexOf(type_1) - 1;
        let index2 = Types.indexOf(type_2) - 1;
        for (let i = 0; i < pokemonInGen.length; i++) {
            if ((typesArrays[index1].includes(pokemonInGen[i])) && (typesArrays[index2].includes(pokemonInGen[i]))) {
                viable.push(urls[i]);
            }
        }
        getRandomURL(viable);
        return;
    }
    console.log("failed break");
}

function getRandomURL(viable) {
    if (viable.length == 0) {
        if (genSelector.value == "any") {
            getRandomPokemon();
            return;
        }
        else {
            statusText.innerHTML = "ERROR: No pokemon with selected attributes found!";
            return;
        }
    }

    unusedGens = Gens.slice();
    let url = "";
    if (viable.length > 1) {
        while (url == previous || url == "") {
            url = viable[getRandomInt(0, viable.length - 1)];
        }

    } else { url = viable[0]; }
    previous = url;
    getSpeciesData(url);
}

function dataLoadedByType(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);
    let pokemonInType = [];
    let duplicates = [];
    for (let poke of obj.pokemon) {
        let name = poke.pokemon.name;
        if (name.includes('-') && (name != "porygon-z" && name != "mime-jr")) {
            let pokeName = name.split('-')[0];
            if (!duplicates.includes(pokeName)) {
                duplicates.push(pokeName);
                pokemonInType.push(pokeName);
            }
            continue;
        }
        pokemonInType.push(name);
    }
    typesArrays[currentType] = pokemonInType;
}

function dataError(e) {
    console.log("An error occurred");
}

function getRandomPokemon() {
    let numFetching = 0;

    if (genSelector.value == "any") {
        let index = getRandomInt(0, unusedGens.length - 1);
        generation = unusedGens[index];
        unusedGens.splice(index, 1);
    }

    if (type_1 != "any") {
        let index = Types.indexOf(type_1) - 1;
        if (typesArrays[index] == null) {
            currentType = index;
            numFetching++;
            getDataByType(`${PokeURL}type/${type_1}/`);
        }
    }

    if (type_2 != "any" && type_2 != "none") {
        let index = Types.indexOf(type_2) - 1;
        if (typesArrays[index] == null) {
            currentType = index;
            numFetching++;
            getDataByType(`${PokeURL}type/${type_2}/`);
        }
    }

    if (numFetching > 0) {
        setTimeout(() => { getRandomPokemon(); }, 100 * numFetching);
    } else {
        getDataByGeneration(`${PokeURL}/generation/${generation}/`);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resetPokemon(){
    pokemon.name = "";
    pokemon.type1 = "";
    pokemon.type2 = "";
    pokemon.gen = "";
    pokemon.number = "";
    pokemon.genderDiff = false;
    pokemon.forms = [];
    pokemon.sprites = [];
}