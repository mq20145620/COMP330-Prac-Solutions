class Snake {

    // initialisation
    constructor() {
        this.position = [0,0];
        this.rotation = 0;
        this.speed = 5;
        this.length = 0;
        this.maxLength = 5;
        this.width = 0.5;
        this.body = [0,this.width/2,0,-this.width/2];
        this.segmentLength = [];
    }

    // update the snake on each frame
    update(deltaTime) {
        check(isNumber(deltaTime));

        // rotate the head

        if (Input.leftPressed) {
            this.rotation = Math.PI;
        }
        else if (Input.rightPressed) {
            this.rotation = 0;
        }
        else if (Input.upPressed) {
            this.rotation = Math.PI/2;
        }
        else if (Input.downPressed) {
            this.rotation = 3*Math.PI/2;
        }

        // copy the old position
        let oldX = this.position[0];
        let oldY = this.position[1];

        // move in the current direction
        this.position[0] += Math.cos(this.rotation) * this.speed * deltaTime;
        this.position[1] += Math.sin(this.rotation) * this.speed * deltaTime;

        // get the tangent vector (normalised)
        let dx = this.position[0] - oldX;
        let dy = this.position[1] - oldY;
        const dd = Math.sqrt(dx * dx + dy * dy);
        dx /= dd;
        dy /= dd;
        
        // compute the normal vector
        let nx = dy;
        let ny = -dx;

        // add this vector to create points on the left and rignt
        let lx = this.position[0] + nx * this.width / 2;
        let ly = this.position[1] + ny * this.width / 2;
        let rx = this.position[0] - nx * this.width / 2;
        let ry = this.position[1] - ny * this.width / 2;

        // add these points to the body
        this.body.push(lx, ly, rx, ry);       
        
        // keep track of the length of the body (measured in seconds)
        this.segmentLength.push(deltaTime);    
        this.length +=  deltaTime;

        // prune if necessary
        while (this.length > this.maxLength) {
            // remove the points from the tail
            this.body.shift();
            this.body.shift();
            this.body.shift();
            this.body.shift();

            // decrease the length
            this.length -= this.segmentLength.shift();
        }


    }

    // draw the snake
    render(gl, worldMatrixUniform, colorUniform) {
        check(isContext(gl), isUniformLocation(worldMatrixUniform, colorUniform));
 
         // set the uniforms
         let matrix = Matrix.trs(this.position[0], this.position[1], this.rotation, 1, 1);
         gl.uniformMatrix3fv(worldMatrixUniform, false, matrix);
         gl.uniform4fv(colorUniform, [0,0.75,0,1]);

         // draw the head
         const head = new Float32Array([0,-0.5, 0,0.5, 1,0]);
         gl.bufferData(gl.ARRAY_BUFFER, head, gl.STATIC_DRAW);
         gl.drawArrays(gl.TRIANGLES, 0, head.length / 2);   

        // set the uniforms
        gl.uniformMatrix3fv(worldMatrixUniform, false, Matrix.identity());
        gl.uniform4fv(colorUniform, [0,0.75,0,1]);
         
         // draw the body
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.body), gl.STATIC_DRAW);
         gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.body.length / 2);   

    }

}