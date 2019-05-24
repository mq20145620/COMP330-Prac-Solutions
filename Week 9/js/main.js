"use strict";

// Shader code

const vertexShaderSource = `
attribute vec4 a_position;
attribute vec4 a_colour;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec4 v_colour;
varying vec4 v_position;

void main() {
    v_position = a_position;
    v_colour = a_colour;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * a_position;
}
`;

const fragmentShaderSource = `
precision mediump float;
uniform vec2 u_stripeDir;
uniform float u_time;
varying vec4 v_colour;
varying vec4 v_position;

void main() {
    vec2 s = normalize(u_stripeDir);
    vec2 v = v_position.xy - dot(v_position.xy, s) * s;
    vec3 colour = normalize(v_colour.rgb) * cos(length(v) * 50.0 - u_time * 10.0);
    gl_FragColor = vec4(colour, 1); 
}
`;

function createShader(gl, type, source) {
    check(isContext(gl), isString(source));

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    check(isContext(gl), isShader(vertexShader, fragmentShader));

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function main() {

    // === Initialisation ===

    // turn off antialiasing
    const contextParameters =  {};
    
    // get the canvas element & gl rendering 
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl", contextParameters);
    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }

    // enable depth testing and backface culling
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program =  createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Initialise the shader attributes & uniforms
    let shader = {};
    const nAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < nAttributes; i++) {
        const name = gl.getActiveAttrib(program, i).name;
        shader[name] = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(shader[name]);
    }

    const nUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < nUniforms; i++) {
        const name = gl.getActiveUniform(program, i).name;
        shader[name] = gl.getUniformLocation(program, name);
    }

    // Initialise the array buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let quad = [
        -1, -1, 0,
         1, -1, 0,
        -1,  1, 0,

         1,  1, 0,
        -1,  1, 0,
         1, -1, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW);

    const colourBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);

    let colours = [
         1, 0, 0,
         0, 1, 0,
         1, 0, 0,

         0, 1, 0,
         1, 0, 0,
         0, 1, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW);


    // === Per Frame operations ===

    let cameraRotation = [0,0,0]; // radians
    const cameraRotationSpeed = Math.PI * 2 / 10; // radians per second

    // update objects in the scene
    let update = function(deltaTime) {
        check(isNumber(deltaTime));

        if (Input.leftPressed) {
            // rotate about Y axis (heading)
            cameraRotation[1] += cameraRotationSpeed * deltaTime;
        }
        if (Input.rightPressed) {
            // rotate about Y axis (heading)
            cameraRotation[1] -= cameraRotationSpeed * deltaTime;
        }
        if (Input.upPressed) {
            // rotate about X axis (pitch)
            cameraRotation[0] += cameraRotationSpeed * deltaTime;
        }
        if (Input.downPressed) {
            // rotate about X axis (pitch)
            cameraRotation[0] -= cameraRotationSpeed * deltaTime;
        }
    };

    // allocate matrices
    const projectionMatrix = glMatrix.mat4.create();
    const viewMatrix = glMatrix.mat4.create();
    const worldMatrix = glMatrix.mat4.create();

    // redraw the scene
    let render = function() {
        // clear the screen and the depth buffer
        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // set up the projection matrix
        {
            const fovy = Math.PI / 2;
            const aspect = canvas.width / canvas.height;
            const near = 0.1;
            const far = 10;
            glMatrix.mat4.perspective(projectionMatrix, fovy, aspect, near, far);
            gl.uniformMatrix4fv(shader["u_projectionMatrix"], false, projectionMatrix);
        }

        // set up the view matrix
        {
            const offset = [0,0,-2];
            glMatrix.mat4.identity(viewMatrix);
            glMatrix.mat4.translate(viewMatrix, viewMatrix, offset);
            glMatrix.mat4.rotateX(viewMatrix, viewMatrix, cameraRotation[0]);
            glMatrix.mat4.rotateY(viewMatrix, viewMatrix, cameraRotation[1]);
            glMatrix.mat4.rotateZ(viewMatrix, viewMatrix, cameraRotation[2]);
            gl.uniformMatrix4fv(shader["u_viewMatrix"], false, viewMatrix);
        }

        // draw the quad
        {            
            const offset = [0,0,0];
            glMatrix.mat4.identity(worldMatrix);
            glMatrix.mat4.translate(worldMatrix, worldMatrix, offset);
            gl.uniformMatrix4fv(shader["u_worldMatrix"], false, worldMatrix);

            gl.uniform2fv(shader["u_stripeDir"], new Float32Array([1, 2]));
            gl.uniform1f(shader["u_time"], oldTime);

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(shader["a_position"], 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
            gl.vertexAttribPointer(shader["a_colour"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, quad.length / 3);       
        }
    };

    // animation loop
    let oldTime = 0;
    let animate = function(time) {
        check(isNumber(time));
        
        time = time / 1000;
        let deltaTime = time - oldTime;
        oldTime = time;

        update(deltaTime);
        render();

        requestAnimationFrame(animate);
    }

    // start it going
    animate(0);
}    

