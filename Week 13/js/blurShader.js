"use strict";

class BlurShader extends Shader {

    constructor(gl) {
        const vertexShaderSource = `
        attribute vec4 a_position;
        attribute vec2 a_texcoord;

        varying vec2 v_texcoord;

        void main() {
            v_texcoord = a_texcoord;
            gl_Position = a_position;
        }
        `;

        const fragmentShaderSource = `
        precision mediump float;

        uniform sampler2D u_texture;
        uniform int u_width;
        uniform int u_height;

        varying vec2 v_texcoord;

        void main() {
            vec4 c = texture2D(u_texture, v_texcoord);

            gl_FragColor = c;
        }
        `;

        super(gl, vertexShaderSource, fragmentShaderSource);

    }


}