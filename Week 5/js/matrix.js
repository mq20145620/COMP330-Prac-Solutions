"use strict";

class Matrix {

    // NOTE: matrices are written in homogeneous coordinates, in column order: [i0, i1, 0, j0, j1, j2, 0, T0, T1, 1]

    // Matrices are represented as Float32Arrays for ease of passing to GLSL
    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array

    // Example use, to compose translation, rotation and scale matrices, then apply to point p and vector v:
    //
    // let matrix = Matrix.identity();
    // matrix = Matrix.multiply(matrix, Matrix.translation(dx,dy));
    // matrix = Matrix.multiply(matrix, Matrix.rotation(angle));
    // matrix = Matrix.multiply(matrix, Matrix.scale(sx,sy));
    //
    // let p = new Float32Array([px,py,1]);     // convert point to homogenenous coordinates
    // p = Matrix.multiplyVector(matrix, p);    // apply matrix to transform
    //
    // let v = new Float32Array([vx,vy,0]);     // convert vector to homogenenous coordinates
    // v = Matrix.multiplyVector(matrix, v);    // apply matrix to transform

    // The identity matrix
    static identity() {
        return new Float32Array([ 
        //  i       j       T
            1,0,0,  0,1,0,  0,0,1
        ]);
    }

    // Translate by (dx,dy)
    static translation(dx, dy) {
        check(isNumber(dx, dy));

        return new Float32Array([
            //  i       j       T
            1,0,0,  0,1,0,  dx,dy,1
        ]);
    }

    // Rotate by angle (in radians)
    static rotation(angle) {
        check(isNumber(angle));

        const c = Math.cos(angle);
        const s = Math.sin(angle);

        return new Float32Array([
            //  i       j       T
            c,s,0,  -s,c,0,  0,0,1
        ]);
    }

    // Scale axes by (sx,sy)
    static scale(sx, sy) {
        check(isNumber(sx, sy));

        return new Float32Array([
        //  i        j        T
            sx,0,0,  0,sy,0,  0,0,1
        ]);
    }

    // Multiply two matrices and return the result
    static multiply(a, b) {
        check(isMat3(a, b));

        let m = new Float32Array(9); // initially all zeros

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    m[i + 3*j] += a[i + 3*k] * b[k+3*j];
                }
            }
        }

        return m;
    }



    // Multiply a vector by a matrix, and return the result
    static multiplyVector(m, v) {
        check(isMat3(m), isVec3(v));

        let v2 = new Float32Array(3);   //initially all zeros

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                v2[j] += m[3*i + j] * v[i];
            }
        }

        return v2;
    }

}

