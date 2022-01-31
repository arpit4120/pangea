const session = require("./sessionManagement");

myEmitter.on("new_post", (obj) => {
  let adminRoom = "user";
  console.log(obj);
  io.sockets.in(adminRoom).emit("new_post", obj);
});

setTimeout(() => {
  io.on("connection", (socket) => {
    socket.emit("news", { hello: "world" });
    socket.on("user_login", (data) => {
      data.headers = {};
      data.headers["access-token"] = data["access-token"];
      session
        .authTokenDetails(data)
        .then((user) => {
          let room;
          if (user) {
            console.log("A cirtain user has entered the premises");
            room = "user";
            console.log(room);
            socket.join(room);
            io.sockets
              .in(room)
              .emit("connectToRoom", {
                msg: "User Login success added to room " + room,
              });
          } else {
            throw "Invalid Login Creds";
          }
          // socket.to(room).emit('message',{msg:'something very funny happened this friday.Kansal fell into the well'});
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
}, 1000);
