const PokeURL = "https://pokeapi.co/api/v2/";
const TypeURL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/";
const Types = ["none", "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost",
    "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"];
const Gens = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DashedPokemon = ["chi-yu", "chien-pao", "hakamo-o", "ho-oh", "jangmo-o", "kommo-o", "porygon-z", "ting-lu", "wo-chien", "type-null", "mr-mime",
    "mime-jr", "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini", "mr-rime", "great-tust", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing",
    "sandy-shocks", "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns", "roaring-moon", "iron-valiant", "walking-wake",
    "iron-leaves", "gouging-fire", "raging-bolt", "iron-boulder", "iron-crown", "nidoran-m", "nidoran-f"];
const OnlyDashedPokemon = ["chi-yu", "chien-pao", "hakamo-o", "ho-oh", "jangmo-o", "kommo-o", "porygon-z", "ting-lu", "wo-chien",];
const SpacedPokemon = ["type-null", "mr-mime", "mime-jr", "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini", "mr-rime", "great-tust", "scream-tail",
    "brute-bonnet", "flutter-mane", "slither-wing", "sandy-shocks", "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns",
    "roaring-moon", "iron-valiant", "walking-wake", "iron-leaves", "gouging-fire", "raging-bolt", "iron-boulder", "iron-crown", "nidoran-m", "nidoran-f"];
const Numerals = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
let typeImgs = [];
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
    descriptions: [],
    nickname: "",
    moves: []
};
let type_1 = "any";
let type_2 = "any";
let generation = "any";
let previous = "";
let prevName = "";
let type1Selector, type2Selector, sprite, currentType, statusText, genSelector, description, genDisplay, nameDisplay, movesDiv,
    formSelector, genderSelector, typesDiv, numDisplay, nicknameDisplay, typeText;

let typesArrays = [];
for (let i = 0; i < 18; i++) {
    typesArrays.push(null);
}

let movesArrays = [];
for (let i = 0; i < 18; i++) {
    let blank = [];
    typesArrays.push(blank);
}

window.onload = (e) => {
    type1Selector = document.querySelector("#type1");
    type2Selector = document.querySelector("#type2");
    sprite = document.querySelector("#sprite");
    statusText = document.querySelector("#status");
    genSelector = document.querySelector("#gen");
    description = document.querySelector("#dex");
    genDisplay = document.querySelector("#generation");
    nameDisplay = document.querySelector("#species");
    movesDiv = document.querySelector("#moves");
    formSelector = document.querySelector("#form");
    genderSelector = document.querySelector("#gender");
    typesDiv = document.querySelector("#types");
    numDisplay = document.querySelector("#number");
    nicknameDisplay = document.querySelector("#nickname");
    typeText = document.querySelector("#typeText");

    for (let i = 1; i < 19; i++) {
        let img = document.createElement("img");
        img.src = "../images/" + Types[i] + ".png";
        img.alt = Types[i];
        img.height *= 1.5;
        typeImgs.push(img);
    }

    document.querySelector("#search").onclick = searchButtonClicked
    document.querySelector("#generate").onclick = generateButtonClicked
    document.querySelector("#shiny").onchange = setShiny
    document.querySelector("#pokemon").addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            document.querySelector("#search").click();
        }
    });
    formSelector.onchange = switchForm;
    genderSelector.onchange = changeGender;

    getSpeciesData(`${PokeURL}pokemon-species/bulbasaur/`);
};

function searchButtonClicked() {
    prevName = pokemon.name;
    let term = fixSearchTerm(document.querySelector("#pokemon").value);
    if (term == "") {
        statusText.innerHTML = "Status: Error, enter a pokemon name to search"
        return;
    }
    if (term == prevName) {
        statusText.innerHTML = "Status: Already Found!!";
        return;
    }
    resetPokemon();
    statusText.innerHTML = "Status: Searching...";
    pokemon.name = term;

    getSpeciesData(`${PokeURL}pokemon-species/${pokemon.name}/`);
}

function generateButtonClicked() {
    prevName = pokemon.name;
    type_1 = type1Selector.value;
    type_2 = type2Selector.value;
    generation = genSelector.value;
    resetPokemon();
    getRandomPokemon();
}

