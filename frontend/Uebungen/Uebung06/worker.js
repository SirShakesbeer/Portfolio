self.onmessage = (e) => {
    if (e.data.task === 'calculate') {
        const result = calculateLargeNumber(e.data.number);
        self.postMessage({ result });
    } else if (e.data.task === 'sort') {
        const result = SelectionSort(e.data.arr);
        self.postMessage({ result });
    } else if (e.data.task === 'rangeSum') {
        const lowerBound = parseInt(e.data.lower);
        const upperBound = parseInt(e.data.upper);

        let count = 0;
        let sum = 0;
        for (let i = lowerBound; i <= upperBound; i++) {
            if (i % 3 === 0 || i % 5 === 0) {
                count++;
                sum += i;
            }
        }

        const result = `There are ${count} multiples of 3 or 5 between ${lowerBound} and ${upperBound}. The sum of these numbers is ${sum}.`;
        self.postMessage(result);
    }
};

function calculateLargeNumber(n) {
    let summe = 0;
    for (let i = 0; i < n; i++) {
        summe += i * i + Math.random();
    }
    return summe;
}

function SelectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let min_idx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        let temp = arr[i];
        arr[i] = arr[min_idx];
        arr[min_idx] = temp;
    }
    return arr;
}