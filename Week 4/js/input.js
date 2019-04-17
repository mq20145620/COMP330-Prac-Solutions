"use strict";

class Input {
    static leftPressed = false;
    static rightPressed = false;
    static upPressed = false;
    static downPressed = false;

    static onKeyDown(event) {
        switch (event.key) {
            case "ArrowLeft": 
                Input.leftPressed = true;
                break;

            case "ArrowRight": 
                Input.rightPressed = true;
                break;

            case "ArrowDown":
                Input.downPressed = true;
                break;

            case "ArrowUp":
                Input.upPressed = true;
                break;
        }
    }

    static onKeyUp(event) {
        switch (event.key) {
            case "ArrowLeft": 
                Input.leftPressed = false;
                break;

            case "ArrowRight": 
                Input.rightPressed = false;
                break;

            case "ArrowDown":
                Input.downPressed = false;
                break;

            case "ArrowUp":
                Input.upPressed = false;
                break;
        }
    }
}

// register event handlers

document.addEventListener("keydown", Input.onKeyDown);
document.addEventListener("keyup", Input.onKeyUp);
