var welcometext = document.getElementById("Willkommen");
const textArray =["Hallo, Kollege!", "Wie geht's?", "Na?", "Schnöner Tag heute!", "WAS BIN ICH????"];

welcometext.addEventListener("click", changeText)

function changeText(event){
    welcometext.innerHTML = textArray[getRandomInt(textArray.length)];
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


var button = document.getElementById("fertigButton");
var list = document.getElementById("Personenliste");
button.addEventListener("click", addPerson);

function addPerson(event){
    var namefield = document.getElementById("nameField");
    var agefield = document.getElementById("ageField");

    var p = new Person(namefield.value, agefield.value);

    var newPerson = document.createElement("li");
    newPerson.innerHTML = p.Name + ", " + p.Age;

    list.appendChild(newPerson);

    namefield.value = "";
    agefield.value = "";
}


class Person {
    constructor(name, age){
        this.name = name;
        this.age =  age;
    }

    get Name(){
        return this.name;
    }

    get Age(){
        return this.age;
    }
}

var buttonimg = document.getElementById("buttonvis");
buttonimg.addEventListener("click", togglevis);

function togglevis(event) {
    var pic = document.getElementById("picturevis");
    if (pic.style.visibility === "hidden") {
        pic.style.visibility = "visible";
    } else {
        pic.style.visibility = "hidden";
    }
}