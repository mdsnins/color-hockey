const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
      origin: "http://localhost:5500",
    }
});

const players = {};

io.sockets.on("connection", (socket) => {
    console.log("Connected");

    socket.on('disconnect', function() {
        socket.broadcast.emit("delete user", socket.id);
     });
  

    socket.on("register", (username) => {
        players[socket.id] = socket;

        socket.valid = true;
        socket.username = username;
        socket.win = 0;
        socket.lose = 0;
        socket.room = {};

        const users = [];
        for (let [id, sock] of io.of("/").sockets) {
            if(sock.username == username && id != socket.id) {
                sock.valid = false;
                socket.win = sock.win;
                socket.lose = sock.lose;
                socket.room.map = sock.room.map;

                socket.broadcast.emit("delete user", id);
                continue;
            }
            if(id == socket.id) {
                continue;
            }
            users.push({
                id: id,
                username: sock.username,
                ingame: sock.ingame,
                win: sock.win,
                lose: sock.lose,
                rate: sock.win + sock.lose == 0 ? 0 : sock.win/(sock.win + sock.lose)
            });
        }



        socket.emit("list user", users);
        socket.emit("profile", {
            username: socket.username,
            win: socket.win,
            lose: socket.lose,
            rate: socket.win + socket.lose == 0 ? 0 : socket.win/(socket.win + socket.lose)
        });

        socket.broadcast.emit("new user", {
            id: socket.id,
            username: socket.username,
            ingame: socket.ingame,
            win: socket.win,
            lose: socket.lose,
            rate: socket.win + socket.lose == 0 ? 0 : socket.win/(socket.win + socket.lose)
        });

    });

    socket.on("req game", (game) => {
        console.log(game)
        let opponent = game.opponent;
        if (!socket.valid) {
            socket.emit("error", "auth error");
            return;
        }
        let op = players[opponent];
        
        if(typeof op == "undefined"){
            socket.emit("error", "no such user");
            return;
        }
        if(op.ingame) {
            socket.emit("error", `player ${op.username} is playing game`);
            return;
        }

        socket.room = {};
        socket.room.map = game.map;
        socket.room.score = game.score;

        op.emit("invite game", {
            "user": {
                "host": socket.id,
                "name": socket.username,
                "win": socket.win,
                "lose": socket.lose
            },
            "game": {
                "score": game.score
            }
        });
        socket.emit("msg", "Game request sent!");
    });

    socket.on("accept game", (game) => {
        let host = game.host;
        if (!socket.valid) {
            socket.emit("error", "auth error");
            return;
        }
        host = players[host];
        
        if(typeof host == "undefined"){
            socket.emit("error", "no such user");
            return;
        }
        if(host.ingame) {
            socket.emit("error", `player ${host.username} is playing game`);
            return;
        }

        socket.ingame = true;
        host.ingame = true;
        
        let data = {
            "game": {
                "score": host.room.score,
                "map": host.room.map
            }
        };
        
        socket.emit("start game", data);
        host.emit("start game", data);
    });

    socket.on("end game", (game) => {
        let p1 = game.p1, p2 = game.p2;
        if (!socket.valid) {
            socket.emit("error", "auth error");
            return;
        }

        p1 = players[p1], p2 = players[p2];
        if(typeof p1 == "undefined" || typeof p2 == "undefined"){
            socket.emit("error", "wrong request");
            return;
        }
        if(!p1.ingame || !p2.ingame) {
            socket.emit("error", `wrong request`);
            return;
        } 
        if(socket.id != p1.id && socket.id != p2.id) {
            socket.emit("error", `wrong request`);
            return;
        } 

        p1.ingame = false;
        p2.ingame = false;
        
        if(game.win == 1) {
            p1.win++;
            p2.lose++;
        }
        else {
            p2.win++;
            p1.lose++;
        }
    })

    socket.on("save map", (map) => {
        if (!socket.valid) {
            socket.emit("error", "auth error");
            return;
        }
        socket.room.map = map;        
    })
});

httpServer.listen(3000, () => {
    console.log('Connected at 3000');
});
  