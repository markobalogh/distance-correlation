export function distanceCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length) {
        throw new Error('X and Y must have the same length.');
    }


    let xDistance = function (j: number, k: number):number {
        return Math.abs(x[j] - x[k]);
    }

    let yDistance = function (j: number, k: number): number {
        return Math.abs(y[j] - y[k]);
    }
    let xDistanceMatrix = new SymmetricMap(x.length);
    let yDistanceMatrix = new SymmetricMap(y.length);
    for (let j = 0; j < x.length; j++) {
        for (let k = j; k < x.length; k++) {
            xDistanceMatrix.set([j, k], xDistance(j, k));
            yDistanceMatrix.set([j, k], yDistance(j, k));
        }
    }

    let rowMean = function (matrix: SymmetricMap, rowIndex: number) {
        let count = 0;
        for (let i = 0; i < matrix.dimension; i++) {
            count += matrix.get([rowIndex, i]) as number;
        }
        return count / matrix.dimension;
    }

    let columnMean = function (matrix: SymmetricMap, columnIndex: number) {
        let count = 0;
        for (let i = 0; i < matrix.dimension; i++) {
            count += matrix.get([i, columnIndex]) as number;
        }
        return count / matrix.dimension;
    }

    let grandMean = function (matrix: SymmetricMap) {
        //mean of all elements in the distance matrix
        //can calculate mean of upper left half of matrix due to symmetry; diagonals must be zero.
        let count = 0;
        for (let i = 0; i < matrix.dimension; i++) {
            for (let j = i+1; j < matrix.dimension; j++) {
                count += matrix.get([i, j]) as number;
            }
        }
        return (count * 2) / (matrix.dimension * matrix.dimension);
    }

    let A_jk = function (j: number, k: number): number {
        return (xDistanceMatrix.get([j, k]) as number) - rowMean(xDistanceMatrix, j) - columnMean(xDistanceMatrix, k) + grandMean(xDistanceMatrix);
    }

    let B_jk = function (j: number, k: number): number {
        return (yDistanceMatrix.get([j, k]) as number) - rowMean(yDistanceMatrix, j) - columnMean(yDistanceMatrix, k) + grandMean(yDistanceMatrix);
    }

    let distanceCovariance = 0;
    for (let j = 0; j < x.length; j++) {
        for (let k = 0; k < y.length; k++) {
            distanceCovariance += A_jk(j, k) * B_jk(j, k);
        }
    }
    distanceCovariance = Math.sqrt(distanceCovariance / (x.length * x.length));

    let distanceVarianceX = 0;
    for (let j = 0; j < x.length; j++) {
        for (let k = 0; k < y.length; k++) {
            distanceVarianceX += A_jk(j, k) * A_jk(j, k);
        }
    }
    distanceVarianceX = Math.sqrt(distanceVarianceX / (x.length * x.length));

    let distanceVarianceY = 0;
    for (let j = 0; j < x.length; j++) {
        for (let k = 0; k < y.length; k++) {
            distanceVarianceY += B_jk(j, k) * B_jk(j, k);
        }
    }
    distanceVarianceY = Math.sqrt(distanceVarianceY / (x.length * x.length));
    return distanceCovariance / Math.sqrt(distanceVarianceX * distanceVarianceY);
}

class SymmetricMap {
    private map: Map<number, Map<number, number>> = new Map();

    constructor(public dimension: number) {}

    has(key: [number, number]) {
        return (this.map.has(key[0]) && this.map.get(key[0])?.has(key[1])) || (this.map.has(key[1]) && this.map.get(key[1])?.has(key[0]));
    }

    get(key: [number, number]) {
        if ((this.map.has(key[0]) && this.map.get(key[0])?.has(key[1]))) {
            return this.map.get(key[0])?.get(key[1]);
        } else if ((this.map.has(key[1]) && this.map.get(key[1])?.has(key[0]))) {
            return this.map.get(key[1])?.get(key[0]);
        } else return null;
    }

    set(key: [number, number], value: number) {
        if (this.map.has(key[0])) {
            this.map.get(key[0])?.set(key[1], value);
        } else {
            let newMap = new Map<number, number>();
            newMap.set(key[1], value);
            this.map.set(key[0], newMap);
        }
    }
}

let testX = [1, 2, 3, 4, 4.1];
let testY = [1, 2, 3.1, 4.7, 4.2];

console.log(distanceCorrelation(testX, testY));
