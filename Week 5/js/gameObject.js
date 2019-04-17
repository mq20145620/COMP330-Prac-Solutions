"use strict";

class GameObject {

    constructor() {
        this._parent = null;
        this._children = [];

        // this object's transformation relative to its parent
        this.translation = [0,0];
        this.rotation = 0;
        this.scale = 1;
    }

    /**
     * Use a getter/setter to handle bookkeeping when the parent is reset
     */

    get parent() {
        return this._parent;
    }
    
    set parent(p) {
        if (this._parent !== null) {
            // remove it from its existing parent
            let index = this._parent._children.indexOf(this);
            this._parent._children.slice(index, 1);
        }

        // connect it to its new parent
        this._parent = p;        

        if (p !== null) {
            // add it to the new parent
            p._children.push(this);
        }
    }


    render(gl, worldMatrixUniform, colourUniform, matrix) {
        check(isContext(gl), isUniformLocation(worldMatrixUniform, colourUniform));

        // set up coordinate frame
        matrix = Matrix.multiply(matrix, Matrix.translation(this.translation[0], this.translation[1]));
        matrix = Matrix.multiply(matrix, Matrix.rotation(this.rotation));
        matrix = Matrix.multiply(matrix, Matrix.scale(this.scale, this.scale));

        gl.uniformMatrix3fv(worldMatrixUniform, false, matrix);

        // render self
        if (this.renderSelf !== undefined) {
            this.renderSelf(gl, colourUniform);
        }
        
        // recurisvely render children
        for (let i = 0; i < this._children.length; i++) {
            this._children[i].render(gl, worldMatrixUniform, colourUniform, matrix);
        }
    }
}

