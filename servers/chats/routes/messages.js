const globals = require("../util/globals");
const { userWithoutSensitive } = require("../util/helpers");

const setupMessageRoutes = (socket, checkUserPermission) => {
    socket.on("new-message", async (message) => {
        if (!checkUserPermission(socket, "sendMessage")) {
            socket.emit("error", { message: "Unauthorized to send messages" });
            return;
        }

        if (await checkIfUserIsBanned(socket.user.address)) {
            socket.emit("error", { message: "You are banned from sending messages" });
            return;
        }

        const messageData = {
            user: userWithoutSensitive(socket.user),
            message,
            timestamp: new Date(),
        };
        globals.messages.push(messageData);
        if (globals.messages.length > 100) {
            globals.messages.shift();
        }

        console.log("new-message", messageData);
        socket.emit("broadcast-message", messageData);
        socket.broadcast.emit("broadcast-message", messageData);
    });

    socket.on("get-message-history", () => {
        if (!checkUserPermission(socket, "viewMessageHistory")) {
            socket.emit("error", { message: "Unauthorized to send messages" });
            return;
        }

        socket.emit("message-history", globals.messages);
    });
};

const checkIfUserIsBanned = async (address) => {
    const res = await globals.db.doc(`users/${address}`).get();
    return res.data().blacklist;
};

module.exports = { setupMessageRoutes };