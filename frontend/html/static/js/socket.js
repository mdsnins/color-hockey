const URL = "http://localhost:3000";
const socket = io(URL);

const userlistCtx = $("#user_list");
let player_type = "host";

socket.on("list user", (users) => {
    userlistCtx.empty();
    listUser(userlistCtx, users);
});

socket.on("new user", (user) => {
    addUser(userlistCtx, user);
})

socket.on("delete user", (user) => {
    deleteUser(user);
})

socket.on("profile", (user) => {
    profile(user);
})

socket.on("invite game", (data) => {
    showInvitation(data);
});

socket.on("start game", (data) => {
    if(player_type == "host")
        physics_run = true;
    else
        physics_run = false;
    score_host = 0;
    score_op = 0;
    setMap(data.game.map || "");
    run_game();
})

socket.on("saved map", (data) => {
    console.log(data);
    loadMap(data);
});

socket.on("map update", (data) => {
    PhysicalWorld = JSON.parse(data);
});

socket.on("update physics", (data) => {
    PhysicalWorld = JSON.parse(data);
});

socket.on("opponent move", (data) => {
    console.log(data);
    PhysicalWorld[6] = JSON.parse(data);
})

socket.on("error", (msg) => {
    alert(msg);
})

function connect(username) {
    socket.emit("register", username);
}

function update(new_pos) {
    socket.emit("move", new_pos);
}