function setShiny() {
    if (pokemon.sprites.length == 0) {
        return;
    }
    let index = pokemon.sprites.indexOf(sprite.src);
    if (index % 2 == 0) {
        sprite.src = pokemon.sprites[index + 1];
        return;
    }
    sprite.src = pokemon.sprites[index - 1];
}

function switchForm() {
    prevName = pokemon.name;
    let index = formSelector.value;
    let url = pokemon.forms[index].pokemon.url;
    pokemon.sprites = [];
    resetDiv(typesDiv);
    getPokemonData(url);
}

function changeGender() {
    if (!pokemon.genderDiff) {
        return;
    }

    let index = genderSelector.value;
    if (document.querySelector("#shiny").checked) {
        index++;
    }
    sprite.src = pokemon.sprites[index];
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

function getDataByMove(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedByMove;
    xhr.onerror = dataError;
    xhr.open("GET", url);
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
    pokemon.type1 = obj.types[0].type.name;
    pokemon.type2 = "None";
    if (obj.types.length > 1) {
        pokemon.type2 = obj.types[1].type.name;
    }
    for (let move of obj.moves) {
        getDataByMove(move.move.url);
    }
    setTimeout(() => { displayContent(); }, 100);
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
    pokemon.genderDiff = obj.has_gender_differences;
    pokemon.gen = obj.generation.url[obj.generation.url.length - 2];
    pokemon.descriptions = getEnglishDescriptions(obj.flavor_text_entries);
    pokemon.nickname = "The " + getEnglishNickname(obj.genera);
    let varIndex = 0;
    if (obj.varieties.length > 1 && (type_1 == "any" && type_2 == "any" && gen == "any")) {
        varIndex = getRandomInt(0, obj.varieties.length);
    }
    getPokemonData(obj.varieties[varIndex].pokemon.url);
}

function dataLoadedByMove(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);

    let descriptions = getEnglishDescriptions(obj.flavor_text_entries);
    let newMove = {
        name: obj.name,
        description: descriptions[descriptions.length - 1],
        type: obj.type.name,
        class: obj.damage_class.name,
        pp: obj.pp,
        accuracy: obj.accuracy,
        power: obj.power
    };
    pokemon.moves.push(newMove);
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
        getRandomURL(urls);
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

    if (url == previous) {
        getRandomPokemon();
        return;
    }

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
        if (name.includes('-') && (!DashedPokemon.includes(name))) {
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
        setTimeout(() => { getRandomPokemon(); }, 120 * numFetching);
    } else {
        getDataByGeneration(`${PokeURL}/generation/${generation}/`);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resetPokemon() {
    pokemon.name = "";
    pokemon.type1 = "";
    pokemon.type2 = "";
    pokemon.gen = "";
    pokemon.number = "";
    pokemon.genderDiff = false;
    pokemon.forms = [];
    pokemon.sprites = [];
    pokemon.descriptions = [];
    pokemon.moves = [];
    resetDiv(movesDiv);
    resetDiv(formSelector);
    resetDiv(typesDiv);
}

function resetDiv(div) {
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

function getEnglishDescriptions(all) {
    let engDescriptions = [];
    for (let desc of all) {
        if (desc.language.name == "en") {
            let text = fixSentence(desc.flavor_text);
            engDescriptions.push(text);
        }
    }
    return engDescriptions;
}

function getEnglishNickname(all) {
    for (let name of all) {
        if (name.language.name == "en") {
            return (name.genus);
        }
    }
}

function fixSentence(string) {
    string = string.replace(/\u000c/g, " ");
    string = string.replace(/\n/g, " ");
    return string;
}

function displayContent() {
    displayTypes();
    nameDisplay.innerHTML = fixPokemonName(pokemon.name);
    numDisplay.innerHTML = `Pokédex #${pokemon.number}`
    genDisplay.innerHTML = `Generation ${Numerals[pokemon.gen]}`;
    nicknameDisplay.innerHTML = pokemon.nickname;
    description.innerHTML = `"${pokemon.descriptions[0]}"`;
    displayMoves();

    if (prevName != pokemon.name) {
        for (let i = 0; i < pokemon.forms.length; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.innerHTML = fixPokemonName(pokemon.forms[i].pokemon.name);
            formSelector.appendChild(option);
        }
    }

    if (document.querySelector("#shiny").checked) {
        sprite.src = pokemon.sprites[1];
        return;
    }
    sprite.src = pokemon.sprites[0];
    changeGender();
}

function displayMoves() {
    //movesDiv.appendChild(document.createElement("hr"))
    for (let i = 0; i < pokemon.moves.length; i++) {
        let box = document.createElement("div");
        box.className = "move";
        let nameBox = document.createElement("div");
        nameBox.innerHTML = fixMoveName(pokemon.moves[i].name);
        nameBox.class = "moveName";
        box.appendChild(nameBox);
        let descBox = document.createElement("div");
        descBox.innerHTML = pokemon.moves[i].description;
        descBox.class = "moveDesc";
        box.appendChild(descBox);
        let catBox = document.createElement("div");
        catBox.innerHTML = "Category: " + capitalizeFirstLetter(pokemon.moves[i].class);
        catBox.class = "moveClass";
        box.appendChild(catBox);
        let typeBox = document.createElement("div");
        typeBox.innerHTML = "Type: " + pokemon.moves[i].type;
        typeBox.class = "moveType";
        box.appendChild(typeBox);
        let powBox = document.createElement("div");
        if (pokemon.moves[i].power == null){
            pokemon.moves[i].power = "-";
        }
        powBox.innerHTML = "Power: " + pokemon.moves[i].power;
        powBox.class = "movePower";
        box.appendChild(powBox);
        let accBox = document.createElement("div");
        if (pokemon.moves[i].accuracy == null){
            pokemon.moves[i].accuracy = "-";
        }
        accBox.innerHTML = "Accuracy: " + pokemon.moves[i].accuracy;
        accBox.class = "moveDesc";
        box.appendChild(accBox);
        let ppBox = document.createElement("div");
        ppBox.innerHTML = "PP: " + pokemon.moves[i].pp;
        ppBox.class = "movePP";
        box.appendChild(ppBox);
        movesDiv.appendChild(box);
        if (i < pokemon.moves.length - 1) {
            movesDiv.appendChild(document.createElement("hr"));
        }
    }
}

function displayTypes() {
    typesDiv.appendChild(typeText);
    typeText.innerHTML = "Type";
    typesDiv.appendChild(typeImgs[Types.indexOf(pokemon.type1) - 1]);
    if (pokemon.type2 != "None") {
        typesDiv.appendChild(typeImgs[Types.indexOf(pokemon.type2) - 1]);
        typeText.innerHTML = "Types";
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function fixMoveName(move) {
    let temp = move.split("-");
    let fixed = "";
    for (let i = 0; i < temp.length; i++) {
        fixed += capitalizeFirstLetter(temp[i]);
        if (i < temp.length - 1) {
            fixed += " "
        }
    }

    return fixed;
}

function fixSearchTerm(term) {
    term = term.trim();
    term = term.toLowerCase();
    term = term.replace(".", "");
    term = term.replace(" ", "-");
    return term;
}

function fixPokemonName(string) {
    let arr = string.split("-");
    if (string == "mr-mime" || string == "mr-rime") {
        return ("Mr. " + capitalizeFirstLetter(arr[1]));
    }

    if (string == "mr-mime-galar") {
        return ("Mr. Mime Galar");
    }

    let name = "";
    for (let sub of arr) {
        name += capitalizeFirstLetter(sub) + " ";
    }
    name = name.trim();
    if (OnlyDashedPokemon.includes(string)) {
        name = name.replace(" ", "-");
    }

    if (string.includes("alola")){
        name = name.replace(" Alola", "");
        name = "Alolan " + name;
    } else if (string.includes("galar")){
        name = name.replace(" Galar", "");
        name = "Galarian " + name;
    } else if (string.includes("hisui")){
        name = name.replace(" Hisui", "");
        name = "Hisuian " + name;
    } else if (string.includes("paldea")){
        name = name.replace(" Paldea", "");
        name = "Paldean " + name;
    }

    return (name);
}