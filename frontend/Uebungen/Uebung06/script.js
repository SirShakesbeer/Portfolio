let welcometext = document.getElementById("Willkommen");
const textArray = ["Hallo, Kollege!", "Wie geht's?", "Na?", "Schöner Tag heute!", "WAS BIN ICH????"];

welcometext.addEventListener("click", () => {
    welcometext.innerHTML = textArray[getRandomInt(textArray.length)];
});

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

let timerIntervalCalc;
document.getElementById('startCalc').addEventListener('click', () => {
    const webworker = new Worker('worker.js');
    let milliseconds = 0;

    document.getElementById('timerCalc').innerText = (milliseconds / 1000).toFixed(3);
    timerIntervalCalc = setInterval(() => {
        milliseconds += 10;
        document.getElementById('timerCalc').innerText = (milliseconds / 1000).toFixed(3);
    }, 10);

    const numberfield = document.getElementById("numberfield");
    webworker.postMessage({ task: 'calculate', number: numberfield.value });

    webworker.onmessage = (e) => {
        clearInterval(timerIntervalCalc);
        document.getElementById('resultCalc').innerText = e.data.result;
    };
});

let timerIntervalSort;
document.getElementById('startSort').addEventListener('click', () => {
    const webworker = new Worker('worker.js');
    let milliseconds = 0;

    document.getElementById('timerSort').innerText = (milliseconds / 1000).toFixed(3);
    timerIntervalSort = setInterval(() => {
        milliseconds += 10;
        document.getElementById('timerSort').innerText = (milliseconds / 1000).toFixed(3);
    }, 10);

    let SortArray = [];
    for (let i = 0; i < 6; i++) {
        const id = "numberfield" + i;
        SortArray[i] = parseFloat(document.getElementById(id).value) || 0;
    }

    webworker.postMessage({ task: 'sort', arr: SortArray });

    webworker.onmessage = (e) => {
        clearInterval(timerIntervalSort);
        document.getElementById('resultSort').innerText = e.data.result.join(', ');
    };
});

const lowerBound = document.querySelector('#lower');
const upperBound = document.querySelector('#upper');
const calculate = document.querySelector('#calculate');
const result = document.querySelector('#result');

if (!!window.Worker) {
    const rangeWorker = new Worker('worker.js');

    calculate.addEventListener('click', () => {
        document.getElementById("loading").style.display = 'block';

        rangeWorker.postMessage({ task: 'rangeSum', lower: lowerBound.value, upper: upperBound.value });
        console.log('[script.js] - Message posted to worker.js');
    });

    rangeWorker.onmessage = (e) => {
        document.getElementById("loading").style.display = 'none';
        result.textContent = e.data;
        console.log('[script.js] - Message received from worker.js');
    };
}