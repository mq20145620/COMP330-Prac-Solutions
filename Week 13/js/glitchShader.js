"use strict";

class GlitchShader extends Shader {

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
        uniform float u_time;

        varying vec2 v_texcoord;

        void main() {
            // calculate one pixel size in UVs
            vec2 p = vec2(1.0 / float(u_width), 1.0 / float(u_height));

            // sample the green and blue pixels from further towards the edges of the screen
            // to simulate beam misalignment
            vec2 uvr = v_texcoord;             
            vec2 uvg = (v_texcoord - vec2(0.5, 0.5)) * (1.0 + 5.0 * length(p)) + vec2(0.5,0.5) ;
            vec2 uvb = (v_texcoord - vec2(0.5, 0.5)) * (1.0 + 10.0 * length(p)) + vec2(0.5,0.5) ;

            float r = texture2D(u_texture, uvr).r;
            float g = texture2D(u_texture, uvg).g;
            float b = texture2D(u_texture, uvb).b;

            gl_FragColor = vec4(r,g,b,1.0);
        }
        `;

        super(gl, vertexShaderSource, fragmentShaderSource);

    }


}