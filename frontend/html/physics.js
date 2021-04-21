// Physical Engine for Color Hockey

const Shapes = {
    DOT: 0,
    LINE: 1,
    CIRCLE: 2,
    POLYNOMIAL: 3,
}

class Vector {
    x, y;
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

