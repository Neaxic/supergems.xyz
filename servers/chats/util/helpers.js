const globals = require("../util/globals");

const userWithoutSensitive = (user) => {
  return {
    name: user.name,
    // avatar: user.avatar,
    address: user.address,
    role: user.role,
    rep: user.rep,
    // stats: user.stats,
  };
};

const checkUserPermissionsRoom = (socket, roomCode) => {
  if (!roomCode || !socket || !socket.id) {
    return false;
  }

  if (globals.rooms[roomCode] && globals.rooms[roomCode].owner === socket.id) {
    return true;
  }

  if (globals.rooms[roomCode] && globals.rooms[roomCode].joiner === socket.id) {
    return true;
  }

  return false;
};

const isUserOwnerInRoom = (socket, roomCode) => {
  if (!roomCode || !socket || !socket.id) {
    return false;
  }

  if (globals.rooms[roomCode] && globals.rooms[roomCode].owner === socket.id) {
    return true;
  }

  return false;
}

const isRoomActive = (roomCode) => {
  if (!roomCode) {
    return false;
  }

  return globals.rooms[roomCode] && globals.rooms[roomCode].owner !== undefined;
}

function generateRoomCode() {
  // Generate a unique room code (e.g., 4-character alphanumeric string)
  return Math.random().toString(36).substring(2, 6);
}


module.exports = {
  userWithoutSensitive,
  checkUserPermissionsRoom,
  generateRoomCode,
  isUserOwnerInRoom,
  isRoomActive
};
