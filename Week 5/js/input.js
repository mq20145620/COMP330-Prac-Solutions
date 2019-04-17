"use strict";

/**
 * Input manager.
 * 
 * This class listens for keydown and keyup events to keep track of whether the arrow keys are currently pressed.
 * 
 * Usage:
 * 
 * if (Input.leftPressed) {
 *     // the left arrow is pressed
 * }
 */

const InputClass = function() {
    const input = this;

    input.leftPressed = false;
    input.rightPressed = false;
    input.upPressed = false;
    input.downPressed = false;

    input.onKeyDown = function(event) {
        switch (event.key) {
            case "ArrowLeft": 
                input.leftPressed = true;
                break;

            case "ArrowRight": 
                input.rightPressed = true;
                break;

            case "ArrowDown":
                input.downPressed = true;
                break;

            case "ArrowUp":
                input.upPressed = true;
                break;
        }
    }

    input.onKeyUp = function(event) {
        switch (event.key) {
            case "ArrowLeft": 
                input.leftPressed = false;
                break;

            case "ArrowRight": 
                input.rightPressed = false;
                break;

            case "ArrowDown":
                input.downPressed = false;
                break;

            case "ArrowUp":
                input.upPressed = false;
                break;
        }
    }

    document.addEventListener("keydown", input.onKeyDown);
    document.addEventListener("keyup", input.onKeyUp);

}

// global inputManager variable
const Input = new InputClass();