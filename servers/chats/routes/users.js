const globals = require("../util/globals");

const setupUserRoutes = (socket, checkUserPermission) => {
    socket.on("new-user", async (user) => {
        if (!user || !user.address) return;
        if (!checkUserPermission(socket, "new-user")) {
            socket.emit("error", { message: "Unauthorized to give reputation" });
            return;
        }

        const userdb = await globals.db.doc(`users/${user.address.toLowerCase()}`).get();
        const userData = userdb.data();
        let userWithoutSensitiveData = userWithoutSensitive(userData);
        userWithoutSensitiveData = {
            ...user,
            ...userWithoutSensitiveData,
        };

        const existingUserIndex = globals.users.findIndex(u => u.socketId === socket.id);
        if (existingUserIndex !== -1) {
            globals.users[existingUserIndex] = { ...userWithoutSensitiveData, socketId: socket.id };
        } else {
            globals.users.push({ ...userWithoutSensitiveData, socketId: socket.id });
        }

        socket.user = userWithoutSensitiveData;
        socket.emit("user-connected", userWithoutSensitiveData);
        socket.broadcast.emit("active-count", globals.users.length);
    });

    socket.on("give-rep", async (address) => {
        if (!checkUserPermission(socket, "giveRep")) {
            socket.emit("error", { message: "Unauthorized to give reputation" });
            return;
        }

        if (address === socket.user.address) return;

        const senderReps = await globals.db.doc(`users/${socket.user.address}`).get();
        const repsLeft = senderReps.data().repsLeft;
        if (repsLeft <= 0) {
            socket.emit("error", { message: "No reputation points left to give" });
            return;
        }

        const userIndex = globals.users.findIndex(u => u.address === address);
        if (userIndex !== -1) {
            let newRep = (globals.users[userIndex].rep || 0) + 1;
            globals.users[userIndex].rep = newRep;
            await globals.db.doc(`users/${address}`).update({ rep: newRep });

            const newRepsLeft = repsLeft - 1;
            await globals.db.doc(`users/${socket.user.address}`).update({ repsLeft: newRepsLeft });
            if (newRepsLeft <= 0) {
                await globals.db.doc(`users/${socket.user.address}`).update({ repsUsed: new Date() });
            }

            socket.emit("rep-given", { address, newRep });
        }
    });

    socket.on("ban-user", async (address) => {
        if (!checkUserPermission(socket, "banUser")) {
            socket.emit("error", { message: "Unauthorized to ban users" });
            return;
        }

        const userRole = await getUserRole(socket.user.address);
        if (userRole !== "ADMIN") {
            socket.emit("error", { message: "Only admins can ban users" });
            return;
        }

        const userIndex = globals.users.findIndex(u => u.address === address);
        if (userIndex !== -1) {
            await globals.db.doc(`users/${address}`).update({ blacklist: true });
            globals.users = globals.users.filter(user => user.address !== address);
            socket.broadcast.emit("user-banned", address);
            socket.broadcast.emit("active-count", globals.users.length);
        }
    });

    socket.on("get-user", async (address) => {
        if (!checkUserPermission(socket, "getUser")) {
            socket.emit("error", { message: "Unauthorized to get user information" });
            return;
        }

        const user = await globals.db.doc(`users/${address}`).get();
        socket.emit("user-info", {
            ...user.data(),
            online: globals.users.findIndex(u => u.address === address) !== -1,
        });
    });

    socket.on("is-users-online", async (addresses) => {
        if (!checkUserPermission(socket, "is-users-online")) {
            socket.emit("error", { message: "Unauthorized to check user status" });
            return;
        }

        const online = addresses.map(address =>
            globals.users.findIndex(u => u.address === address) !== -1
        );
        socket.emit("users-online-status", online);
    });
};

const userWithoutSensitive = (user) => {
    return {
        name: user.name,
        avatar: user.avatar,
        address: user.address,
        role: user.role,
        rep: user.rep,
        stats: user.stats,
    };
};

const getUserRole = async (address) => {
    const res = await globals.db.doc(`users/${address}`).get();
    return res.data().role;
};

module.exports = { setupUserRoutes };