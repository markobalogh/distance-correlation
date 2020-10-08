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
    let A_jk: Function;
    let B_jk: Function;
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