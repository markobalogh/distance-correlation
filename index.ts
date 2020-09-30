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
    
}

class SymmetricMap {
    private map: Map<[number, number], number> = new Map();

    constructor(public dimension: number) {}

    has(key: [number, number]) {
        return this.map.has(key) || this.map.has([key[1], key[0]]);
    }

    get(key: [number, number]) {
        if (this.map.has(key)) {
            return this.map.get(key);
        } else if (this.map.has([key[1], key[0]])) {
            return this.map.get([key[1], key[0]]);
        } else {
            return null;
        }
    }

    set(key: [number, number], value: number) {
        this.map.set(key, value);
    }
}

