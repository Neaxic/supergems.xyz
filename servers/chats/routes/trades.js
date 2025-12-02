const helpers = require("../util/helpers");
const globals = require("../util/globals");

const setupTradeRoutes = (socket, checkUserPermission) => {
  socket.on("send-request", async ({ address }) => {
    if (!checkUserPermission(socket, 'sendRequest')) {
      socket.emit("error", { message: "Unauthorized to send requests" });
      return;
    }

    const senderUser = helpers.userWithoutSensitive(socket.user);
    if (socket.user.blacklisted === true) return;
    const foundUser = globals.users.find((u) => u.address === address);

    if (foundUser && foundUser !== undefined) {
      if (foundUser.ignoreTradeReq === true) return;
      const sendToSocketId = foundUser.socketId;
      console.log(
        "TRADE REQ -> " + senderUser.address + " > " + foundUser.address,
      );
      // Send request to the receiver
      socket.broadcast.to(sendToSocketId).emit("request-received", senderUser);
      // socket.broadcast.emit("request-received", senderUser);
    }
  });

  socket.on("request-response", async function ({ accepted, to, chain }) {
    if (!checkUserPermission(socket, 'requestResponse')) {
      socket.emit("error", { message: "Unauthorized to recive responses" });
      return;
    }
    const foundUser = globals.users.find((u) => u.address === to);

    if (foundUser) {
      if (foundUser.ignoreTradeReq === true) return;

      if (accepted == true) {
        // socket.broadcast.to(foundUser.socketId).emit("request-response", {
        //   accepted: true,
        //   from: {
        //     address: socket.user.address,
        //     name: socket.user.name,
        //   },
        // });

        // Generating the room, id, users, expiery, created, and messages
        const roomID = Math.random().toString(36).substring(2, 15);
        const expiery = Date.now() + 1000 * 60 * 60 * 24;
        const room = {
          id: roomID,
          proposer: foundUser.address,
          users: [
            {
              address: socket.user.address,
              socket: socket.id,
            },
            {
              address: foundUser.address,
              socket: foundUser.socketId,
            },
          ],
          nfts: [
            {
              address: socket.user.address,
              lock: false,
              nfts: [],
            },
            {
              address: foundUser.address,
              lock: false,
              nfts: [],
            },
          ],
          chain: chain,
          expiery: expiery,
          created: Date.now(),
          messages: [],
        };
        globals.tradeRooms.push(room);

        // socket.broadcast.to(foundUser.socketId).emit("request-response", {
        //   accepted: true,
        //   from: {
        //     address: socket.user.address,
        //     name: socket.user.name,
        //   },
        // });

        socket.broadcast.to(foundUser.socketId).emit("trade-room-created", {
          id: roomID,
          proposer: room.proposer,
          otherParty: {
            address: socket.user.address,
            name: socket.user.name,
            avatar: socket.user.avatar,
          },
          expierty: expiery,
        });

        socket.emit("trade-room-created", {
          id: roomID,
          proposer: room.proposer,
          otherParty: {
            address: foundUser.address,
            name: foundUser.name,
            avatar: foundUser.avatar,
          },
          expierty: expiery,
        });

        console.log(
          "TRADE ROOM CREATED -> " +
          roomID +
          ", -> [" +
          foundUser.address +
          ", " +
          socket.user.address +
          "]",
        );
      } else if (accepted == false) {
        socket.broadcast.to(foundUser.socketId).emit("request-response", {
          accepted: false,
          from: {
            address: socket.user.address,
            name: socket.user.name,
          },
        });
        // socket.emit('requestResponse', { accepted: false, from: data.from })
        console.log("TRADE REQ RES -> " + socket.user.address + " DECLINED");
      }
    }
  });

  socket.on("action-item", async function ({ id, item }) {
    if (!checkUserPermission(socket, 'actionItem')) {
      socket.emit("error", { message: "Unauthorized to modify trade" });
      return;
    }
    const room = globals.tradeRooms.find((r) => r.id === id);
    if (room) {
      //Sender is not in the room himself
      if (!room.users.find((u) => u.address === socket.user.address)) return;

      //Is reciver in the room
      const otherUser = room.users.find(
        (u) => u.address !== socket.user.address,
      );

      if (otherUser) {
        let curr = room.nfts.find((o) => o.address == socket.user.address);
        //Your lock is on, and you cant add or remove anything to your nfts arr
        if (curr.lock === true) return;

        if (item.action === "add") {
          const docName = `${item.address}_${item.token_id}`;
          const senderItem = await db.doc(`users/${socket.user.address}`).collection("nfts").doc(room.chain).collection("nfts").doc(docName).get();

          // let senderItem = senderDB
          //   .data()
          //   .nfts.find(
          //     (nft) =>
          //       nft.contract_address === item.address &&
          //       nft.token_id === item.token_id,
          //   );

          if (!senderItem) return;

          if (
            curr.nfts.find(
              (nft) =>
                nft.contract_address === senderItem.contract_address &&
                nft.token_id === senderItem.token_id,
            )
          ) {
            return;
          }
          curr.nfts.push(senderItem);
        } else if (item.action === "remove") {
          const index = curr.nfts.findIndex(
            (nft) =>
              nft.contract_address === item.address &&
              nft.token_id === item.token_id,
          );

          if (index !== -1) {
            curr.nfts.splice(index, 1);
          }
        }
        room.nfts.find((o) => o.address === socket.user.address).nfts =
          curr.nfts;

        console.log(
          "ACTION ITEM -> ROOM: " +
          id +
          ", " +
          item.action +
          ", " +
          item.address,
        );

        console.log(room.nfts);
        //Open all locks, since a change has happend
        room.nfts.forEach((nft) => {
          nft.lock = false;
        });

        socket.broadcast.to(otherUser.socket).emit("update-items", room.nfts);
        socket.emit("update-items", room.nfts);
      }
    }
  });

  socket.on("action-lock", async function ({ id, lock }) {
    if (!checkUserPermission(socket, 'actionLock')) {
      socket.emit("error", { message: "Unauthorized to lock trade" });
      return;
    }
    const room = globals.tradeRooms.find((r) => r.id === id);
    if (room) {
      //Sender is not in the room himself
      if (!room.users.find((u) => u.address === socket.user.address)) return;

      //Is reciver in the room
      const otherUser = room.users.find(
        (u) => u.address !== socket.user.address,
      );

      if (otherUser) {
        room.nfts.find((o) => o.address === socket.user.address).lock = lock;

        console.log(
          "ACTION LOCK -> ROOM: " +
          id +
          ", ADDY: " +
          socket.user.address +
          ", LOCK: " +
          lock,
        );

        socket.broadcast.to(otherUser.socket).emit("update-items", room.nfts);
        socket.emit("update-items", room.nfts);
      }
    }
  });

  socket.on("action-proposal-sent", async function ({ id, hash }) {
    if (!checkUserPermission(socket, 'actionProposalSent')) {
      socket.emit("error", { message: "Unauthorized to send trade" });
      return;
    }
    const room = globals.tradeRooms.find((r) => r.id === id);
    if (room) {
      //Sender is not in the room himself
      if (!room.users.find((u) => u.address === socket.user.address)) return;

      //Is reciver in the room
      const otherUser = room.users.find(
        (u) => u.address !== socket.user.address,
      );
      if (!otherUser) return;

      //Checking locks are on, and nfts are present
      let curr = room.nfts.find((o) => o.address == socket.user.address);
      if (curr.lock === false) return;
      if (curr.nfts.length <= 0 || curr.nfts.length >= 10) return;

      let other = room.nfts.find((o) => o.address == otherUser.address);
      if (other.lock === false) return;
      if (other.nfts.length <= 0 || other.nfts.length >= 10) return;

      //All chekcs are good, should be correct room, w. all criteria, send hash to other user
      socket.broadcast.to(otherUser.socket).emit("proposal-recived", hash);

      //Delete room
      globals.tradeRooms = globals.tradeRooms.filter((r) => r.id !== id);

      console.log("TRADE DONE -> " + id + ", HASH: " + hash);
    }
  });
};

module.exports = { setupTradeRoutes };