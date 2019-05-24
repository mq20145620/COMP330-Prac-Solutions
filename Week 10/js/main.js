"use strict";

// Shader code

// 3) Add a_colour attribute to the vertex shader
//    Add v_colour varying to pass colours to fragments

const vertexShaderSource = `
attribute vec4 a_position;
attribute vec3 a_colour;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec3 v_colour;

void main() {
    // send colour to fragment shader (interpolated)
    v_colour = a_colour;
    gl_Position = u_projectionMatrix *u_viewMatrix * u_worldMatrix * a_position;
}
`;

// 3c) Set fragment colour to interpolated v_colour

const fragmentShaderSource = `
precision mediump float;
varying vec3 v_colour;

void main() {
    // set colour
    gl_FragColor = vec4(v_colour, 1); 
}
`;

function createShader(gl, type, source) {
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

function resize(canvas) {
    const resolution = window.devicePixelRatio || 1.0;

    const displayWidth = Math.floor(canvas.clientWidth * resolution);
    const displayHeight = Math.floor(canvas.clientHeight * resolution);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        return true;
    }
    else {
        return false;
    }    
}


function main() {

    // === Initialisation ===

    // Get the canvas element & gl rendering context
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }

    // 1) Enable depth testing and back-face culling
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program =  createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Initialise the shader attributes & uniforms
    const shader = {
        program: program
    };

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
    
    // Initialise the position attribute

    // Construct the objects

    let plane = new Plane(gl, 20);
    plane.scale = [10,10,10];

    let pyramids = [];
    pyramids.push(new Pyramid(gl));
    pyramids[0].rotation = [0, glMatrix.glMatrix.toRadian(60), 0];
    pyramids[0].scale = [0.5,0.5,0.5];

    pyramids.push(new Pyramid(gl));
    pyramids[1].position = [2, 0, 3];
    pyramids[1].rotation = [0, 0, 0];
    pyramids[1].scale = [0.4,0.4,0.4];

    pyramids.push(new Pyramid(gl));
    pyramids[2].position = [-1, 0, 2];
    pyramids[2].rotation = [0, glMatrix.glMatrix.toRadian(20), 0];
    pyramids[2].scale = [0.5,0.5,0.5];


    // === Per Frame Operations

    // animation loop
    let oldTime = 0;
    let animate = function(time) {
        time = time / 1000;
        let deltaTime = time - oldTime;
        oldTime = time;

        resize(canvas);
        update(deltaTime);
        render();

        requestAnimationFrame(animate);
    };

    let cameraDist = 3;
    let cameraAngle = 0;
    let cameraHeight = 1;
    let cameraPos = [3, 1, 0];
    const cameraRotationSpeed = 2 * Math.PI / 120;
    // update objects in the scene
    let update = function(deltaTime) {
        cameraAngle += cameraRotationSpeed * deltaTime;
        cameraPos = [cameraDist * Math.cos(cameraAngle), cameraHeight, cameraDist * Math.sin(cameraAngle)];
    };

    // create the matrices once, to avoid garbage collection
    const projectionMatrix = glMatrix.mat4.create();
    const viewMatrix = glMatrix.mat4.create();

    // redraw the scene
    let render = function() {
        // clear the screen
        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 4) clear the depth buffer
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // calculate the projection matrix
        {
            const aspect = canvas.width / canvas.height;
            const fovy = glMatrix.glMatrix.toRadian(60);
            const near = 0.1;
            const far = 10;

            glMatrix.mat4.perspective(projectionMatrix, fovy, aspect, near, far);
            gl.uniformMatrix4fv(shader["u_projectionMatrix"], false, projectionMatrix);
        }
        
        // calculate the view matrix
        {
            const eye = cameraPos;
            const center = plane.position;
            const up = [0, 1, 0];

            glMatrix.mat4.lookAt(viewMatrix, eye, center, up);
            gl.uniformMatrix4fv(shader["u_viewMatrix"], false, viewMatrix);
        }

        // render the plane
        plane.render(gl, shader);

        for (let i = 0; i < pyramids.length; i++) {
            pyramids[i].render(gl, shader);
        }
    };
    
    // start it going
    animate(0);

}