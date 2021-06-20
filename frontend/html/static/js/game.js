const ls = window.localStorage;
let game_map = [];
let opponent = '';
let score_host = 0;
let score_op = 0;

function getUser() {
    return ls.getItem("user_name") || '';
}

function setUser(name) {
    ls.setItem("user_name", name);
}

function addUser(ctx, user) {
    if(user.ingame)
        return;

    ctx.append(`
    <div class="col-md-8 u_${user.id}" >
        <p>
            <strong>${user.username}</strong>
            <br />
            <small>Win: ${user.win} | Lose: ${user.lose}</small>
        </p>
    </div>
    <div class="col-md-4 u_${user.id}">
        <button class="btn btn-primary battle" data-id="${user.id}">Battle!</button>
    </div>
    `);
}

function deleteUser(user) {
    console.log(user);
    $(`.u_${user}`).remove();
}

function listUser(ctx, userlist) { 
    userlist.forEach(el => {
        addUser(ctx, el);
    });
}

function profile(my) {
    $("#u_name").text(my.username);
    $("#u_win").text(my.win);
    $("#u_lose").text(my.lose);
}

function showInvitation(data) {
    $("#b_user").text(data.user.name);
    $("#b_accept").data("id", data.user.host);
    $("#g_inv").show('slow');
}

function sendInvitation(sock, userid) {
    sock.emit("req game", {
        "opponent":  userid,
        "score": 10,
    });
    opponent = userid;
    player_type = "host";
}

function acceptInvitation(sock, userid) {
    sock.emit("accept game", {
        "host": userid
    });
    opponent = userid;
    player_type = "op";
}

function loadMap(map) {
    document.getElementById("editor").contentWindow.postMessage(map, "*");
}

function saveMap(sock, map) {
    sock.emit("save map", map);
}

function setMap(map) {
    try {
        game_map = JSON.parse(map) || [];
    } catch {
        game_map = [];
    }
}


function randRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

function physics_callback() {
    socket.emit("game", JSON.stringify(PhysicalWorld));
}

function physics_end(winner) {
    socket.emit("end game", {
        p1: player_type == "host" ? socket.id : opponent,
        p2: player_type == "host" ? opponent : socket.id,
        win: winner
    });
}

function loadGame(p) {
    p.setup = function () {
        p.createCanvas(800, 400);

        PhysicalWorld = [];
        puck = new Puck(100);
        puck.color = "red";
        puck.position = new Vector(25, 25);
        puck.acceleration = new Vector(0, 0);
        puck.elastic_coeff = 1;
        puck.speed = new Vector(0.01, 0.01);
        PhysicalWorld.push(puck);

        p1 =  new PhysicalObject(100);
        p1.color = Colors[randRange(0, 4)];
        p1.shape = Shapes.LINE;
        p1.position = new Vector(0, 0);
        p1.pos_extra = new Vector(0, 400);
        PhysicalWorld.push(p1);
        p1 =  new PhysicalObject(100);
        p1.color = Colors[randRange(0, 4)];
        p1.shape = Shapes.LINE;
        p1.position = new Vector(800, 0);
        p1.pos_extra = new Vector(800, 400);
        PhysicalWorld.push(p1);
        p1 =  new PhysicalObject(100);
        p1.color = Colors[randRange(0, 4)];
        p1.shape = Shapes.LINE;
        p1.position = new Vector(0, 0);
        p1.pos_extra = new Vector(800, 0);
        PhysicalWorld.push(p1);
        p1 =  new PhysicalObject(100);
        p1.color = Colors[randRange(0, 4)];
        p1.shape = Shapes.LINE;
        p1.position = new Vector(0, 400);
        p1.pos_extra = new Vector(800, 400);
        PhysicalWorld.push(p1);  /* */

        player_host = new PhysicalObject(100);
        player_host.color = "black";
        player_host.shape = Shapes.LINE;
        player_host.position = new Vector(30, 160);
        player_host.pos_extra = new Vector(30, 240);
        PhysicalWorld.push(player_host);

        player_op = new PhysicalObject(100);
        player_op.color = "black";
        player_op.shape = Shapes.LINE;
        player_op.position = new Vector(770, 160);
        player_op.pos_extra = new Vector(770, 240);
        PhysicalWorld.push(player_op);
        

        game_map.forEach((el) => {
            if(el.type == "Line") {
                p1 = new PhysicalObject(100);
                p1.color = Colors[randRange(0, 4)];
                p1.shape = Shapes.LINE;
                if(el.pos[0].x <= el.pos[1].x) {
                    p1.position = new Vector(el.pos[0].x, el.pos[0].y);
                    p1.pos_extra = new Vector(el.pos[1].x, el.pos[1].y);
                }
                else {
                    p1.position = new Vector(el.pos[1].x, el.pos[1].y);
                    p1.pos_extra = new Vector(el.pos[0].x, el.pos[0].y);
                }
                PhysicalWorld.push(p1);
            }
            if(el.type == "Polygon") {
                for(let i=1; i<el.pos.length; i++) {
                    p1 = new PhysicalObject(100);
                    p1.color = Colors[randRange(0, 4)];
                    p1.shape = Shapes.LINE;

                    if(el.pos[i-1].x <= el.pos[i].x) {
                        p1.position = new Vector(el.pos[i-1].x, el.pos[i-1].y);
                        p1.pos_extra = new Vector(el.pos[i].x, el.pos[i].y);
                    }
                    else {
                        p1.position = new Vector(el.pos[i].x, el.pos[i].y);
                        p1.pos_extra = new Vector(el.pos[i-1].x, el.pos[i-1].y);
                    }
                    PhysicalWorld.push(p1);
                }
            }
        });
    }

    p.draw = function () {
        p.background('white');

        p.fill('white');
        
        p.translate(0, 400); 
        p.scale(1, -1);

        p.rect(0, 0, 800, 400);

        control = player_type == "host" ? PhysicalWorld[5] : PhysicalWorld[6];
        if(p.keyIsDown(p.UP_ARROW)) {
            control.position.y += 5;
            control.pos_extra.y += 5;
            if(player_type == "op")
                update(JSON.stringify(control));
        }
        if(p.keyIsDown(p.DOWN_ARROW)) {
            control.position.y -= 5;
            control.pos_extra.y -= 5;
            if(player_type == "op")
                update(JSON.stringify(control));
        }

        PhysicalWorld.forEach((el) => {
            if(el.shape == Shapes.LINE) {
                p.stroke(el.color);
                p.strokeWeight(7.5);
                p.line(el.position.x, el.position.y, el.pos_extra.x, el.pos_extra.y);
            }
            else if (el.shape == Shapes.CIRCLE) {
                p.fill(el.color);
                p.noStroke();
                p.circle(el.position.x, el.position.y, 2 * el.pos_extra);
            }
        })
    }
}