"use strict";

class InputManager {

    constructor() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.upPressed = false;
        this.downPressed = false;    

        // there is a weird interaction between callbacks and class methods that leaves the
        // 'this' variable unbound. It can be solved by explicitly binding 'this' to 'this'
        // https://stackoverflow.com/questions/13996263/javascript-scope-addeventlistener-and-this

        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
        switch (event.key) {
            case "ArrowLeft": 
                this.leftPressed = true;
                break;

            case "ArrowRight": 
                this.rightPressed = true;
                break;

            case "ArrowDown":
                this.downPressed = true;
                break;

            case "ArrowUp":
                this.upPressed = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.key) {
            case "ArrowLeft": 
                this.leftPressed = false;
                break;

            case "ArrowRight": 
                this.rightPressed = false;
                break;

            case "ArrowDown":
                this.downPressed = false;
                break;

            case "ArrowUp":
                this.upPressed = false;
                break;
        }
    }
}

const Input = new InputManager();
