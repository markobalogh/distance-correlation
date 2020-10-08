import { distanceCorrelation } from './index';

let length = 100;
let x = new Array(length);
let y = new Array(length);
for (let i = 0; i < length; i++) {
    x[i] = Math.random();
    y[i] = Math.random();
}

let startTime = Date.now();
console.log(distanceCorrelation(x, y, false));
console.log(`Computing the distance correlation for ${length} points took ${Date.now() - startTime} ms.`);

// Results: 10 seconds for 100 points, 100 seconds for 200 points.

//Results after storing grand means: 474 ms for 100 points, 4 seconds for 200 points

//Results after storing grand means, column means, and row means: 39 ms for 100 points, 89 ms for 200 points.
//500 points in 357 ms
//1000 points in 1.3s
//2000 points in 6.6s
//5000 points in 76 seconds.

//Results after lazy-computing the distance matrix instead of storing it:
// 100 points in 16 milliseconds.
// 200 points in 22 milliseconds.
// 500 points in 41 milliseconds.
// 1000 points in 50 milliseconds.
// 2000 points in 89 milliseconds.
// 5000 points in 319 milliseconds.
// 10000 points in 1084 milliseconds.
// 20000 points in 3983 milliseconds.
// 100000 points in 106 seconds.