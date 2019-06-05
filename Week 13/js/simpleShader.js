"use strict";

class SimpleShader extends Shader {
    constructor(gl) {
        const vertexShaderSource = `
        attribute vec4 a_position;
        uniform mat4 u_worldMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_projectionMatrix;

        void main() {
            gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * a_position;
        }
        `;

        const fragmentShaderSource = `
        precision mediump float;
        uniform vec4 u_colour;

        void main() {
            // set colour
            gl_FragColor = u_colour; 
        }
        `;

        super(gl, vertexShaderSource, fragmentShaderSource);

    }
}