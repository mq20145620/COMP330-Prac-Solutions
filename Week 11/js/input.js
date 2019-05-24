"use strict";

class Input {
    constructor() {
        this.keyPressed = {};

        this.mouseClicked = false;
        this.mouseClickedPos = null;
        this.wheelDelta = 0;

        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
        document.addEventListener("mousedown", this.onMouseDown.bind(this))
        document.addEventListener("wheel", this.onWheel.bind(this))
    }

    clear() {
        this.mouseClicked = false;
        this.wheelDelta = 0;
    }

    onKeyDown(event) {
        this.keyPressed[event.code] = true;
    }

    onKeyUp(event) {
        this.keyPressed[event.code] = false;
    }

    onMouseDown(event) {
        this.mouseClicked = true;
        this.mouseClickedPos = new Float32Array([event.clientX, event.clientY]);
    }

    onWheel(event) {
        this.wheelDelta = Math.sign(event.deltaY);
    }
}

const inputManager = new Input();