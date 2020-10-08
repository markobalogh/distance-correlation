/**
 * Set precomputeDistanceMatrix to false to reduce memory requirements, which otherwise are O(n^2) where n is the length of x and y.
 */
export function distanceCorrelation(x: number[], y: number[], precomputeDistanceMatrix = false): number {
    if (x.length !== y.length) {
        throw new Error('X and Y must have the same length.');
    }


    let xDistance = function (j: number, k: number):number {
        return Math.abs(x[j] - x[k]);
    }

    let yDistance = function (j: number, k: number): number {
        return Math.abs(y[j] - y[k]);
    }
    let A_jk: Function;
    let B_jk: Function;
    if (precomputeDistanceMatrix) {
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
                for (let j = i + 1; j < matrix.dimension; j++) {
                    count += matrix.get([i, j]) as number;
                }
            }
            return (count * 2) / (matrix.dimension * matrix.dimension);
        }

        let xGrandMean = grandMean(xDistanceMatrix);
        let yGrandMean = grandMean(yDistanceMatrix);

        let xRowMeans = new Array<number>(x.length);
        let yRowMeans = new Array<number>(y.length);
        let xColumnMeans = new Array<number>(x.length);
        let yColumnsMeans = new Array<number>(y.length);
        for (let i = 0; i < x.length; i++) {
            xRowMeans[i] = rowMean(xDistanceMatrix, i);
            xColumnMeans[i] = columnMean(xDistanceMatrix, i);
        }
        for (let i = 0; i < y.length; i++) {
            yRowMeans[i] = rowMean(yDistanceMatrix, i);
            yColumnsMeans[i] = columnMean(yDistanceMatrix, i);
        }

        A_jk = function (j: number, k: number): number {
            return (xDistanceMatrix.get([j, k]) as number) - xRowMeans[j] - xColumnMeans[k] + xGrandMean;
        }

        B_jk = function (j: number, k: number): number {
            return (yDistanceMatrix.get([j, k]) as number) - yRowMeans[j] - yColumnsMeans[k] + yGrandMean;
        }
    } else {
        let rowMean = function (xOrY:number[], rowIndex: number) {
            let count = 0;
            for (let i = 0; i < xOrY.length; i++) {
                count += Math.abs(xOrY[rowIndex] - xOrY[i]);
            }
            return count / xOrY.length;
        }

        let columnMean = function (xOrY:number[], columnIndex: number) {
            let count = 0;
            for (let i = 0; i < xOrY.length; i++) {
                count += Math.abs(xOrY[i] - xOrY[columnIndex]) as number;
            }
            return count / xOrY.length;
        }

        let xRowMeans = new Array<number>(x.length);
        let yRowMeans = new Array<number>(y.length);
        let xColumnMeans = new Array<number>(x.length);
        let yColumnsMeans = new Array<number>(y.length);
        for (let i = 0; i < x.length; i++) {
            xRowMeans[i] = rowMean(x, i);
            xColumnMeans[i] = columnMean(x, i);
        }
        for (let i = 0; i < y.length; i++) {
            yRowMeans[i] = rowMean(y, i);
            yColumnsMeans[i] = columnMean(y, i);
        }

        let grandMean = function (xOrY:'x'|'y') {
            //mean of all elements in the distance matrix
            //can calculate as mean of rowMeans.
            let count = 0;
            if (xOrY === 'x') {
                for (let i = 0; i < x.length; i++) {
                    count += xRowMeans[i];
                }
                return count / x.length;
            } else {
                for (let i = 0; i < x.length; i++) {
                    count += yRowMeans[i];
                }
                return count / y.length;
            }
        }

        let xGrandMean = grandMean('x');
        let yGrandMean = grandMean('y');


        A_jk = function (j: number, k: number): number {
            return Math.abs(x[j]-x[k]) - xRowMeans[j] - xColumnMeans[k] + xGrandMean;
        }

        B_jk = function (j: number, k: number): number {
            return Math.abs(y[j]-y[k]) - yRowMeans[j] - yColumnsMeans[k] + yGrandMean;
        }
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
