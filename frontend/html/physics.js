// Physical Engine for Color Hockey
const Shapes = {
    DOT: 0,
    LINE: 1,
    CIRCLE: 2,
    POLYNOMIAL: 3,
}

class Vector {
    x; y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class PhysicalObject {
    mass;
    position;
    speed;
    acceleration;
    elastic_coeff = 1;
    shape = Shapes.DOT;
    constructor(mass) {
        this.mass = mass
    }
}

class Puck extends PhysicalObject{
    shape = Shapes.CIRCLE;
    radius;
    friction;
    constructor(mass) {
        this.mass = mass
    }
}

function collideHorizontal(physObj) {
    //Implementation of collision of fixed vertical wall and physical object
    physObj.acceleration.x = -physObj.acceleration.x;
    physObj.speed.x = -physObj.speed.x * physObj.eleastic_coeff;
}

function collideVertical(physObj) {
    //Implementation of collision of fixed horizontal wall and physical object
    physObj.acceleration.y = -physObj.acceleration.y;
    physObj.speed.y = -physObj.speed.y * physObj.eleastic_coeff;
}