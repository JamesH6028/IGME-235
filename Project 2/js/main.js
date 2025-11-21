const PokeURL = "https://pokeapi.co/api/v2/";
const TypeURL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/";

//list of types in order for indexing
const Types = ["none", "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost",
    "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"];
const Gens = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

//arrays containing names that have dashes/spaces
//used to fix text later
const DashedPokemon = ["chi-yu", "chien-pao", "hakamo-o", "ho-oh", "jangmo-o", "kommo-o", "porygon-z", "ting-lu", "wo-chien", "type-null", "mr-mime",
    "mime-jr", "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini", "mr-rime", "great-tust", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing",
    "sandy-shocks", "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns", "roaring-moon", "iron-valiant", "walking-wake",
    "iron-leaves", "gouging-fire", "raging-bolt", "iron-boulder", "iron-crown", "nidoran-m", "nidoran-f"];
const OnlyDashedPokemon = ["chi-yu", "chien-pao", "hakamo-o", "ho-oh", "jangmo-o", "kommo-o", "porygon-z", "ting-lu", "wo-chien",];
const SpacedPokemon = ["type-null", "mr-mime", "mime-jr", "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini", "mr-rime", "great-tust", "scream-tail",
    "brute-bonnet", "flutter-mane", "slither-wing", "sandy-shocks", "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns",
    "roaring-moon", "iron-valiant", "walking-wake", "iron-leaves", "gouging-fire", "raging-bolt", "iron-boulder", "iron-crown", "nidoran-m", "nidoran-f"];

const Numerals = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const Prefix = "jh6028";
const NameKey = Prefix + "name";

//colors for each type
const BackColors = ["bbbbaa", "bb5544", "6699ff", "aa4499", "ccaa55", "b6a561", "a8b921", "6666bb",
    "888888", "dd3e22", "2f84d9", "77cc44", "f6c630", "db4477", "77ddff", "5b4ac1", "775544", "ffaaff"];

let typeImgs = [];
let unusedGens = Gens.slice();

//pokemon object used to store most information
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

//variables for elements
let searchBar, type1Selector, type2Selector, sprite, currentType, statusText, genSelector, description, genDisplay, nameDisplay, movesDiv,
    formSelector, genderSelector, typesDiv, numDisplay, nicknameDisplay, typeText;

//creates empty arrays for each type
//pokemon are later added to each for random generation w/ filters
let typesArrays = [];
for (let i = 0; i < 18; i++) {
    typesArrays.push(null);
}

// let movesArrays = [];
// for (let i = 0; i < 18; i++) {
//     let blank = [];
//     typesArrays.push(blank);
// }

window.onload = (e) => {
    //gets the elements needed
    searchBar = document.querySelector("#pokemon");
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

    //creates the image of each type for later use
    for (let i = 1; i < 19; i++) {
        let img = document.createElement("img");
        img.src = "../images/" + Types[i] + ".png";
        img.alt = Types[i];
        img.height *= 1.5;
        typeImgs.push(img);
    }

    //event assignments
    document.querySelector("#search").onclick = searchButtonClicked
    document.querySelector("#generate").onclick = generateButtonClicked
    document.querySelector("#shiny").onchange = setShiny
    searchBar.addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            document.querySelector("#search").click();
        }
    });
    formSelector.onchange = switchForm;
    genderSelector.onchange = changeGender;

    //gets the last search term from local storage
    const StoredName = localStorage.getItem(NameKey);
    if (StoredName) {
        searchBar.value = StoredName;
    } else {
        searchBar.value = "bulbasaur"
    }

    document.querySelector("#search").click();
};

function searchButtonClicked() {
    prevName = pokemon.name;
    let term = fixSearchTerm(searchBar.value);

    //checks for unnecessary searches
    if (term == "") {
        statusText.innerHTML = "Status: Error, enter a pokemon name to search"
        return;
    }
    if (term == prevName) {
        statusText.innerHTML = "Status: Already Found!!";
        return;
    }
    
    //tells the user that search has begun
    statusText.innerHTML = "Status: Searching...";
    pokemon.name = term;

    getSpeciesData(`${PokeURL}pokemon-species/${pokemon.name}/`);
}

