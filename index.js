const express = require("express");
const { join } = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { urlencoded } = require("body-parser");
const io = new Server(server, {});
let i = 1;

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
});
app.post("/chat", (req, res) => {
    console.log(req.body.username, "connected");
    const redirectTo = "/chat/room" + i;
    res.redirect(redirectTo);
});
app.get("/chat/:room", (req, res) => {
    res.sendFile(join(__dirname, "chat.html"));
});

io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("chat", ({ type, from, value, color }) => {
        socket.broadcast.emit("chat", { type, from, value, color });
    });
});

server.listen(4000, () => {
    console.log("Listening on port 4000");
});
