const ls = window.localStorage;

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
    })
}


function acceptInvitation(sock, userid) {
    sock.emit("accept game", {
        "host": userid
    });
}

