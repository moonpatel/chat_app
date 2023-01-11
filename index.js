const express = require("express");
const { join } = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { writeFile } = require("fs/promises");
const io = new Server(server, {});
let rooms = require("./rooms.json").rooms;

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
});

app.post("/chat", (req, res) => {
    console.log(req.body.username, "connected");
    res.redirect("/rooms");
});

app.post("/rooms/join", (req, res) => {
    if (req.body.room) {
        if (rooms.includes(req.body.room)) {
            res.redirect("/chat/" + req.body.room);
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
});

app.post("/rooms/create", async (req, res) => {
    if (req.body.newRoom) {
        await addRoom(req.body.newRoom);
        res.redirect("/chat/" + req.body.newRoom);
    } else {
        res.redirect("/");
    }
});

app.get("/rooms", (req, res) => {
    res.sendFile(join(__dirname, "room.html"));
});

app.get("/chat/:room", (req, res) => {
    if (rooms.includes(req.params.room)) {
        res.sendFile(join(__dirname, "chat.html"));
    } else {
        res.redirect("/");
    }
});

io.on("connection", (socket) => {
    console.log("A user connected");
    console.log(socket.rooms);
    socket.on("chat", ({ type, from, value, color, room }) => {
        if (!socket.rooms.has(room)) {
            console.log("yaya");
            socket.join(room);
        }
        socket.to(room).emit("chat", { type, from, value, color, room });
    });
});

server.listen(4000, () => {
    console.log("Listening on port 4000");
});

async function addRoom(name) {
    rooms.push(name);
    await writeFile("rooms.json", JSON.stringify(rooms));
}
