"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distanceCorrelation = void 0;
/**
 * Set precomputeDistanceMatrix to false to reduce memory requirements, which otherwise are O(n^2) where n is the length of x and y.
 */
function distanceCorrelation(x, y, precomputeDistanceMatrix = true) {
    if (x.length !== y.length) {
        throw new Error('X and Y must have the same length.');
    }
    let xDistance = function (j, k) {
        return Math.abs(x[j] - x[k]);
    };
    let yDistance = function (j, k) {
        return Math.abs(y[j] - y[k]);
    };
    let A_jk;
    let B_jk;
    if (precomputeDistanceMatrix) {
        let xDistanceMatrix = new SymmetricMap(x.length);
        let yDistanceMatrix = new SymmetricMap(y.length);
        for (let j = 0; j < x.length; j++) {
            for (let k = j; k < x.length; k++) {
                xDistanceMatrix.set([j, k], xDistance(j, k));
                yDistanceMatrix.set([j, k], yDistance(j, k));
            }
        }
        let rowMean = function (matrix, rowIndex) {
            let count = 0;
            for (let i = 0; i < matrix.dimension; i++) {
                count += matrix.get([rowIndex, i]);
            }
            return count / matrix.dimension;
        };
        let columnMean = function (matrix, columnIndex) {
            let count = 0;
            for (let i = 0; i < matrix.dimension; i++) {
                count += matrix.get([i, columnIndex]);
            }
            return count / matrix.dimension;
        };
        let grandMean = function (matrix) {
            //mean of all elements in the distance matrix
            //can calculate mean of upper left half of matrix due to symmetry; diagonals must be zero.
            let count = 0;
            for (let i = 0; i < matrix.dimension; i++) {
                for (let j = i + 1; j < matrix.dimension; j++) {
                    count += matrix.get([i, j]);
                }
            }
            return (count * 2) / (matrix.dimension * matrix.dimension);
        };
        let xGrandMean = grandMean(xDistanceMatrix);
        let yGrandMean = grandMean(yDistanceMatrix);
        let xRowMeans = new Array(x.length);
        let yRowMeans = new Array(y.length);
        let xColumnMeans = new Array(x.length);
        let yColumnsMeans = new Array(y.length);
        for (let i = 0; i < x.length; i++) {
            xRowMeans[i] = rowMean(xDistanceMatrix, i);
            xColumnMeans[i] = columnMean(xDistanceMatrix, i);
        }
        for (let i = 0; i < y.length; i++) {
            yRowMeans[i] = rowMean(yDistanceMatrix, i);
            yColumnsMeans[i] = columnMean(yDistanceMatrix, i);
        }
        A_jk = function (j, k) {
            return xDistanceMatrix.get([j, k]) - xRowMeans[j] - xColumnMeans[k] + xGrandMean;
        };
        B_jk = function (j, k) {
            return yDistanceMatrix.get([j, k]) - yRowMeans[j] - yColumnsMeans[k] + yGrandMean;
        };
    }
    else {
        let rowMean = function (xOrY, rowIndex) {
            let count = 0;
            for (let i = 0; i < xOrY.length; i++) {
                count += Math.abs(xOrY[rowIndex] - xOrY[i]);
            }
            return count / xOrY.length;
        };
        let columnMean = function (xOrY, columnIndex) {
            let count = 0;
            for (let i = 0; i < xOrY.length; i++) {
                count += Math.abs(xOrY[i] - xOrY[columnIndex]);
            }
            return count / xOrY.length;
        };
        let xRowMeans = new Array(x.length);
        let yRowMeans = new Array(y.length);
        let xColumnMeans = new Array(x.length);
        let yColumnsMeans = new Array(y.length);
        for (let i = 0; i < x.length; i++) {
            xRowMeans[i] = rowMean(x, i);
            xColumnMeans[i] = columnMean(x, i);
        }
        for (let i = 0; i < y.length; i++) {
            yRowMeans[i] = rowMean(y, i);
            yColumnsMeans[i] = columnMean(y, i);
        }
        let grandMean = function (xOrY) {
            //mean of all elements in the distance matrix
            //can calculate as mean of rowMeans.
            let count = 0;
            if (xOrY === 'x') {
                for (let i = 0; i < x.length; i++) {
                    count += xRowMeans[i];
                }
                return count / x.length;
            }
            else {
                for (let i = 0; i < x.length; i++) {
                    count += yRowMeans[i];
                }
                return count / y.length;
            }
        };
        let xGrandMean = grandMean('x');
        let yGrandMean = grandMean('y');
        A_jk = function (j, k) {
            return Math.abs(x[j] - x[k]) - xRowMeans[j] - xColumnMeans[k] + xGrandMean;
        };
        B_jk = function (j, k) {
            return Math.abs(y[j] - y[k]) - yRowMeans[j] - yColumnsMeans[k] + yGrandMean;
        };
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
exports.distanceCorrelation = distanceCorrelation;
class SymmetricMap {
    constructor(dimension) {
        this.dimension = dimension;
        this.map = new Map();
    }
    has(key) {
        var _a, _b;
        return (this.map.has(key[0]) && ((_a = this.map.get(key[0])) === null || _a === void 0 ? void 0 : _a.has(key[1]))) || (this.map.has(key[1]) && ((_b = this.map.get(key[1])) === null || _b === void 0 ? void 0 : _b.has(key[0])));
    }
    get(key) {
        var _a, _b, _c, _d;
        if ((this.map.has(key[0]) && ((_a = this.map.get(key[0])) === null || _a === void 0 ? void 0 : _a.has(key[1])))) {
            return (_b = this.map.get(key[0])) === null || _b === void 0 ? void 0 : _b.get(key[1]);
        }
        else if ((this.map.has(key[1]) && ((_c = this.map.get(key[1])) === null || _c === void 0 ? void 0 : _c.has(key[0])))) {
            return (_d = this.map.get(key[1])) === null || _d === void 0 ? void 0 : _d.get(key[0]);
        }
        else
            return null;
    }
    set(key, value) {
        var _a;
        if (this.map.has(key[0])) {
            (_a = this.map.get(key[0])) === null || _a === void 0 ? void 0 : _a.set(key[1], value);
        }
        else {
            let newMap = new Map();
            newMap.set(key[1], value);
            this.map.set(key[0], newMap);
        }
    }
}
//# sourceMappingURL=index.js.map