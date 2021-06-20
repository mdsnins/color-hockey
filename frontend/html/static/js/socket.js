const URL = "http://localhost:3000";
const socket = io(URL);

const userlistCtx = $("#user_list");

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

socket.on("error", (msg) => {
    alert(msg);
})

function connect(username) {
    socket.emit("register", username);
}

