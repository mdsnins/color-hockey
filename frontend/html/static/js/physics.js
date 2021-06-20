/*
p1 = new PhysicalObject(100);
p1.color = 2;
p1.position = new Vector(0, 0)
p1.pos_extra = new Vector(1000, 1000)
p2 = new PhysicalObject(100);
p2.position = new Vector(100, 75);
p2.pos_extra = 30;
p1.shape = Shapes.LINE;
p2.shape = Shapes.CIRCLE;

*/
// Physical Engine for Color Hockey
let physics_run = false;
const Shapes = {
    DOT: 0,
    LINE: 1,
    CIRCLE: 2,
}

const Colors = [
    "red",
    "green",
    "blue",
    "yellow",
    "white",
    "black"
]

class Vector {
    x; y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class PhysicalObject {
    mass;
    color;
    position;
    pos_extra;
    /* 
        Extra should be indicate
        - Another point in Vector class when shape is Shapes.LINE, the leftest point should be in `position`
        - Radius in float value when shape is Shapes.CIRCLE
     */
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
    pos_extra = 25;
    constructor(mass) {
        super(mass);
    }
}

//Global Variables;

let PhysicalWorld = Array();  //All physical objects should be registered here
const PhysicalFreq = 10;        //Physical matter update frequency
const PhysicalDt = 1000 / PhysicalFreq;

function registerPhysicalObject(physObj) {
    PhysicalWorld.push(physObj);
}

function unregisterPhysicalObject(physObj) {
    let index = PhysicalWorld.indexOf(physObj);
    if(index > -1)
        PhysicalWorld.splice(index, 1);
}

function dist(pos1, pos2) {
    let dx = pos1.x - pos2.x;
    let dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function line2equation(pos1, pos2) {
    //return a, b, c when equation is ax + by = c
    return {
        a: pos2.y - pos1.y,
        b: - pos2.x + pos1.x, 
        c: (pos2.x - pos1.x) * pos1.y - (pos2.y - pos1.y) * pos1.x
    }
}


function collideHorizontal(physObj) {
    //Implementation of collision of fixed vertical wall and physical object
    physObj.speed.x = -physObj.speed.x * physObj.elastic_coeff;
}

function collideVertical(physObj) {
    //Implementation of collision of fixed horizontal wall and physical object
    physObj.speed.y = -physObj.speed.y * physObj.elastic_coeff;
}

function collideObjects(physObj1, physObj2) {
    //We assume all collision between two objects are elastic collision
    if(physObj1.shape > physObj2.shape) {
        collideObjects(physObj2, physObj1)  // To ensure physObj1.shape < physObj2.shape
        return 0;
    }

    if(!isCollision(physObj1, physObj2))
        return -1;
    console.log("hi?"); 
    //Assume physObj1 = LINE, physObj2 = CIRCLE (Puck)
    let l = line2equation(physObj1.position, physObj1.pos_extra);

    if(l.a == 0) {
        collideVertical(physObj2);
        if(physObj1.color != "black")
            physObj2.color = physObj1.color;
        return 0;
    }
    else if (l.b == 0) {
        collideHorizontal(physObj2);
        if(physObj1.color != "black")
            physObj2.color = physObj1.color;
        return 0;
    }

    let m1 = -l.a/l.b;
    let m2 = physObj2.speed.y / physObj2.speed.x;

    if(m1 * m2 == -1) { //perpendicular
        physObj2.acceleration.y = -physObj2.acceleration.y;
        physObj2.acceleration.x = -physObj2.acceleration.x;
        physObj2.speed.x = -physObj2.speed.x * physObj2.elastic_coeff;
        physObj2.speed.y = -physObj2.speed.y * physObj2.elastic_coeff;

        if(physObj1.color != "black")
            physObj2.color = physObj1.color;
        return 0;
    }

    let theta = (m2 - m1) / (1 + m1 * m2);
    theta = Math.atan(theta);
}

function isCollision(physObj1, physObj2) {
    if(physObj1.shape > physObj2.shape)
        return isCollision(physObj2, physObj1)  // To ensure physObj1.shape < physObj2.shape
    
    if(physObj1.shape == Shapes.DOT) {
        if (physObj2.shape == Shapes.DOT) {
            return physObj1.position.x == physObj2.position.x
                && physObj1.position.y == physObj2.position.y
        }
        else if (physObj2.shape == Shapes.LINE) {
            // ax + by = c
            let l = line2equation(phys2Obj.position, phys2Obj.pos_extra);
            return l.a * physObj1.position.x + l.b * physObj1.position.y == l.c;
        }
        else if (physObj2.shape == Shapes.CIRCLE) {
            return dist(physObj1.position, physObj2.position) <= physObj2.pos_extra
        }
    }
    else if (physObj1.shape == Shapes.LINE) {
        if (physObj2.shape == Shapes.LINE) {
            //Find two equation of lines
            let l1 = line2equation(physObj1.position, physObj1.pos_extra);
            let l2 = line2equation(physObj2.position, physObj2.pos_extra);

            if (l1.a / l2.a == l1.b / l2.b)
                return false;
            
            //Find a value of y of solution
            let y = (l2.a * l1.c - l1.a * l2.c) / (l2.a * l1.b - l1.a * l2.b);
            return (physObj1.position.y - y) * (physObj1.pos_extra.y - y) < 0;
        }
        else if (physObj2.shape == Shapes.CIRCLE) {
            let l1 = line2equation(physObj1.position, physObj1.pos_extra);
            let l2 = {a: l1.b, b: -l1.a}    //perpendicular line of given line which passes the center of circle
            l2.c = l2.a * physObj2.position.x + l2.b * physObj2.position.y;
            //Find a position of perpendicular foot
            
            let x = - (l1.b * l2.c - l1.c * l2.b) / (l1.a * l2.b - l1.b * l2.a);
            let y = - (-l1.a * x + l1.c) / l1.b;
            if(l1.b == 0) {
               x = physObj1.position.x;
               y = physObj2.position.y;
            }
            
            let pol = (physObj1.position.y - y) * (physObj1.pos_extra.y - y) <= 0;   //perpendicular foot on line or not
            console.log(pol, physObj2.position, x, y, dist(new Vector(x, y), physObj2.position));
            if (pol) {
                return dist(new Vector(x, y), physObj2.position) <= physObj2.pos_extra;
            }

            return dist(physObj1.position, physObj2.position) <= physObj2.pos_extra
                || dist(physObj1.pos_extra, physObj2.position) <= physObj2.pos_extra;

        }
    }
    else if (physObj.shape == Shapes.CIRCLE) {
        if (physObj2.shape == Shapes.CIRCLE) {
            return dist(physObj1.position, physObj2.position) <= physObj1.pos_extra + physObj2.pos_extra
        }
    }

}

// Register global functions
function updatePhysicalWorld() {
    if(!physics_run)
        return;
    PhysicalWorld.forEach(obj => {
        try {
        obj.position.x += obj.speed.x * PhysicalDt;
        obj.position.y += obj.speed.y * PhysicalDt;
        } catch {}

        try {
        obj.speed.x *= friction;
        obj.speed.y *= friction;
        } catch {}

        try {
            obj.speed.x += obj.acceleration.x * PhysicalDt;
            obj.speed.y += obj.acceleration.y * PhysicalDt;
        } catch {}
    });

    for(let j = 1; j < PhysicalWorld.length; j++) {
        collideObjects(PhysicalWorld[0], PhysicalWorld[j]);
    }

    if(isCollision(PhysicalWorld[0], PhysicalWorld[1]) && PhysicalWorld[0].color == PhysicalWorld[1].color)
        score_op++;

    if(isCollision(PhysicalWorld[0], PhysicalWorld[2]) && PhysicalWorld[0].color == PhysicalWorld[1].color)
        score_host++;
    
    if(score_op == 10) {
        physics_end(2);
    }
    else if (score_host == 10) {
        physics_end(1);
    }

    physics_callback();
}

function updateColor() {
    for(let i=1; i<PhysicalWorld.length; i++) {
        if(PhysicalWorld[i].color == "black") continue;
        PhysicalWorld[i].color = Colors[randRange(0, 4)];
    }
}

setInterval(updatePhysicalWorld, 1000/PhysicalDt); //Register interval
setInterval(updateColor, 5000);