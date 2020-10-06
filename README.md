# Distance Correlation 

This is a naive implementation of distance correlation in TypeScript.

**It's clean, easy to use, runs in node or a browser, and has no dependencies.**

## Why use distance correlation?
It's basically what Pearson's correlation coefficient `r` always dreamed of being, but never could achieve.

https://en.wikipedia.org/wiki/Distance_correlation

## Installation

`npm install distance-correlation`

## Usage 

This package exports a single function with the following call signature: 

`function distanceCorrelation(x:number[], y:number[]):number`

That means that the function accepts two arrays of numbers and returns a number.

`import {distanceCorrelation} from 'distance-correlation';`


`let x = [1,2,3,4];`

`let y = [1,2,3,4];`

`console.log(distanceCorrelation(x,y));`

`1`