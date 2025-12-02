const globals = require("../util/globals");
const { userWithoutSensitive, generateRoomCode, isRoomActive, checkUserPermissionsRoom, isUserOwnerInRoom } = require("../util/helpers");
const { generateSlug } = require("random-word-slugs");

const setupRoomRoutes = (io, socket, checkUserPermission) => {
    //Check if room exist / is valid
    socket.on('check-room', (roomCode) => {
        if (!checkUserPermission(socket, "checkRoom")) {
            socket.emit("error", { message: "Cant check room, missing permission" });
            return;
        }

        if (!roomCode) {
            return;
        }

        if (globals.rooms[roomCode]) {
            socket.emit('room-exists', globals.rooms[roomCode] !== undefined ? true : false);
        } else {
            socket.emit('room-exists', false);
        }
    });

    // Create a new room
    socket.on('create-room', () => {
        if (!checkUserPermission(socket, "createRoom")) {
            socket.emit("error", { message: "Cant create room, missing permission" });
            return;
        }

        const roomCode = generateSlug(3);
        globals.rooms[roomCode] = {
            owner: socket,
            ownerParsed: userWithoutSensitive(socket.user),
            joiner: undefined,
            joinerParsed: undefined,
            // users: [socket.id],
            // itemsArray: []
        };
        console.log(globals.rooms[roomCode]);
        socket.join(roomCode);
        socket.emit('room-created', roomCode);
    });

    // Join an existing room
    socket.on('join-room', (roomCode) => {
        if (!checkUserPermission(socket, "joinRoom")) {
            socket.emit("error", { message: "Cant join room, missing permission" });
            return;
        }

        if (globals.rooms[roomCode] && globals.rooms[roomCode].owner !== undefined && globals.rooms[roomCode].owner !== socket.id && globals.rooms[roomCode].joiner === undefined) {
            globals.rooms[roomCode].joiner = socket.id;
            globals.rooms[roomCode].joinerParsed = userWithoutSensitive(socket.user);
            socket.join(roomCode);
            socket.emit('user-joined', { otherUser: globals.rooms[roomCode].ownerParsed, roomId: roomCode });
            // globals.rooms[roomCode].owner.emit('user-joined', { otherUser: globals.rooms[roomCode].joinerParsed, roomId: roomCode });
            // socket.to(globals.rooms[roomCode].owner.id).emit('user-joined', { otherUser: globals.rooms[roomCode].joinerParsed, roomId: roomCode });
            io.to(globals.rooms[roomCode].owner.id).emit('user-joined', { otherUser: globals.rooms[roomCode].joinerParsed, roomId: roomCode });
            // io.to(globals.rooms[roomCode].owner).emit('user-joined', { otherUser: globals.rooms[roomCode].joinerParsed, roomId: roomCode });
            // io.to(roomCode).emit('user-joined', { otherUser: globals.rooms[roomCode].ownerParsed, roomId: roomCode });
        } else {
            socket.emit('error', 'Room is full or does not exist');
        }

        console.log(globals.rooms[roomCode]);
    });

    // Kick a user from the room
    socket.on('kick-user', (roomCode, userId) => {
        if (!roomCode || !userId) {
            return;
        }

        if (!isRoomActive(roomCode))
            return;

        if (!checkUserPermissionsRoom(socket, roomCode))
            return;

        if (isUserOwnerInRoom(socket, roomCode)) {
            const userIndex = globals.rooms[roomCode].users.indexOf(userId);
            if (userIndex !== -1) {
                globals.rooms[roomCode].users.splice(userIndex, 1);
                io.to(userId).emit('kicked-from-room');
                io.to(roomCode).emit('user-left', globals.rooms[roomCode].joinerParsed);
            }
        };
    });

    socket.on("party-lock", (roomCode, isLock) => {
        if (!roomCode || isLock === undefined) {
            socket.emit("error", { message: "Invalid parameters" });
            return;
        }

        if (!checkUserPermission(socket, "party-lock")) {
            socket.emit("error", { message: "Cant lock room, missing permission" });
            return;
        }

        if (!checkUserPermissionsRoom(socket, roomCode)) {
            socket.emit("error", { message: "You dont belong in this room" });
            return;
        }

        if (isUserOwnerInRoom(socket, roomCode)) {
            globals.rooms[roomCode].ownerLocked = isLock;
        } else {
            globals.rooms[roomCode].joinerLocked = isLock;
        }
    })

    socket.on("start-finalizing", (roomCode) => {
        if (!roomCode) {
            socket.emit("error", { message: "Invalid parameters" });
            return;
        }

        if (!checkUserPermission(socket, "party-lock")) {
            socket.emit("error", { message: "Cant finalize room, missing permission" });
            return;
        }

        if (!checkUserPermissionsRoom(socket, roomCode)) {
            socket.emit("error", { message: "You dont belong in this room" });
            return;
        }

        if (isUserOwnerInRoom(socket, roomCode)) {
            //FinalLock the room
            //Do all the neccesary prechecks - one place to avoid checking every update

        } else {
            socket.emit("error", { message: "Only the owner can finalize" });
        }
    })

    // Clean up when a user disconnects
    socket.on('room-disconnect', () => {
        try {
            for (const roomCode in globals.rooms) {
                if (globals.rooms[roomCode].owner.id === socket.id) {
                    delete globals.rooms[roomCode];
                } else if (globals.rooms[roomCode].joiner.id === socket.id) {
                    io.to(roomCode).emit('user-left', globals.rooms[roomCode].joinerParsed);
                    globals.rooms[roomCode].joiner = undefined;
                    globals.rooms[roomCode].joinerParsed = undefined;
                }
            }
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('chat-message', (roomCode, message) => {
        io.to(roomCode).emit('chat-message', message);
    });

    // Modify the items array
    socket.on('update-items', (roomCode, newItemsArray) => {
        if (!roomCode || !newItemsArray || !newItemsArray.length || newItemsArray.length < 1) {
            socket.emit("error", { message: "Invalid parameters" });
            return;
        }

        if (!checkUserPermission(socket, "update-items")) {
            socket.emit("error", { message: "Cant update items, missing permission" });
            return;
        }

        if (!checkUserPermissionsRoom(socket, roomCode)) {
            socket.emit("error", { message: "You dont belong in this room" });
            return;
        }

        if (globals.rooms[roomCode]) {
            globals.rooms[roomCode].ownerLocked = false;
            globals.rooms[roomCode].joinerLocked = false;

            if (isUserOwnerInRoom(socket, roomCode)) {
                globals.rooms[roomCode].itemsArray = newItemsArray;

            } else {
                globals.rooms[roomCode].itemsArray = newItemsArray;

            }
            io.to(roomCode).emit('items-updated', newItemsArray);
        }
    });

    socket.on("toggle-lock", (roomCode) => {
        if (!roomCode) {
            return;
        }

        if (!checkUserPermissionsRoom(socket, roomCode))
            return;

        if (globals.rooms[roomCode]) {
            if (isUserOwnerInRoom(socket, roomCode))
                globals.rooms[roomCode].ownerLocked = !globals.rooms[roomCode].ownerLocked;
            else
                globals.rooms[roomCode].joinerLocked = !globals.rooms[roomCode].ownerLocked;

            if (globals.rooms[roomCode].ownerLocked && globals.rooms[roomCode].joinerLocked) {
                //Finallock? - not unlockable
            }

            io.to(roomCode).emit('items-locked', { ownerLocked: globals.rooms[roomCode].ownerLocked, joinerLocked: globals.rooms[roomCode].joinerLocked });
        }
    })

    //Send trade proposal to joiner, from owner
    //Validate the proposal
    socket.on("send-proposal", (roomCode, proposal) => {
        if (!roomCode || proposal === undefined) {
            socket.emit("error", { message: "Invalid parameters" });
            return;
        }

        if (!checkUserPermission(socket, "send-proposal")) {
            socket.emit("error", { message: "Cant send proposal, missing permission" });
            return;
        }

        if (globals.rooms[roomCode]) {
            if (!checkUserPermissionsRoom(socket, roomCode)) {
                socket.emit("error", { message: "You dont belong in this room" });
                return;
            }

            if (!isUserOwnerInRoom(socket, roomCode)) {
                //Validate the proposal
                //Make api calls to data server
                //If valid, send to joiner

                io.to(globals.rooms[roomCode].joiner).emit('receive-proposal', proposal);
            } else {
                socket.emit("error", { message: "Only joiner can send proposal" });
            }
        }
    })
};

module.exports = { setupRoomRoutes };