function generateButtonClicked() {
    prevName = pokemon.name;

    //gets values from selectors
    type_1 = type1Selector.value;
    type_2 = type2Selector.value;
    generation = genSelector.value;
    statusText.innerHTML = "Status: Searching...";
    getRandomPokemon();
}

//toggles the shiny sprite on/off
//works no matter the gender selected
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

//switches the form being displayed
function switchForm() {
    prevName = pokemon.name;
    let index = formSelector.value;
    let url = pokemon.forms[index].pokemon.url;
    pokemon.sprites = [];
    resetDiv(typesDiv);
    resetDiv(movesDiv);
    getPokemonData(url);
}

//switches the pokemon gender being displayed
//if there is no difference, nothing happens
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

//gets data from .../pokemon/__
function getPokemonData(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedPokemon;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

//gets data from .../pokemon-species/__
function getSpeciesData(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedSpecies;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

//gets data from .../generation/__
function getDataByGeneration(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedByGen;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

//gets data from .../type/__
function getDataByType(url) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = dataLoadedByType;
    xhr.onerror = dataError;
    xhr.send();
}

//gets data from .../move/__
function getDataByMove(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoadedByMove;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

//loads the pokemon data and updates appropriate fields
function dataLoadedPokemon(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);

    //adds first 2-4 sprites to array
    pokemon.sprites.push(obj.sprites.front_default);
    pokemon.sprites.push(obj.sprites.front_shiny);
    if (pokemon.genderDiff) {
        pokemon.sprites.push(obj.sprites.front_female);
        pokemon.sprites.push(obj.sprites.front_shiny_female);
    }

    //sets the pokemon's types
    //if there is only 1 type, the 2nd is set to "None"
    pokemon.type1 = obj.types[0].type.name;
    pokemon.type2 = "None";
    if (obj.types.length > 1) {
        pokemon.type2 = obj.types[1].type.name;
    }

    //gets the data for each move the pokemon has
    for (let move of obj.moves) {
        getDataByMove(move.move.url);
    }
    setTimeout(() => { displayContent(); }, 100);
    statusText.innerHTML = "Status: Found!";
}

//loads the species data and updates fields
function dataLoadedSpecies(e) {
    let xhr = e.target;

    //if the pokemon isn't found, let the user know and return
    if (xhr.responseText == "Not Found") {
        statusText.innerHTML = `Error: No Pokemon found with name "${pokemon.name}"`;
        return;
    }

    //reset all the pokemon's properties 
    resetPokemon();
    let obj = JSON.parse(xhr.responseText);

    //sets the pokemon's name and stores it locally
    pokemon.name = obj.name;
    localStorage.setItem(NameKey, pokemon.name);

    pokemon.number = obj.pokedex_numbers[0].entry_number;
    pokemon.forms = obj.varieties.slice();
    pokemon.genderDiff = obj.has_gender_differences;
    pokemon.gen = obj.generation.url[obj.generation.url.length - 2];
    pokemon.descriptions = getEnglishDescriptions(obj.flavor_text_entries);
    pokemon.nickname = "The " + getEnglishNickname(obj.genera);

    //chooses a random form of the pokemon to get
    let varIndex = 0;
    if (obj.varieties.length > 1 && (type_1 == "any" && type_2 == "any" && gen == "any")) {
        varIndex = getRandomInt(0, obj.varieties.length);
    }
    getPokemonData(obj.varieties[varIndex].pokemon.url);
}

//loads the move data and updates appropriate fields
function dataLoadedByMove(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);

    //creates a new move object and adds it to the pokemon's array
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

//loads the pokemon in the given generation
//used to randomly generate a pokemon
function dataLoadedByGen(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);
    let pokemonInGen = [];
    let urls = [];
    let viable = [];

    //gets the urls of each pokemon in the gen
    for (let poke of obj.pokemon_species) {
        pokemonInGen.push(poke.name);
        urls.push(poke.url);
    }

    //gets a completely random pokemon from the gen
    //only goes if no types specified
    if (type_1 == "any" && type_2 == "any") {
        getRandomURL(urls);
        return;
    }

    //if only one type is specified, gets all pokemon in that array
    //gets a random pokemon from that array
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

    //if both types are specified, gets pokemon in both type array
    //gets a random pokemon from that array
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
}

//gets a random url from the given array
function getRandomURL(viable) {
    //if there are no pokemon in the array and no gen is specified, check another gen
    //if gen is specified, tell the user that no pokemon could be found
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

    //reset the unused gens & url
    unusedGens = Gens.slice();
    let url = "";

    //gets a random url from the array if there are multiple elements
    //if there is only one, that's the url
    //if there are multiple, it goes until it gets a pokemon different from the last
    if (viable.length > 1) {
        while (url == previous || url == "") {
            url = viable[getRandomInt(0, viable.length - 1)];
        }

    } else { url = viable[0]; }

    //if the pokemon is the same as the last, get a new one
    if (url == previous) {
        getRandomPokemon();
        return;
    }

    //sets the new pokemon to be the previous
    previous = url;
    getSpeciesData(url);
}

//loads the pokemon in a given type
function dataLoadedByType(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);
    let pokemonInType = [];
    let duplicates = [];

    //gets rid of duplicate pokemon
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

//logs if there is an error getting data
function dataError(e) {
    console.log("An error occurred");
}

//gets a random pokemon from the filters
function getRandomPokemon() {
    let numFetching = 0;

    //gets a random gen if "any" is chosen
    //removes the gen from the unused gens array
    if (genSelector.value == "any") {
        let index = getRandomInt(0, unusedGens.length - 1);
        generation = unusedGens[index];
        unusedGens.splice(index, 1);
    }


    //get the pokemon in the type specified if not already got
    if (type_1 != "any") {
        let index = Types.indexOf(type_1) - 1;
        if (typesArrays[index] == null) {
            currentType = index;
            numFetching++;
            getDataByType(`${PokeURL}type/${type_1}/`);
        }
    }
    if (type_2 != "any") {
        let index = Types.indexOf(type_2) - 1;
        if (typesArrays[index] == null) {
            currentType = index;
            numFetching++;
            getDataByType(`${PokeURL}type/${type_2}/`);
        }
    }

    if (numFetching > 0) {
        //waits for the pokemon in each specified type to be grabbed
        setTimeout(() => { getRandomPokemon(); }, 120 * numFetching);
    } else {
        getDataByGeneration(`${PokeURL}/generation/${generation}/`);
    }
}

//gets a random integer value
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//resets the pokemon objects properties
//also resets the divs with children added by code
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

//deletes all children of an element
function resetDiv(div) {
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

//gets all the descriptions that are in english from a given array
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

//gets the first english nickname from a given array
function getEnglishNickname(all) {
    for (let name of all) {
        if (name.language.name == "en") {
            return (name.genus);
        }
    }
}

//fixes text that looks ugly from the API
function fixSentence(string) {
    string = string.replace(/\u000c/g, " ");
    string = string.replace(/\n/g, " ");
    string = string.replace(pokemon.name.toUpperCase(), capitalizeFirstLetter(pokemon.name));
    string = string.replace("POKéMON", "Pokémon");
    return string;
}

//displays the information within the content section
function displayContent() {
    displayTypes();
    nameDisplay.innerHTML = fixPokemonName(pokemon.name);
    numDisplay.innerHTML = `Pokédex #${pokemon.number}`
    genDisplay.innerHTML = `Generation ${Numerals[pokemon.gen]}`;
    nicknameDisplay.innerHTML = pokemon.nickname;
    description.innerHTML = `"${pokemon.descriptions[0]}"`;
    displayMoves();

    //adds the different forms to the selector if the species is different
    if (prevName != pokemon.name) {
        for (let i = 0; i < pokemon.forms.length; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.innerHTML = fixPokemonName(pokemon.forms[i].pokemon.name);
            formSelector.appendChild(option);
        }
    }

    //sets the sprite to shiny if selected
    let spriteIndex = 0;
    if (document.querySelector("#shiny").checked) {
        spriteIndex = 1;
    }
    sprite.src = pokemon.sprites[spriteIndex];
    changeGender();
}

//creates divs for each move and appends it to the moves div
//each div contains all the necessarry information to be displayed
function displayMoves() {
    for (let i = 0; i < pokemon.moves.length; i++) {
        let box = document.createElement("div");
        box.className = "move";
        box.style.backgroundColor = "#" + BackColors[Types.indexOf(pokemon.moves[i].type) - 1];
        let nameBox = document.createElement("div");
        nameBox.innerHTML = fixMoveName(pokemon.moves[i].name);
        nameBox.className = "moveName";
        box.appendChild(nameBox);
        let first = document.createElement("div");
        first.className = "first";
        let second = document.createElement("div");
        second.className = "second";
        let descBox = document.createElement("div");
        descBox.innerHTML = pokemon.moves[i].description;
        descBox.className = "moveDesc";
        let catBox = document.createElement("div");
        catBox.innerHTML = "Category: " + capitalizeFirstLetter(pokemon.moves[i].class);
        catBox.className = "moveClass";
        first.appendChild(catBox);
        let typeBox = document.createElement("div");
        typeBox.innerHTML = "Type: " + capitalizeFirstLetter(pokemon.moves[i].type);
        typeBox.className = "moveType";
        first.appendChild(typeBox);
        let powBox = document.createElement("div");
        if (pokemon.moves[i].power == null) {
            pokemon.moves[i].power = "-";
        }
        powBox.innerHTML = "Power: " + pokemon.moves[i].power;
        powBox.className = "movePower";
        second.appendChild(powBox);
        let accBox = document.createElement("div");
        if (pokemon.moves[i].accuracy == null) {
            pokemon.moves[i].accuracy = "-";
        }
        accBox.innerHTML = "Accuracy: " + pokemon.moves[i].accuracy;
        accBox.className = "moveAcc";
        second.appendChild(accBox);
        let ppBox = document.createElement("div");
        ppBox.innerHTML = "PP: " + pokemon.moves[i].pp;
        ppBox.class = "movePP";
        second.appendChild(ppBox);
        box.appendChild(first);
        box.appendChild(descBox);
        box.appendChild(second);
        movesDiv.appendChild(box);
        if (i < pokemon.moves.length - 1) {
            box.style.borderBottom = "2px solid black"
        }
    }
}

//displays the appropriate type images for the pokemon's types
function displayTypes() {
    typesDiv.appendChild(typeText);
    typeText.innerHTML = "Type:";
    typesDiv.appendChild(typeImgs[Types.indexOf(pokemon.type1) - 1]);
    if (pokemon.type2 != "None") {
        typesDiv.appendChild(typeImgs[Types.indexOf(pokemon.type2) - 1]);
        typeText.innerHTML = "Types:";
    }
}

//capitalizes the first letter in a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//removes any dashes in a move's name 
//capitalizes the first letter of each word in the move's name
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

//adjusts the search term to play nice with the API
//makes it so users don't need to use dashes for pokemon with spaces in their names
function fixSearchTerm(term) {
    term = term.trim();
    term = term.toLowerCase();
    term = term.replace(".", "");
    term = term.replace(" ", "-");
    return term;
}

//makes the pokemon name more presentable
function fixPokemonName(string) {
    let arr = string.split("-");

    //special cases since they have periods in their names
    if (string == "mr-mime" || string == "mr-rime") {
        return ("Mr. " + capitalizeFirstLetter(arr[1]));
    }
    if (string == "mr-mime-galar") {
        return ("Mr. Mime Galar");
    }

    //capitalizes first letter of each word
    //gives spaces/dashes to appropriate names 
    let name = "";
    for (let sub of arr) {
        name += capitalizeFirstLetter(sub) + " ";
    }
    name = name.trim();
    if (OnlyDashedPokemon.includes(string)) {
        name = name.replace(" ", "-");
    }

    //makes regional variants look nicer
    if (string.includes("alola")) {
        name = name.replace(" Alola", "");
        name = "Alolan " + name;
    } else if (string.includes("galar")) {
        name = name.replace(" Galar", "");
        name = "Galarian " + name;
    } else if (string.includes("hisui")) {
        name = name.replace(" Hisui", "");
        name = "Hisuian " + name;
    } else if (string.includes("paldea")) {
        name = name.replace(" Paldea", "");
        name = "Paldean " + name;
    }

    return (name);
}