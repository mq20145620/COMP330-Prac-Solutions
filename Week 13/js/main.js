"use strict";

// Shader code


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

// Load a texture from a URL or file location

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const image = new Image();
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border, srcFormat, srcType,
                    pixel);          

    // Loading images is asynchronous. This sets up a callback that is executed
    // when the image has loaded, to turn it into a texture.

    image.onload = function() {                
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);  
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    };

    image.src = url;      

    return texture;
}


function createFrameBuffer(gl, width, height) {
  
    // Step 1: Create a frame buffer object
    const frameBuffer = gl.createFramebuffer();
  
    // Step 2: Create and initialize a texture buffer to hold the colors.
    const colourBuffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, colourBuffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
                                    gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
    // Step 3: Attach the buffer to the frame buffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colourBuffer, 0);
  
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    // Step 4: Verify that the frame buffer is valid.
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("The created frame buffer is invalid: " + status.toString());
    }
  
    // Step 5: Unbind these new objects, which makes the default frame buffer the
    // target for rendering.
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
    return {
        frameBuffer: frameBuffer,
        colourBuffer: colourBuffer,
    };
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

    // Create the shaders

    const simpleShader = new SimpleShader(gl);
    const glitchShader = new GlitchShader(gl);
    
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

    // Create a quad for screen effects

    const quad = new Quad(gl);

    // Set up frame buffer

    let buffers = createFrameBuffer(gl, canvas.width, canvas.height);

    // test texture

    const testTexture = loadTexture(gl, "textures/test.png");

    // === Per Frame Operations

    // animation loop
    let oldTime = 0;
    let animate = function(time) {
        time = time / 1000;
        let deltaTime = time - oldTime;
        oldTime = time;

        if (resize(canvas)) {
            // resize the frame buffer
            buffers = createFrameBuffer(gl, canvas.width, canvas.height);
        }
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.frameBuffer);
        renderScene();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        renderScreenEffects();
    };
    
    let renderScene = function() {

        simpleShader.enable(gl);

        // clear the screen
        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // calculate the projection matrix
        {
            const aspect = canvas.width / canvas.height;
            const fovy = glMatrix.glMatrix.toRadian(60);
            const near = 0.1;
            const far = 10;

            glMatrix.mat4.perspective(projectionMatrix, fovy, aspect, near, far);
            gl.uniformMatrix4fv(simpleShader["u_projectionMatrix"], false, projectionMatrix);
        }
        
        // calculate the view matrix
        {
            const eye = cameraPos;
            const center = plane.position;
            const up = [0, 1, 0];

            glMatrix.mat4.lookAt(viewMatrix, eye, center, up);
            gl.uniformMatrix4fv(simpleShader["u_viewMatrix"], false, viewMatrix);
        }

        // render the plane
        plane.render(gl, simpleShader);

        for (let i = 0; i < pyramids.length; i++) {
            pyramids[i].render(gl, simpleShader);
        }     
        
        simpleShader.disable(gl);

    }

    let renderScreenEffects = function() {
        glitchShader.enable(gl);

        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, buffers.colourBuffer);
        gl.uniform1i(glitchShader["u_texture"], 0);    

        gl.uniform1i(glitchShader["u_width"], canvas.width);    
        gl.uniform1i(glitchShader["u_height"], canvas.height);    

        gl.uniform1f(glitchShader["u_time"], oldTime); 

        quad.render(gl, glitchShader);

        glitchShader.disable(gl);
    }

    // start it going
    animate(0);

}