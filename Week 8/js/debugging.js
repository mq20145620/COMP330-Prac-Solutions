"use strict";

const DEBUG = true;

const newCheck = (DEBUG) ? function (f) {
    if (typeof f !== "function") {
        console.error("You need to pass a function which takes one argument.");
        return null;
    }
    else if (f.length !== 1) {
        console.error("Provided checking function does not have exactly one argument (It should also return a boolean).");
        return null;
    }
    else {
        return function (...args) {
            if (args.length === 0) {
                console.error("Function is called with no arguments (Must take 1 or more arguments).");
                return null;
            }
            else {
                for (let i = 0; i < args.length; i++) {
                    const argument = args[i];
                    const result = f(argument);
                    const type = typeof result;
                    if (type !== "boolean") {
                        console.error("Checking function argument " + i + " is not boolean, it is " + type + ", with value: " + result);
                        return null;
                    }
                    else if (!result) {
                        return false;
                    }
                }
                return true;
            }
        };
    }
} : function () { return function () {}; };

const check = (DEBUG) ? function (...args) {
    if (args.length === 0) {
        console.error("Function is called with no arguments (Must take 1 or more arguments).");
    }
    for (let i = 0; i < args.length; i++) {
        const argument = args[i];
        const type = typeof argument;
        if (type !== "boolean") {
            console.error("Check " + i + " is not boolean, it is " + type + ".");
        }
        else if (!argument) {
            console.error("Check " + i + " is false!");
        }
    }
} : function () {};

// JavaScript
const isBoolean = newCheck(function (b) {
    return typeof b === "boolean";
});
const isNull = newCheck(function (n) {
    return n === null;
});
const isUndefined = newCheck(function (u) {
    return u === undefined;
});
const isNumber = newCheck(function (x) {
    return typeof x === "number";
});
const isString = newCheck(function (s) {
    return typeof s === "string";
});
const isSymbol = newCheck(function (s) {
    return typeof s === "symbol";
});
const isObject = newCheck(function (o) {
    return typeof o === "object";
});
const isFunction = newCheck(function (f) {
    return typeof f === "function";
});
const isArray = newCheck(function (a) {
    return Array.isArray(a);
});

// Html
const isElement = newCheck(function (e) {
    return e instanceof HTMLElement;
});
const isCanvas = newCheck(function (c) {
    return c instanceof HTMLCanvasElement;
});

// WebGL
const isContext = newCheck(function (c) {
    return c instanceof WebGLRenderingContext;
});
const isProgram = newCheck(function (p) {
    return p instanceof WebGLProgram;
});
const isShader = newCheck(function (s) {
    return s instanceof WebGLShader;
});
const isBuffer = newCheck(function (b) {
    return b instanceof WebGLBuffer;
});
const isUniformLocation = newCheck(function (u) {
    return u instanceof WebGLUniformLocation;
});

// glMatrix
const isVec2 = newCheck(function (v) {
    return v instanceof Float32Array && v.length === 2;
});
const isVec3 = newCheck(function (v) {
    return v instanceof Float32Array && v.length === 3;
});
const isVec4 = newCheck(function (v) {
    return v instanceof Float32Array && v.length === 4;
});
const isMat2 = newCheck(function (m) {
    return m instanceof Float32Array && m.length === 4;
});
const isMat3 = newCheck(function (m) {
    return m instanceof Float32Array && m.length === 9;
});
const isMat4 = newCheck(function (m) {
    return m instanceof Float32Array && m.length === 16;
});
const isQuat = newCheck(function (q) {
    return q instanceof Float32Array && q.length === 4;
});
