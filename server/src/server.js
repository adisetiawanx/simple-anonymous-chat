import Express from "express";
import { Server } from "socket.io";

const app = Express();

const expressServer = app.listen(5000, () => {
  console.info("Server is running on PORT 5000");
});

const UsersState = {
  users: [],
  setUsers: function (newUserArray) {
    this.users = newUserArray;
  },
};

const RoomsState = {
  rooms: [],
  setRooms: function (newUserArray) {
    this.rooms = newUserArray;
  },
};

const io = new Server(expressServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  socket.on("enterRoom", ({ name }) => {
    const availableRoom = getFreeRoom();

    const user = activeUser(socket.id, name);
    let room = null;

    if (!availableRoom) {
      const randomName = Math.floor(
        Date.now() + Math.random() * 10000
      ).toString();
      room = createNewRoom(user, randomName);
    } else {
      room = availableRoom;
      availableRoom.users.push(user);
    }

    socket.join(room.name);

    socket.emit(
      "message",
      sendMessage("sistem", `You have joined the ${room.name} chat room`)
    );

    socket.broadcast
      .to(room.name)
      .emit(
        "message",
        sendMessage("sistem", `${user.name} has joined the room`)
      );
  });

  socket.on("message", ({ text }) => {
    const user = getUser(socket.id);
    const room = getRoomByUser(socket.id);

    if (room) {
      io.to(room.name).emit("message", sendMessage(user.name, text));
    }
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    const room = getRoomByUser(socket.id);
    userLeavesApp(socket.id);
    clearRooms();
    console.info(RoomsState.rooms);

    if (room) {
      io.to(room.name).emit(
        "message",
        sendMessage("sistem", `${user.name} has left the room`)
      );
    }
  });
});

function activeUser(id, name) {
  const user = { id, name };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    user,
  ]);

  return user;
}

function userLeavesApp(id) {
  UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
}

function getUser(id) {
  return UsersState.users.find((user) => user.id === id);
}

function clearRooms() {
  RoomsState.setRooms([
    ...RoomsState.rooms.filter((room) => room.users.length !== 0),
  ]);
}

function createNewRoom(user, roomName) {
  const room = {
    name: roomName,
    users: [user],
  };

  RoomsState.setRooms([
    ...RoomsState.rooms.filter((room) => room.name !== roomName),
    room,
  ]);

  return room;
}

function getFreeRoom() {
  return RoomsState.rooms.find((room) => room.users.length === 1);
}

function getRoomByUser(userId) {
  return RoomsState.rooms.find((room) =>
    room.users.find((user) => user.id === userId)
  );
}

function sendMessage(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}
